import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import http from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws'; // Fixed import path
import { makeExecutableSchema } from '@graphql-tools/schema';
import connectDB from './utils/db';
import { userTypeDefs } from './schemas/userSchema';
import { recommendationTypeDefs } from './schemas/recommendationSchema';
import { exerciseTypeDefs } from './schemas/exerciseSchema';
import { nutritionTypeDefs } from './schemas/nutritionSchema';
import { userResolvers } from './resolvers/userResolver';
import { recommendationResolvers } from './resolvers/recommendationResolver';
import { exerciseResolvers } from './resolvers/exerciseResolver';
import { nutritionResolvers } from './resolvers/nutritionResolver';
import dotenv from 'dotenv';

const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const app = express();
const httpServer = http.createServer(app);

// Enhanced CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://10.0.2.2:3000',
    'http://localhost:8081', // Metro bundler default
    'http://127.0.0.1:8081',
    'http://10.0.2.2:8081',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// JWT verification function
const getUser = async (token: string) => {
  try {
    if (!token) return null;

    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace('Bearer ', '');

    // Verify the token
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET || 'your-secret-key') as any;

    console.log('Decoded token:', decoded);

    return {
      userId: decoded.userId,
    };
  } catch (error) {
    console.error('JWT verification error:', error);
    return null;
  }
};

// Create executable schema
const schema = makeExecutableSchema({
  typeDefs: [userTypeDefs, recommendationTypeDefs, exerciseTypeDefs, nutritionTypeDefs],
  resolvers: [userResolvers, recommendationResolvers, exerciseResolvers, nutritionResolvers],
});

// Set up WebSocket server for subscriptions
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

// Integrate WebSocket with Apollo
const wsServerCleanup = useServer(
  {
    schema,
    context: async (ctx: any) => {
      // Extract token from connectionParams for subscriptions
      const token = ctx.connectionParams?.authorization || '';
      const user = await getUser(token);
      return { user };
    },
    onConnect: async (ctx: any) => {
      console.log('WebSocket connected:', ctx.connectionParams);
    },
    onDisconnect: () => {
      console.log('WebSocket disconnected');
    },
  },
  wsServer
);

const server = new ApolloServer({
  schema,
  formatError: (err) => {
    console.error('GraphQL Error:', err);
    return {
      message: err.message,
      locations: err.locations,
      path: err.path,
      extensions: {
        code: err.extensions?.code,
        timestamp: new Date().toISOString(),
      },
    };
  },
  introspection: process.env.NODE_ENV !== 'production',
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await wsServerCleanup.dispose();
          },
        };
      },
    },
    {
      async requestDidStart() {
        return {
          async didReceiveRequest(requestContext: any) {
            console.log('GraphQL Request received:', {
              query: requestContext.request.query,
              variables: requestContext.request.variables,
            });
          },
          async didEncounterErrors(requestContext) {
            console.error('GraphQL Errors:', requestContext.errors);
          },
        };
      },
    },
  ],
});

const startServer = async () => {
  try {
    await server.start();
    console.log('Apollo Server started successfully');

    app.use('/graphql', expressMiddleware(server, {
      context: async ({ req }) => {
        // Extract token from Authorization header
        const token = req.headers.authorization || '';

        console.log('Authorization header:', token);

        // Get user from token
        const user = await getUser(token);

        console.log('Context user:', user);

        return {
          headers: req.headers,
          user,
        };
      },
    }));

    await connectDB();
    console.log('Database connected successfully');

    const PORT = Number(process.env.PORT) || 4000;
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running at:`);
      console.log(` • Local: http://localhost:${PORT}/graphql`);
      console.log(` • Network: http://0.0.0.0:${PORT}/graphql`);
      console.log(` • Android Emulator: http://10.0.2.2:${PORT}/graphql`);
      console.log(` • WebSocket Subscriptions: ws://localhost:${PORT}/graphql`);
      console.log(` • Health Check: http://localhost:${PORT}/health`);
      console.log(` • Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
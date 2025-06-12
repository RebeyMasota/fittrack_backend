import User, { IUser } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { createInitialUserMetrics } from '../utils/userMetricsHelper';

const generateToken = (userId: string) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET || 'your-secret-key', 
    { expiresIn: '30d' }
  );
};

const formatUser = (user: IUser) => {
  const userObj = user.toObject();
  return {
    id: userObj._id.toString(),
    email: userObj.email,
    name: userObj.name || '', // handle undefined
    age: userObj.age || null,
    weight: userObj.weight || null,
    height: userObj.height || null,
    gender: userObj.gender || null,
    fitnessGoal: userObj.fitnessGoal || null,
    dietaryPreference: userObj.dietaryPreference || null,
    healthConditions: userObj.healthConditions || [],
    activityLevel: userObj.activityLevel || null,
    preferredWorkoutTypes: userObj.preferredWorkoutTypes || [],
    dietaryRestrictions: userObj.dietaryRestrictions || [],
    bmi: userObj.bmi || null,
    role: userObj.role || 'user', // default to 'user' if undefined
    isProfileComplete: userObj.isProfileComplete,
    createdAt: userObj.createdAt,
    updatedAt: userObj.updatedAt,
  };
};


export const userResolvers = {
  Query: {
    getUser: async (_: any, { email }: { email: string }) => {
      return await User.findOne({ email });
    },

    getCurrentUser: async (_: any, __: any, { user }: { user?: any }) => {
      if (!user) {
        throw new Error('Authentication required');
      }
      return await User.findById(user.userId);
    },
  },

  Mutation: {
    registerUser: async (
      _: any,
      { email, password }: { email: string; password: string }
    ) => {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          throw new Error('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user with minimal info
        const user = new User({
          email: email.toLowerCase(),
          password: hashedPassword,
          isProfileComplete: false,
        });

        const savedUser = await user.save();
        const token = generateToken((savedUser._id as Types.ObjectId).toString());

        return {
          user: {
            ...savedUser.toObject(),
            id: savedUser._id as Types.ObjectId,
            token,
          },
          token,
        };
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message || 'Registration failed');
        }
        throw new Error('Registration failed');
      }
    },

    completeProfile: async (
      _: any,
      {
        name,
        age,
        weight,
        height,
        gender,
        fitnessGoal,
        dietaryPreference,
        healthConditions,
        activityLevel,
        preferredWorkoutTypes,
        dietaryRestrictions,
      }: {
        name: string;
        age: number;
        weight: number;
        height: number;
        gender: string;
        fitnessGoal: string;
        dietaryPreference: string;
        healthConditions: string[];
        activityLevel: string;
        preferredWorkoutTypes: string[];
        dietaryRestrictions: string[];
      },
      { user }: { user?: any }
    ) => {
      console.log('completeProfile context user:', user);
      if (!user) {
        throw new Error('Authentication required');
      }

      try {
        const updatedUser = await User.findByIdAndUpdate(
          user.userId,
          {
            name,
            age,
            weight,
            height,
            gender,
            fitnessGoal,
            dietaryPreference,
            healthConditions,
            activityLevel,
            preferredWorkoutTypes,
            dietaryRestrictions,
            isProfileComplete: true,
            updatedAt: new Date(),
          },
          { new: true }
        );

        if (!updatedUser) {
          throw new Error('User not found');
        }

        // Add this line to create initial metrics
        await createInitialUserMetrics(updatedUser);

        return updatedUser;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message || 'Profile completion failed');
        }
        throw new Error('Profile completion failed');
      }
    },

    updateProfile: async (
      _: any,
      updateData: {
        name?: string;
        age?: number;
        weight?: number;
        height?: number;
        fitnessGoal?: string;
        dietaryPreference?: string;
        healthConditions?: string[];
        activityLevel?: string;
        preferredWorkoutTypes?: string[];
        dietaryRestrictions?: string[];
      },
      { user }: { user?: any }
    ) => {
      if (!user) {
        throw new Error('Authentication required');
      }

      try {
        const updatedUser = await User.findByIdAndUpdate(
          user.userId,
          {
            ...updateData,
            updatedAt: new Date(),
          },
          { new: true }
        );

        if (!updatedUser) {
          throw new Error('User not found');
        }

        return updatedUser;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message || 'Profile update failed');
        }
        throw new Error('Profile update failed');
      }
    },

    loginUser: async (
      _: any,
      { email, password }: { email: string; password: string }
    ) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase() });
        console.log('Login attempt for user:', email.toLowerCase());
        if (!user) {
          throw new Error('Invalid credentials');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          console.log('Invalid password for user:', user.email);
          throw new Error('Invalid credentials');
        }

        const token = generateToken((user._id as Types.ObjectId).toString());

        return {
          user:formatUser(user),
          token,
        };
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message || 'Login failed');
        }
        throw new Error('Login failed');
      }
    },
  },
};
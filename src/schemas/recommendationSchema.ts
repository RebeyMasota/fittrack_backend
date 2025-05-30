// backend/src/schemas/recommendationSchema.ts
import { gql } from 'graphql-tag';

export const recommendationTypeDefs = gql`
  type Recommendation {
    id: ID!
    title: String!
    description: String!
    type: String!
    category: String!
    priority: Int!
    media: String
    frequency: String!
  }

  type UserMetrics {
    steps: Int!
    stepsGoal: Int!
    sleepHours: Float!
    sleepGoal: Float!
    nutritionKcal: Int!
    nutritionGoal: Int!
    waterLiters: Float!
    waterGoal: Float!
  }

  type Query {
    getRecommendations(email: String!, category: String): [Recommendation!]!
    getUserMetrics(email: String!): UserMetrics!
  }

  type Mutation {
    logMeal(email: String!, kcal: Int!): Boolean!
    addWater(email: String!, liters: Float!): UserMetrics!
    trackHeartRate(email: String!): Boolean!
  }

  type Subscription {
    onRecommendationUpdate(email: String!): [Recommendation!]!
  }
`;
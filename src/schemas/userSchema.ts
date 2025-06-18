// backend/src/schemas/userSchema.ts
import { gql } from 'graphql-tag';

export const userTypeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String
    age: Int
    weight: Float
    height: Float
    gender: String
    fitnessGoal: String
    dietaryPreference: String
    healthConditions: [String!]
    activityLevel: String
    preferredWorkoutTypes: [String!]
    dietaryRestrictions: [String!]
    bmi: Float
    role: String
    isProfileComplete: Boolean!
    token: String
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    user: User!
    token: String!
  }

  type Query {
    getUser(email: String!): User
    getCurrentUser: User
  }

  type Mutation {
    registerUser(email: String!, password: String!): AuthPayload
    completeProfile(
      name: String!
      age: Int!
      weight: Float!
      height: Float!
      gender: String
      fitnessGoal: String!
      dietaryPreference: String!
      healthConditions: [String!]
      activityLevel: String
      preferredWorkoutTypes: [String!]
      dietaryRestrictions: [String!]
    ): User
    updateProfile(
      name: String
      age: Int
      weight: Float
      height: Float
      gender: String
      fitnessGoal: String
      dietaryPreference: String
      healthConditions: [String!]
      activityLevel: String
      preferredWorkoutTypes: [String!]
      dietaryRestrictions: [String!]
    ): User
    loginUser(email: String!, password: String!): AuthPayload
  }
`;
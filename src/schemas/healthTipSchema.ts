import { gql } from 'graphql-tag';

export const healthTipTypeDefs = gql`
  type Range {
    min: Float
    max: Float
  }

  type HealthTip {
    id: ID!
    title: String!
    description: String!
    category: String!
    icon: String!
    image: String
    link: String

    # Filtering fields
    fitnessGoal: String
    ageRange: Range
    gender: String
    healthConditions: [String]
    weightRange: Range
    activityLevel: String
    dietaryPreference: String
    dietaryRestrictions: [String]
    preferredWorkoutTypes: [String]

    createdAt: String!
    updatedAt: String!
  }

  input RangeInput {
    min: Float
    max: Float
  }

  input HealthTipInput {
    title: String!
    description: String!
    category: String!
    icon: String!
    image: String
    link: String

    # Filtering fields
    fitnessGoal: String
    ageRange: RangeInput
    gender: String
    healthConditions: [String]
    weightRange: RangeInput
    activityLevel: String
    dietaryPreference: String
    dietaryRestrictions: [String]
    preferredWorkoutTypes: [String]
  }

  type Query {
    getHealthTips: [HealthTip!]!
    getHealthTip(id: ID!): HealthTip
  }

  type Mutation {
    createHealthTip(input: HealthTipInput!): HealthTip!
    updateHealthTip(id: ID!, input: HealthTipInput!): HealthTip!
    deleteHealthTip(id: ID!): Boolean!
  }
`;
import { gql } from 'graphql-tag';

export const didYouKnowTypeDefs = gql`
  type Range {
    min: Float
    max: Float
  }

  type DidYouKnow {
    id: ID!
    fact: String!
    source: String!
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

  input DidYouKnowInput {
    fact: String!
    source: String!
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
    getDidYouKnow: [DidYouKnow!]!
    getDidYouKnowItem(id: ID!): DidYouKnow
    getAllDidYouKnow(fitnessGoal: String): [DidYouKnow!]!
  }

  type Mutation {
    createDidYouKnow(input: DidYouKnowInput!): DidYouKnow!
    updateDidYouKnow(id: ID!, input: DidYouKnowInput!): DidYouKnow!
    deleteDidYouKnow(id: ID!): Boolean!
  }
`;
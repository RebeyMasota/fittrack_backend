import { gql } from 'graphql-tag';

export const recommendationTypeDefs = gql`
  type Article {
    title: String!
    url: String!
  }

  type Macros {
    protein: Float
    carbs: Float
    fat: Float
  }

  type Range {
    min: Float
    max: Float
  }

  type Step {
    title: String!
    description: String!
    image: String
    duration: Int
  }

  type Recommendation {
    id: ID!
    category: String!
    title: String!
    description: String!
    image: String
    steps: [Step]
    tips: [String]
    articles: [Article]
    macros: Macros
    calories: Int
    reminders: [String]
    dailyGoalMl: Int
    sleepGoalHours: Float
    fitnessGoal: String
    ageRange: Range
    gender: String
    healthConditions: [String]
    weightRange: Range
    activityLevel: String
    dietaryPreference: String
    preferredWorkoutTypes: [String]
    dietaryRestrictions: [String]
    createdAt: String!
    updatedAt: String!
  }

  input RangeInput {
    min: Float
    max: Float
  }

  input ArticleInput {
    title: String!
    url: String!
  }

  input MacrosInput {
    protein: Float
    carbs: Float
    fat: Float
  }

  input StepInput {
    title: String!
    description: String!
    image: String
    duration: Int
  }

  input RecommendationInput {
    category: String!
    title: String!
    description: String!
    image: String
    steps: [StepInput]      # Updated: steps is now an array of StepInput objects
    tips: [String]
    articles: [ArticleInput]
    macros: MacrosInput
    calories: Int
    reminders: [String]
    dailyGoalMl: Int
    sleepGoalHours: Int

    # Filtering fields
    fitnessGoal: String
    ageRange: RangeInput
    gender: String
    healthConditions: [String]
    weightRange: RangeInput
    activityLevel: String
    dietaryPreference: String
    preferredWorkoutTypes: [String]
    dietaryRestrictions: [String]
  }

  type Query {
    getRecommendations: [Recommendation!]!
    getRecommendation(id: ID!): Recommendation
  }

  type Mutation {
    createRecommendation(input: RecommendationInput!): Recommendation!
    updateRecommendation(id: ID!, input: RecommendationInput!): Recommendation!
    deleteRecommendation(id: ID!): Boolean!
  }
`;
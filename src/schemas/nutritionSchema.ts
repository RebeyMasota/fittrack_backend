// backend/src/schemas/nutritionSchema.ts
import { gql } from 'graphql-tag';

export const nutritionTypeDefs = gql`
  type Macros {
    protein: Float!
    carbs: Float!
    fats: Float!
  }

  type Meal {
    id: ID!
    name: String!
    calories: Int!
    macros: Macros!
    dietaryTags: [String!]!
    prepInstructions: String!
    imageUrl: String
  }

  type Query {
    getMeals(
      dietaryTags: [String!]
      minProtein: Int
      maxCalories: Int
    ): [Meal!]!
  }

  type Mutation {
    logMeal(
      email: String!
      mealId: ID!
      calories: Int!
      macros: MacrosInput!
    ): Boolean!
  }

  input MacrosInput {
    protein: Float!
    carbs: Float!
    fats: Float!
  }
`;
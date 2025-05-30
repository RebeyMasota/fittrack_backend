// backend/src/schemas/exerciseSchema.ts
import { gql } from 'graphql-tag';

export const exerciseTypeDefs = gql`
  type Exercise {
    id: ID!
    name: String!
    type: String!
    muscleGroup: String!
    difficulty: String!
    equipmentNeeded: [String!]!
    instructions: [String!]!
    gifUrl: String
  }

  type Query {
    getExercises(
      type: String
      muscleGroup: String
      difficulty: String
      equipment: String
    ): [Exercise!]!
  }

  type Mutation {
    logWorkout(
      email: String!
      exerciseId: ID!
      duration: Int!
      repetitions: Int
      sets: Int
    ): Boolean!
  }
`;
// backend/src/schemas/healthTipSchema.ts
import { gql } from 'graphql-tag';

export const healthTipTypeDefs = gql`
  enum HealthTipCategory {
    nutrition
    exercise
    sleep
    mental
    hydration
  }

  type HealthTip {
    id: ID!
    title: String!
    description: String!
    category: HealthTipCategory!
    icon: String!
    image: String
    link: String
  }

  type Query {
    getHealthTips(category: HealthTipCategory): [HealthTip!]!
    getHealthTip(id: ID!): HealthTip
  }

  input HealthTipInput {
    title: String!
    description: String!
    category: HealthTipCategory!
    icon: String!
    image: String
    link: String
  }

  type Mutation {
    createHealthTip(input: HealthTipInput!): HealthTip!
    updateHealthTip(id: ID!, input: HealthTipInput!): HealthTip!
    deleteHealthTip(id: ID!): Boolean!
  }
`;
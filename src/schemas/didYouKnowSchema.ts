// backend/src/schemas/didYouKnowSchema.ts
import { gql } from 'graphql-tag';

export const didYouKnowTypeDefs = gql`
  type DidYouKnow {
    id: ID!
    fact: String!
    source: String!
    image: String
    link: String
  }

  type Query {
    getDidYouKnows: [DidYouKnow!]!
    getDidYouKnow(id: ID!): DidYouKnow
  }

  input DidYouKnowInput {
    fact: String!
    source: String!
    image: String
    link: String
  }

  type Mutation {
    createDidYouKnow(input: DidYouKnowInput!): DidYouKnow!
    updateDidYouKnow(id: ID!, input: DidYouKnowInput!): DidYouKnow!
    deleteDidYouKnow(id: ID!): Boolean!
  }
`;
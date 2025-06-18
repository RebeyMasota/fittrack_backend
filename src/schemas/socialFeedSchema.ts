import { gql } from 'graphql-tag';

export const socialFeedTypeDefs = gql`
  type User {
    id: ID!
    name: String!
    avatar: String
  }

  type FeedComment {
    user: User!
    comment: String!
    createdAt: String!
  }

  type FeedPost {
    id: ID!
    user: User!
    content: String!
    createdAt: String!
    image: String
    likes: Int!
    likedByCurrentUser: Boolean!
    comments: [FeedComment!]!
    activityType: String
    activityValue: String
  }

  input FeedPostInput {
    user: ID!
    content: String!
    image: String
    activityType: String
    activityValue: String
  }

  input UpdateFeedPostInput {
    content: String
    image: String
    activityType: String
    activityValue: String
  }

  type Query {
    getSocialFeed: [FeedPost!]!
    getFeedPost(id: ID!): FeedPost
  }

  type Mutation {
    createFeedPost(input: FeedPostInput!): FeedPost!
    updateFeedPost(id: ID!, input: UpdateFeedPostInput!): FeedPost!
    likeFeedPost(id: ID!): FeedPost!
    commentFeedPost(id: ID!, comment: String!): FeedPost!
    deleteFeedPost(id: ID!): Boolean!
  }
`;
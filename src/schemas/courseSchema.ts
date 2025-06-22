import { gql } from 'graphql-tag';

export const courseTypeDefs = gql`
  type Range {
    min: Float
    max: Float
  }

  type Step {
    id: String!
    title: String!
    content: String!
    illustration: String
    videoUrl: String
  }

  type Topic {
    id: String!
    title: String!
    description: String
    steps: [Step!]!
  }

  type Course {
    id: ID!
    goal: String!
    title: String!
    description: String!
    level: String!
    coverImage: String
    topics: [Topic!]!

    # Filtering fields
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

  input StepInput {
    id: String!
    title: String!
    content: String!
    illustration: String
    videoUrl: String
  }

  input TopicInput {
    id: String!
    title: String!
    description: String
    steps: [StepInput!]!
  }

  input CourseInput {
    goal: String!
    title: String!
    description: String!
    level: String!
    coverImage: String
    topics: [TopicInput!]!

    # Filtering fields
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
    getCourses: [Course!]!
    getCourse(id: ID!): Course
    getAllCourses(goal: String): [Course!]!
  }

  type Mutation {
    createCourse(input: CourseInput!): Course!
    updateCourse(id: ID!, input: CourseInput!): Course!
    deleteCourse(id: ID!): Boolean!
  }
`;
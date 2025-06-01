// backend/src/schemas/courseSchema.ts
import { gql } from 'graphql-tag';

export const courseTypeDefs = gql`
  enum FitnessGoal {
    "Lose Weight"
    "Gain Muscle"
    "Maintain Health"
  }

  enum CourseLevel {
    Beginner
    Intermediate
    Advanced
  }

  type CourseStep {
    id: String!
    title: String!
    content: String!
    illustration: String
    videoUrl: String
    completed: Boolean
  }

  type CourseTopic {
    id: String!
    title: String!
    description: String
    steps: [CourseStep!]!
    completed: Boolean
  }

  type Course {
    id: ID!
    goal: FitnessGoal!
    title: String!
    description: String!
    level: CourseLevel!
    coverImage: String
    topics: [CourseTopic!]!
  }

  type Query {
    getCourses(goal: FitnessGoal, level: CourseLevel): [Course!]!
    getCourse(id: ID!): Course
  }

  input CourseStepInput {
    id: String!
    title: String!
    content: String!
    illustration: String
    videoUrl: String
    completed: Boolean
  }

  input CourseTopicInput {
    id: String!
    title: String!
    description: String
    steps: [CourseStepInput!]!
    completed: Boolean
  }

  input CourseInput {
    goal: FitnessGoal!
    title: String!
    description: String!
    level: CourseLevel!
    coverImage: String
    topics: [CourseTopicInput!]!
  }

  type Mutation {
    createCourse(input: CourseInput!): Course!
    updateCourse(id: ID!, input: CourseInput!): Course!
    deleteCourse(id: ID!): Boolean!
  }
`;
// backend/src/models/Course.ts
import mongoose, { Document, Schema } from 'mongoose';

export type FitnessGoal = 'Lose Weight' | 'Gain Muscle' | 'Maintain Health';

export interface ICourse extends Document {
  goal: FitnessGoal;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  coverImage?: string;
  topics: {
    id: string;
    title: string;
    description?: string;
    steps: {
      id: string;
      title: string;
      content: string;
      illustration?: string;
      videoUrl?: string;
    }[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema(
  {
    goal: {
      type: String,
      required: true,
      enum: ['Lose Weight', 'Gain Muscle', 'Maintain Health'],
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    level: {
      type: String,
      required: true,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
    },
    coverImage: { type: String },
    topics: [
      {
        id: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String },
        steps: [
          {
            id: { type: String, required: true },
            title: { type: String, required: true },
            content: { type: String, required: true },
            illustration: { type: String },
            videoUrl: { type: String },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ICourse>('Course', courseSchema);
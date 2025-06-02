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
  // Filtering fields
  ageRange?: { min: number; max: number };
  gender?: 'Male' | 'Female' | 'Both';
  healthConditions?: string[];
  weightRange?: { min: number; max: number };
  activityLevel?: 'Sedentary' | 'Moderate' | 'Active';
  dietaryPreference?: 'None' | 'Vegan' | 'Vegetarian' | 'Gluten-Free' | 'Keto' | 'Paleo';
  dietaryRestrictions?: string[];
  preferredWorkoutTypes?: string[];
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
    // Filtering fields
    ageRange: { type: { min: Number, max: Number } },
    gender: { type: String, enum: ['Male', 'Female', 'Both'] },
    healthConditions: {
      type: [String],
      enum: [
        'None',
        'Diabetes',
        'Hypertension',
        'Heart Condition',
        'Knee Injury',
        'Back Pain',
        'Asthma',
      ],
    },
    weightRange: { type: { min: Number, max: Number } },
    activityLevel: { type: String, enum: ['Sedentary', 'Moderate', 'Active'] },
    dietaryPreference: {
      type: String,
      enum: ['None', 'Vegan', 'Vegetarian', 'Gluten-Free', 'Keto', 'Paleo'],
    },
    dietaryRestrictions: {
      type: [String],
      enum: ['None', 'Peanuts', 'Dairy', 'Gluten', 'Shellfish', 'Soy'],
    },
    preferredWorkoutTypes: {
      type: [String],
      enum: ['Strength', 'Cardio', 'Yoga', 'HIIT', 'Pilates'],
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICourse>('Course', courseSchema);
import mongoose, { Document, Schema } from 'mongoose';

const stepSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    duration: { type: Number },
  },
  { _id: false }
);

export interface IRecommendationStep {
  title: string;
  description: string;
  image?: string;
  duration?: number;
}

export interface IRecommendation extends Document {
  category: 'workout' | 'nutrition' | 'hydration' | 'rest';
  title: string;
  description: string;
  image?: string;
  steps: IRecommendationStep[];
  tips?: string[];
  articles?: { title: string; url: string }[];
  macros?: { protein: number; carbs: number; fat: number };
  calories?: number;
  reminders?: string[];
  dailyGoalMl?: number;
  sleepGoalHours?: number;
  // Filtering fields
  fitnessGoal?: 'Lose Weight' | 'Gain Muscle' | 'Maintain Health';
  ageRange?: { min: number; max: number };
  gender?: 'Male' | 'Female' | 'Both';
  healthConditions?: string[];
  weightRange?: { min: number; max: number };
  activityLevel?: 'Sedentary' | 'Moderate' | 'Active';
  dietaryPreference?: 'None' | 'Vegan' | 'Vegetarian' | 'Gluten-Free' | 'Keto' | 'Paleo';
  preferredWorkoutTypes?: string[];
  dietaryRestrictions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const recommendationSchema = new Schema(
  {
    category: { type: String, required: true, enum: ['workout', 'nutrition', 'hydration', 'rest'] },
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String },
    steps: { type: [stepSchema] },
    tips: { type: [String] },
    articles: { type: [{ title: String, url: String }] },
    macros: { type: { protein: Number, carbs: Number, fat: Number } },
    calories: { type: Number },
    reminders: { type: [String] },
    dailyGoalMl: { type: Number },
    sleepGoalHours: { type: Number },
    // Filtering fields
    fitnessGoal: { type: String, enum: ['Lose Weight', 'Gain Muscle', 'Maintain Health'] },
    ageRange: { type: { min: Number, max: Number } },
    gender: { type: String, enum: ['Male', 'Female'] },
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
    preferredWorkoutTypes: {
      type: [String],
      enum: ['Strength', 'Cardio', 'Yoga', 'HIIT', 'Pilates'],
    },
    dietaryRestrictions: {
      type: [String],
      enum: ['None', 'Peanuts', 'Dairy', 'Gluten', 'Shellfish', 'Soy'],
    },
  },
  { timestamps: true }
);

export default mongoose.model<IRecommendation>('Recommendation', recommendationSchema);
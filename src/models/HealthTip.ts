import mongoose, { Document, Schema } from 'mongoose';

export interface IHealthTip extends Document {
  title: string;
  description: string;
  category: 'nutrition' | 'exercise' | 'sleep' | 'mental' | 'hydration';
  icon: string;
  image?: string;
  link?: string;
  // Filtering fields
  fitnessGoal?: 'Lose Weight' | 'Gain Muscle' | 'Maintain Health';
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

const healthTipSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ['nutrition', 'exercise', 'sleep', 'mental', 'hydration'],
    },
    icon: { type: String, required: true },
    image: { type: String },
    link: { type: String },
    // Filtering fields
    fitnessGoal: { type: String, enum: ['Lose Weight', 'Gain Muscle', 'Maintain Health'] },
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

export default mongoose.model<IHealthTip>('HealthTip', healthTipSchema);
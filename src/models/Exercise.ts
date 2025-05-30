// backend/src/models/Exercise.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IExercise extends Document {
  externalId?: string; // Wger API ID
  name: string;
  type: string;
  muscleGroup: string;
  difficulty: string;
  equipmentNeeded: string[];
  instructions: string[];
  gifUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const exerciseSchema = new Schema(
  {
    externalId: {
      type: String, // Store Wger's exercise ID for reference
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Strength', 'Cardio', 'Flexibility', 'Balance'],
    },
    muscleGroup: {
      type: String,
      required: true,
      enum: ['Chest', 'Back', 'Legs', 'Arms', 'Core', 'Full Body'],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
    },
    equipmentNeeded: {
      type: [String],
      default: [],
      enum: ['None', 'Dumbbells', 'Barbell', 'Kettlebell', 'Resistance Band', 'Treadmill'],
    },
    instructions: {
      type: [String],
      required: true,
    },
    gifUrl: {
      type: String, // Local path or free CDN URL
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IExercise>('Exercise', exerciseSchema);
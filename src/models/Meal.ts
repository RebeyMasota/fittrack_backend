// backend/src/models/Meal.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IMacros {
  protein: number;
  carbs: number;
  fats: number;
}

export interface IMeal extends Document {
  externalId?: string; // Edamam recipe URI
  name: string;
  calories: number;
  macros: IMacros;
  dietaryTags: string[];
  prepInstructions: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const mealSchema = new Schema(
  {
    externalId: {
      type: String, // Edamam recipe URI
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    calories: {
      type: Number,
      required: true,
      min: [0, 'Calories cannot be negative'],
    },
    macros: {
      protein: { type: Number, required: true, min: 0 },
      carbs: { type: Number, required: true, min: 0 },
      fats: { type: Number, required: true, min: 0 },
    },
    dietaryTags: {
      type: [String],
      default: [],
      enum: ['Vegan', 'Vegetarian', 'Gluten-Free', 'Keto', 'Paleo', 'High-Protein', 'Low-Carb'],
    },
    prepInstructions: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String, // Local path or free CDN URL
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMeal>('Meal', mealSchema);
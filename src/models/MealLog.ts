// backend/src/models/MealLog.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IMealLog extends Document {
  userId: string;
  mealId: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const mealLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mealId: {
      type: Schema.Types.ObjectId,
      ref: 'Meal',
      required: true,
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
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IMealLog>('MealLog', mealLogSchema);
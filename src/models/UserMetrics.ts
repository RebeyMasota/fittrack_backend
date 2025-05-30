// backend/src/models/UserMetrics.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUserMetrics extends Document {
  userId: string;
  date: Date;
  steps: number;
  stepsGoal: number;
  sleepHours: number;
  sleepGoal: number;
  nutritionKcal: number;
  nutritionGoal: number;
  waterLiters: number;
  waterGoal: number;
  createdAt: Date;
  updatedAt: Date;
}

const userMetricsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    steps: {
      type: Number,
      default: 0,
      min: 0,
    },
    stepsGoal: {
      type: Number,
      default: 10000,
      min: 0,
    },
    sleepHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    sleepGoal: {
      type: Number,
      default: 8,
      min: 0,
    },
    nutritionKcal: {
      type: Number,
      default: 0,
      min: 0,
    },
    nutritionGoal: {
      type: Number,
      default: 2000,
      min: 0,
    },
    waterLiters: {
      type: Number,
      default: 0,
      min: 0,
    },
    waterGoal: {
      type: Number,
      default: 2,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUserMetrics>('UserMetrics', userMetricsSchema);
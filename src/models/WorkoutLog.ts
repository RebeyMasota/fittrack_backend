// backend/src/models/WorkoutLog.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkoutLog extends Document {
  userId: string;
  exerciseId: string;
  duration: number;
  repetitions?: number;
  sets?: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const workoutLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: 'Exercise',
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: [1, 'Duration must be at least 1 minute'],
    },
    repetitions: {
      type: Number,
      min: 1,
    },
    sets: {
      type: Number,
      min: 1,
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

export default mongoose.model<IWorkoutLog>('WorkoutLog', workoutLogSchema);
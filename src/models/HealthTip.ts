// backend/src/models/HealthTip.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IHealthTip extends Document {
  title: string;
  description: string;
  category: 'nutrition' | 'exercise' | 'sleep' | 'mental' | 'hydration';
  icon: string;
  image?: string;
  link?: string;
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
  },
  { timestamps: true }
);

export default mongoose.model<IHealthTip>('HealthTip', healthTipSchema);
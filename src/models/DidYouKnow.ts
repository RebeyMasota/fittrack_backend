// backend/src/models/DidYouKnow.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IDidYouKnow extends Document {
  fact: string;
  source: string;
  image?: string;
  link?: string;
}

const didYouKnowSchema = new Schema(
  {
    fact: { type: String, required: true },
    source: { type: String, required: true },
    image: { type: String },
    link: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IDidYouKnow>('DidYouKnow', didYouKnowSchema);
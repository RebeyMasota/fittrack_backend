import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedComment {
  user: mongoose.Types.ObjectId;
  comment: string;
  createdAt: Date;
}

export interface IFeedPost extends Document {
  user: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  image?: string;
  likes: mongoose.Types.ObjectId[]; // Array of User IDs
  comments: IFeedComment[];
  activityType?: string;
  activityValue?: string;
}

const feedCommentSchema = new Schema<IFeedComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const feedPostSchema = new Schema<IFeedPost>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    image: { type: String },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }], // Array of User IDs
    comments: { type: [feedCommentSchema], default: [] },
    activityType: { type: String },
    activityValue: { type: String },
  },
  { timestamps: false }
);

export default mongoose.model<IFeedPost>('SocialFeed', feedPostSchema);
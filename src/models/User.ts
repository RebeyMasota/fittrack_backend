// backend/src/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  fitnessGoal?: string;
  dietaryPreference?: string;
  healthConditions?: string[];
  activityLevel?: string;
  preferredWorkoutTypes?: string[];
  dietaryRestrictions?: string[];
  bmi?: number;
  apiTokens?: {
    fitbit?: string;
    googleFit?: string;
  };
  isProfileComplete: boolean;
  lastRecommendationUpdate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    age: {
      type: Number,
      min: [13, 'Age must be at least 13'],
      max: [120, 'Age cannot exceed 120'],
    },
    weight: {
      type: Number,
      min: [20, 'Weight must be at least 20kg'],
      max: [500, 'Weight cannot exceed 500kg'],
    },
    height: {
      type: Number,
      min: [100, 'Height must be at least 100cm'],
      max: [250, 'Height cannot exceed 250cm'],
    },
    gender: {
    type: String,
    enum: ['Male', 'Female'],
    },
    fitnessGoal: {
      type: String,
      enum: ['Lose Weight', 'Gain Muscle', 'Maintain Health'],
    },
    dietaryPreference: {
      type: String,
      enum: ['None', 'Vegan', 'Vegetarian', 'Gluten-Free', 'Keto', 'Paleo'],
    },
    healthConditions: {
      type: [String],
      default: [],
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
    activityLevel: {
      type: String,
      enum: ['Sedentary', 'Moderate', 'Active'],
    },
    preferredWorkoutTypes: {
      type: [String],
      default: [],
      enum: ['Strength', 'Cardio', 'Yoga', 'HIIT', 'Pilates'],
    },
    dietaryRestrictions: {
      type: [String],
      default: [],
      enum: ['None', 'Peanuts', 'Dairy', 'Gluten', 'Shellfish', 'Soy'],
    },
    bmi: {
      type: Number,
    },
    apiTokens: {
      fitbit: { type: String },
      googleFit: { type: String },
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    lastRecommendationUpdate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.apiTokens;
  return user;
};

// Pre-save hook to calculate BMI
userSchema.pre('save', function (next) {
  if (this.isModified('weight') || this.isModified('height')) {
    if (this.weight && this.height) {
      this.bmi = this.weight / Math.pow(this.height / 100, 2);
    } else {
      this.bmi = undefined;
    }
  }
  next();
});

export default mongoose.model<IUser>('User', userSchema);
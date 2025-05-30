import User from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import { createInitialUserMetrics } from '../utils/userMetricsHelper';

const generateToken = (userId: string) => {
  return jwt.sign(
    { userId }, 
    process.env.JWT_SECRET || 'your-secret-key', 
    { expiresIn: '30d' }
  );
};

export const userResolvers = {
  Query: {
    getUser: async (_: any, { email }: { email: string }) => {
      return await User.findOne({ email });
    },

    getCurrentUser: async (_: any, __: any, { user }: { user?: any }) => {
      if (!user) {
        throw new Error('Authentication required');
      }
      return await User.findById(user.userId);
    },
  },

  Mutation: {
    registerUser: async (
      _: any,
      { email, password }: { email: string; password: string }
    ) => {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          throw new Error('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user with minimal info
        const user = new User({
          email: email.toLowerCase(),
          password: hashedPassword,
          isProfileComplete: false,
        });

        const savedUser = await user.save();
        const token = generateToken((savedUser._id as Types.ObjectId).toString());

        return {
          user: {
            ...savedUser.toObject(),
            id: savedUser._id as Types.ObjectId,
            token,
          },
          token,
        };
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message || 'Registration failed');
        }
        throw new Error('Registration failed');
      }
    },

    completeProfile: async (
      _: any,
      {
        name,
        age,
        weight,
        height,
        gender,
        fitnessGoal,
        dietaryPreference,
        healthConditions,
        activityLevel,
        preferredWorkoutTypes,
        dietaryRestrictions,
      }: {
        name: string;
        age: number;
        weight: number;
        height: number;
        gender: string;
        fitnessGoal: string;
        dietaryPreference: string;
        healthConditions: string[];
        activityLevel: string;
        preferredWorkoutTypes: string[];
        dietaryRestrictions: string[];
      },
      { user }: { user?: any }
    ) => {
      console.log('completeProfile context user:', user);
      if (!user) {
        throw new Error('Authentication required');
      }

      try {
        const updatedUser = await User.findByIdAndUpdate(
          user.userId,
          {
            name,
            age,
            weight,
            height,
            gender,
            fitnessGoal,
            dietaryPreference,
            healthConditions,
            activityLevel,
            preferredWorkoutTypes,
            dietaryRestrictions,
            isProfileComplete: true,
            updatedAt: new Date(),
          },
          { new: true }
        );

        if (!updatedUser) {
          throw new Error('User not found');
        }

        // Add this line to create initial metrics
        await createInitialUserMetrics(updatedUser);

        return updatedUser;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message || 'Profile completion failed');
        }
        throw new Error('Profile completion failed');
      }
    },

    updateProfile: async (
      _: any,
      updateData: {
        name?: string;
        age?: number;
        weight?: number;
        height?: number;
        fitnessGoal?: string;
        dietaryPreference?: string;
        healthConditions?: string[];
        activityLevel?: string;
        preferredWorkoutTypes?: string[];
        dietaryRestrictions?: string[];
      },
      { user }: { user?: any }
    ) => {
      if (!user) {
        throw new Error('Authentication required');
      }

      try {
        const updatedUser = await User.findByIdAndUpdate(
          user.userId,
          {
            ...updateData,
            updatedAt: new Date(),
          },
          { new: true }
        );

        if (!updatedUser) {
          throw new Error('User not found');
        }

        return updatedUser;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message || 'Profile update failed');
        }
        throw new Error('Profile update failed');
      }
    },

    loginUser: async (
      _: any,
      { email, password }: { email: string; password: string }
    ) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
          throw new Error('Invalid credentials');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          throw new Error('Invalid credentials');
        }

        const token = generateToken((user._id as Types.ObjectId).toString());

        return {
          user: {
            ...user.toObject(),
            id: user._id as Types.ObjectId,
            token,
          },
          token,
        };
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message || 'Login failed');
        }
        throw new Error('Login failed');
      }
    },
  },
};
import { PubSub } from 'graphql-subscriptions';
import User from '../models/User';
import UserMetrics from '../models/UserMetrics';
import Exercise from '../models/Exercise';
import Meal from '../models/Meal';
import { v4 as uuidv4 } from 'uuid';
import e from 'express';

const pubsub:any = new PubSub();

export const recommendationResolvers = {
  Query: {
    getRecommendations: async (_: any, { email, category }: { email: string; category?: string }) => {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) throw new Error('User not found');

      const metrics = await UserMetrics.findOne({ userId: user._id, date: { $gte: new Date().setHours(0, 0, 0, 0) } });
      const recommendations: any[] = [];

      // Workout recommendation
      if (!category || category === 'workout') {
        if (user.fitnessGoal === 'Gain Muscle') {
          const strengthQuery: any = {
            type: 'Strength',
            difficulty: user.activityLevel === 'Sedentary' ? 'Beginner' : 'Intermediate',
            muscleGroup: { $in: ['Chest', 'Legs', 'Back'] },
          };

          if ((user.healthConditions ?? []).includes('Knee Injury')) {
            strengthQuery.equipmentNeeded = { $in: ['None', 'Dumbbells'] };
          }

          const exercise = await Exercise.findOne(strengthQuery);
          
          if (exercise) {
            recommendations.push({
              id: uuidv4(),
              title: exercise.name,
              description: `Perform 3 sets of 8-12 reps to build ${exercise.muscleGroup.toLowerCase()} strength.`,
              type: 'exercise',
              category: 'workout',
              priority: 8,
              media: exercise.gifUrl || null,
              frequency: 'daily',
            });
          }
        } else if (user.fitnessGoal === 'Lose Weight') {
          const query: any = {
            type: 'Cardio',
            difficulty: user.activityLevel === 'Active' ? 'Intermediate' : 'Beginner',
          };

          if (user.healthConditions?.includes('Heart Condition')) {
            query.equipmentNeeded = 'None';
          }

          const exercise = await Exercise.findOne(query);
          
          if (exercise) {
            recommendations.push({
              id: uuidv4(),
              title: exercise.name,
              description: `Do 20-30 minutes to burn calories and improve endurance.`,
              type: 'exercise',
              category: 'workout',
              priority: 7,
              media: exercise.gifUrl || null,
              frequency: 'daily',
            });
          }
        }
      }

      // Nutrition recommendation
      if (!category || category === 'nutrition') {
        const proteinTarget = user.fitnessGoal === 'Gain Muscle' ? 30 : 15; // Higher protein for muscle gain
        const meal = await Meal.findOne({
          dietaryTags: { $in: user.dietaryPreference ? [user.dietaryPreference] : ['None'] },
          'macros.protein': { $gte: proteinTarget },
          calories: { $lte: user.fitnessGoal === 'Lose Weight' ? 500 : 800 },
        });
        if (meal) {
          recommendations.push({
            id: uuidv4(),
            title: meal.name,
            description: `A ${meal.calories}kcal meal with ${meal.macros.protein}g protein. ${meal.prepInstructions.substring(0, 50)}...`,
            type: 'meal',
            category: 'nutrition',
            priority: 7,
            media: meal.imageUrl || null,
            frequency: 'daily',
          });
        }
      }

      // Hydration reminder
      if ((!category || category === 'hydration') && metrics) {
        if (metrics.waterLiters < metrics.waterGoal * 0.5) {
          recommendations.push({
            id: uuidv4(),
            title: 'Hydration Reminder',
            description: `Drink 500ml of water to reach ${((metrics.waterLiters + 0.5) / metrics.waterGoal * 100).toFixed(1)}% of your goal.`,
            type: 'hydration',
            category: 'hydration',
            priority: 9,
            media: null,
            frequency: 'daily',
          });
        }
      }

      // Rest reminder
      if ((!category || category === 'rest') && metrics) {
        if (metrics.sleepHours < metrics.sleepGoal * 0.8) {
          recommendations.push({
            id: uuidv4(),
            title: 'Rest Reminder',
            description: `Aim for ${metrics.sleepGoal} hours of sleep tonight to recover.`,
            type: 'rest',
            category: 'rest',
            priority: 6,
            media: null,
            frequency: 'daily',
          });
        }
      }

      // Update lastRecommendationUpdate
      await User.updateOne({ _id: user._id }, { lastRecommendationUpdate: new Date() });

      // Publish update for subscription
      pubsub.publish(`RECOMMENDATION_UPDATE_${user._id}`, { onRecommendationUpdate: recommendations });

      return recommendations.sort((a, b) => b.priority - a.priority);
    },

    getUserMetrics: async (_: any, { email }: { email: string }) => {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) throw new Error('User not found');

      let metrics = await UserMetrics.findOne({
        userId: user._id,
        date: { $gte: new Date().setHours(0, 0, 0, 0) },
      });

      if (!metrics) {
        // Create default metrics for today
        metrics = await UserMetrics.create({
          userId: user._id,
          date: new Date(),
          steps: 0,
          stepsGoal: user.fitnessGoal === 'Gain Muscle' ? 8000 : 10000,
          sleepHours: 0,
          sleepGoal: 8,
          nutritionKcal: 0,
          nutritionGoal: user.fitnessGoal === 'Gain Muscle' ? 3500 : user.fitnessGoal === 'Lose Weight' ? 1800 : 2000,
          waterLiters: 0,
          waterGoal: 2,
        });
      }

      return metrics;
    },
  },

  Mutation: {
    logMeal: async (_: any, { email, kcal }: { email: string; kcal: number }) => {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) throw new Error('User not found');

      let metrics = await UserMetrics.findOne({
        userId: user._id,
        date: { $gte: new Date().setHours(0, 0, 0, 0) },
      });

      if (!metrics) {
        metrics = await UserMetrics.create({
          userId: user._id,
          date: new Date(),
          steps: 0,
          stepsGoal: user.fitnessGoal === 'Gain Muscle' ? 8000 : 10000,
          sleepHours: 0,
          sleepGoal: 8,
          nutritionKcal: kcal,
          nutritionGoal: user.fitnessGoal === 'Gain Muscle' ? 3500 : user.fitnessGoal === 'Lose Weight' ? 1800 : 2000,
          waterLiters: 0,
          waterGoal: 2,
        });
      } else {
        metrics.nutritionKcal += kcal;
        await metrics.save();
      }

      return metrics;
    },

    addWater: async (_: any, { email, liters }: { email: string; liters: number }) => {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) throw new Error('User not found');

      let metrics = await UserMetrics.findOne({
        userId: user._id,
        date: { $gte: new Date().setHours(0, 0, 0, 0) },
      });

      if (!metrics) {
        metrics = await UserMetrics.create({
          userId: user._id,
          date: new Date(),
          steps: 0,
          stepsGoal: user.fitnessGoal === 'Gain Muscle' ? 8000 : 10000,
          sleepHours: 0,
          sleepGoal: 8,
          nutritionKcal: 0,
          nutritionGoal: user.fitnessGoal === 'Gain Muscle' ? 3500 : user.fitnessGoal === 'Lose Weight' ? 1800 : 2000,
          waterLiters: liters,
          waterGoal: 2,
        });
      } else {
        metrics.waterLiters += liters;
        await metrics.save();
      }

      return metrics;
    },

    trackHeartRate: async (_: any, { email }: { email: string }) => {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) throw new Error('User not found');

      // Placeholder for fitness tracker API integration
      console.log(`Tracking heart rate for user: ${email}`);
      return true;
    },
  },

  Subscription: {
  onRecommendationUpdate: {
    subscribe: async (_: any, { email }: { email: string }) => {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) throw new Error('User not found');
      return pubsub.asyncIterator(`RECOMMENDATION_UPDATE_${user._id}`);
    },
    resolve: (payload: any) => {
      // payload is { onRecommendationUpdate: recommendations }
      // Return the recommendations array or object, not null
      return payload.onRecommendationUpdate ?? [];
    },
  },
},
};
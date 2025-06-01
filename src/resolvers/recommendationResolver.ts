import Recommendation from '../models/Recommendation';
import User from '../models/User';

export const recommendationResolvers = {
  Query: {
    getRecommendations: async (_: any, __: any, { user }: { user?: any }) => {
      if (!user) throw new Error('Authentication required');
      const userData = await User.findById(user.userId);
      if (!userData) throw new Error('User not found');

      // Build filter based on user profile
      const filterBase: any = {
        $or: [
          { fitnessGoal: userData.fitnessGoal },
          { fitnessGoal: { $exists: false } }
        ],
        $and: []
      };

      if (userData.gender) {
        filterBase.$and.push({
          $or: [
            { gender: userData.gender },
            { gender: 'Both' },
            { gender: { $exists: false } }
          ]
        });
      }
      if (userData.age) {
        filterBase.$and.push({
          $or: [
            { ageRange: { $exists: false } },
            {
              $and: [
                { 'ageRange.min': { $lte: userData.age } },
                { 'ageRange.max': { $gte: userData.age } }
              ]
            }
          ]
        });
      }
      if (userData.weight) {
        filterBase.$and.push({
          $or: [
            { weightRange: { $exists: false } },
            {
              $and: [
                { 'weightRange.min': { $lte: userData.weight } },
                { 'weightRange.max': { $gte: userData.weight } }
              ]
            }
          ]
        });
      }
      if (userData.healthConditions && userData.healthConditions.length > 0) {
        filterBase.$and.push({
          $or: [
            { healthConditions: { $exists: false } },
            { healthConditions: { $in: userData.healthConditions } }
          ]
        });
      }
      if (userData.activityLevel) {
        filterBase.$and.push({
          $or: [
            { activityLevel: { $exists: false } },
            { activityLevel: userData.activityLevel }
          ]
        });
      }
      if (userData.dietaryPreference) {
        filterBase.$and.push({
          $or: [
            { dietaryPreference: { $exists: false } },
            { dietaryPreference: userData.dietaryPreference }
          ]
        });
      }
      if (userData.preferredWorkoutTypes && userData.preferredWorkoutTypes.length > 0) {
        filterBase.$and.push({
          $or: [
            { preferredWorkoutTypes: { $exists: false } },
            { preferredWorkoutTypes: { $in: userData.preferredWorkoutTypes } }
          ]
        });
      }
      if (userData.dietaryRestrictions && userData.dietaryRestrictions.length > 0) {
        filterBase.$and.push({
          $or: [
            { dietaryRestrictions: { $exists: false } },
            { dietaryRestrictions: { $in: userData.dietaryRestrictions } }
          ]
        });
      }

      // Remove $and if empty to avoid query issues
      if (filterBase.$and.length === 0) delete filterBase.$and;

      const categories = ['workout', 'nutrition', 'hydration', 'rest'];
      const results = await Promise.all(
        categories.map(async (category) => {
          const rec = await Recommendation.findOne({
            ...filterBase,
            category
          }).sort({ createdAt: -1 });
          return rec;
        })
      );

      // Filter out nulls (if no rec found for a category)
      const filteredResults = results.filter(Boolean);

      return filteredResults;
    },

    getRecommendation: async (_: any, { id }: { id: string }) => {
      return await Recommendation.findById(id);
    },
  },
};
import HealthTip from '../models/HealthTip';
import User from '../models/User';

export const healthTipResolvers = {
  Query: {
    getHealthTips: async (_: any, __: any, { user }: { user?: any }) => {
      if (!user) throw new Error('Authentication required');
      const userData = await User.findById(user.userId);
      if (!userData) throw new Error('User not found');

      const filterBase: any = { $and: [] };

      if (userData.fitnessGoal) {
        filterBase.$and.push({
          $or: [
            { fitnessGoal: userData.fitnessGoal },
            { fitnessGoal: { $exists: false } }
          ]
        });
      }
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

      if (filterBase.$and.length === 0) delete filterBase.$and;

      // Fetch up to 3 tips matching the full profile
      let tips = await HealthTip.find(filterBase).sort({ createdAt: -1 }).limit(3);

      // If no matches, fallback to up to 3 defaults for user's fitnessGoal
      if (!tips || tips.length === 0) {
        tips = await HealthTip.find({
          fitnessGoal: userData.fitnessGoal,
        })
          .sort({ createdAt: -1 })
          .limit(3);
      }

      return tips;
    },

    getHealthTip: async (_: any, { id }: { id: string }) => {
      return await HealthTip.findById(id);
    },

    getAllHealthTips: async (_: any, { fitnessGoal }: { fitnessGoal?: string }, { user }: { user?: any }) => {
      if (!user) throw new Error('Authentication required');
      const userData = await User.findById(user.userId);
      if (!userData) throw new Error('User not found');
      if (userData.role !== 'admin') throw new Error('Not authorized');

      const filter: any = {};
      if (fitnessGoal) filter.fitnessGoal = fitnessGoal;

      return await HealthTip.find(filter).sort({ createdAt: -1 });
    },
  },
  Mutation: {
    createHealthTip: async (_: any, { input }: { input: any }) => {
      const tip = new HealthTip(input);
      return await tip.save();
    },
    updateHealthTip: async (_: any, { id, input }: { id: string; input: any }) => {
      return await HealthTip.findByIdAndUpdate(id, input, { new: true });
    },
    deleteHealthTip: async (_: any, { id }: { id: string }) => {
      const res = await HealthTip.findByIdAndDelete(id);
      return !!res;
    },
  },
};
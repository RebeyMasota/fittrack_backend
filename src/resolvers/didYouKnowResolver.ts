import DidYouKnow from '../models/DidYouKnow';
import User from '../models/User';

export const didYouKnowResolvers = {
  Query: {
    getDidYouKnow: async (_: any, __: any, { user }: { user?: any }) => {
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

      // Try to fetch up to 4 facts matching the full profile
      let items = await DidYouKnow.find(filterBase).sort({ createdAt: -1 }).limit(4);

      // If no matches, fallback to up to 4 defaults for user's fitnessGoal
      if (!items || items.length === 0) {
        items = await DidYouKnow.find({
          fitnessGoal: userData.fitnessGoal,
          // Optionally: gender: 'Both' or undefined for broadest match
        })
          .sort({ createdAt: -1 })
          .limit(4);
      }

      return items;
    },

    getDidYouKnowItem: async (_: any, { id }: { id: string }) => {
      return await DidYouKnow.findById(id);
    },
    getAllDidYouKnow: async (_: any, { fitnessGoal }: { fitnessGoal?: string }, { user }: { user?: any }) => {
      if (!user) throw new Error('Authentication required');
      const userData = await User.findById(user.userId);
      if (!userData) throw new Error('User not found');
      if (userData.role !== 'admin') throw new Error('Not authorized');

      const filter: any = {};
      if (fitnessGoal) filter.fitnessGoal = fitnessGoal;

      return await DidYouKnow.find(filter).sort({ createdAt: -1 });
    },
  },
  Mutation: {
    createDidYouKnow: async (_: any, { input }: { input: any }) => {
      const item = new DidYouKnow(input);
      return await item.save();
    },
    updateDidYouKnow: async (_: any, { id, input }: { id: string; input: any }) => {
      return await DidYouKnow.findByIdAndUpdate(id, input, { new: true });
    },
    deleteDidYouKnow: async (_: any, { id }: { id: string }) => {
      const res = await DidYouKnow.findByIdAndDelete(id);
      return !!res;
    },
  },
};
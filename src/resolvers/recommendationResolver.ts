import Recommendation, { IRecommendation } from '../models/Recommendation';
import User from '../models/User';

const formatRecommendation = (rec: IRecommendation) => {
  const recObj = rec.toObject();

  return {
    id: recObj._id.toString(),
    category: recObj.category,
    title: recObj.title || '',  // defensively handle missing title
    description: recObj.description || '',
    image: recObj.image || null,
    steps: (recObj.steps || []).map((step:any) => ({
      title: step.title || '',   // <= Here we solve your current issue
      description: step.description || '',
      image: step.image || null,
      duration: step.duration || null,
    })),
    tips: recObj.tips || [],
    articles: (recObj.articles || []).map((article:any) => ({
      title: article.title || '',
      url: article.url || '',
    })),
    macros: recObj.macros
      ? {
          protein: recObj.macros.protein || 0,
          carbs: recObj.macros.carbs || 0,
          fat: recObj.macros.fat || 0,
        }
      : null,
    calories: recObj.calories || null,
    reminders: recObj.reminders || [],
    dailyGoalMl: recObj.dailyGoalMl || null,
    sleepGoalHours: recObj.sleepGoalHours || null,
    fitnessGoal: recObj.fitnessGoal || null,
    ageRange: recObj.ageRange || null,
    gender: recObj.gender || null,
    healthConditions: recObj.healthConditions || [],
    weightRange: recObj.weightRange || null,
    activityLevel: recObj.activityLevel || null,
    dietaryPreference: recObj.dietaryPreference || null,
    preferredWorkoutTypes: recObj.preferredWorkoutTypes || [],
    dietaryRestrictions: recObj.dietaryRestrictions || [],
    createdAt: recObj.createdAt,
    updatedAt: recObj.updatedAt,
  };
};

export const recommendationResolvers = {
  Query: {
    getRecommendations: async (_: any, __: any, { user }: { user?: any }) => {
      if (!user) throw new Error('Authentication required');
      const userData = await User.findById(user.userId);
      if (!userData) throw new Error('User not found');

      // If admin, return all recommendations without filters
     if (userData.role === 'admin') {
        const recommendations = await Recommendation.find().sort({ createdAt: -1 });
        return recommendations.map(formatRecommendation);
      }


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
  Mutation: {
    createRecommendation: async (_: any, { input }: any, { user }: { user?: any }) => {
      if (!user) throw new Error('Authentication required');
      // Optionally: Only allow admins to create
      const rec = new Recommendation({ ...input });
      await rec.save();
      return rec;
    },
    updateRecommendation: async (_: any, { id, input }: any, { user }: { user?: any }) => {
      if (!user) throw new Error('Authentication required');
      // Optionally: Only allow admins to update
      const rec = await Recommendation.findByIdAndUpdate(id, input, { new: true });
      if (!rec) throw new Error('Recommendation not found');
      return rec;
    },
    deleteRecommendation: async (_: any, { id }: { id: string }, { user }: { user?: any }) => {
      if (!user) throw new Error('Authentication required');
      // Optionally: Only allow admins to delete
      const rec = await Recommendation.findByIdAndDelete(id);
      return !!rec;
    },
  },
};
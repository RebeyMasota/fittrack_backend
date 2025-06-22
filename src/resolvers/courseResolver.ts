import Course from '../models/Course';
import User from '../models/User';

export const courseResolvers = {
  Query: {
    getCourses: async (_: any, __: any, { user }: { user?: any }) => {
      if (!user) throw new Error('Authentication required');
      const userData = await User.findById(user.userId);
      if (!userData) throw new Error('User not found');

      const filterBase: any = { $and: [] };

      if (userData.fitnessGoal) {
        filterBase.$and.push({
          $or: [
            { goal: userData.fitnessGoal },
            { goal: { $exists: false } }
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

      // Fetch all matching courses, most recent first
      let courses = await Course.find(filterBase).sort({ createdAt: -1 });

      // If no matches, fallback to the default course for user's goal
      if (!courses || courses.length === 0) {
        courses = await Course.find({
          goal: userData.fitnessGoal,
        }).sort({ createdAt: -1 });
      }

      return courses;
    },

    getCourse: async (_: any, { id }: { id: string }) => {
      return await Course.findById(id);
    },
    getAllCourses: async (_: any, { goal }: { goal?: string }, { user }: { user?: any }) => {
      if (!user) throw new Error('Authentication required');
      const userData = await User.findById(user.userId);
      if (!userData) throw new Error('User not found');
      if (userData.role !== 'admin') throw new Error('Not authorized');

      const filter: any = {};
      if (goal) filter.goal = goal;

      return await Course.find(filter).sort({ createdAt: -1 });
    },
  },
  Mutation: {
    createCourse: async (_: any, { input }: { input: any }) => {
      const course = new Course(input);
      return await course.save();
    },
    updateCourse: async (_: any, { id, input }: { id: string; input: any }) => {
      return await Course.findByIdAndUpdate(id, input, { new: true });
    },
    deleteCourse: async (_: any, { id }: { id: string }) => {
      const res = await Course.findByIdAndDelete(id);
      return !!res;
    },
  },
};
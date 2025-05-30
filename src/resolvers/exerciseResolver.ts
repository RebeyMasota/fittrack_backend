import Exercise from '../models/Exercise';
import WorkoutLog from '../models/WorkoutLog';
import User from '../models/User';
import axios from 'axios';

export const exerciseResolvers = {
  Query: {
    getExercises: async (
      _: any,
      { type, muscleGroup, difficulty, equipment }: { type?: string; muscleGroup?: string; difficulty?: string; equipment?: string }
    ) => {
      const filter: any = {};
      if (type) filter.type = type;
      if (muscleGroup) filter.muscleGroup = muscleGroup;
      if (difficulty) filter.difficulty = difficulty;
      if (equipment) filter.equipmentNeeded = equipment;

      let exercises = await Exercise.find(filter);

      // If no exercises in DB, fetch from Wger API (placeholder)
      if (exercises.length === 0) {
        try {
          const response = await axios.get('https://wger.de/api/v2/exercise/', {
            headers: {
              Authorization: `Token ${process.env.WGER_API_KEY}`,
            },
            params: { language: 2, limit: 10 }, // English, limit for free tier
          });

          exercises = await Promise.all(
            response.data.results.map(async (ex: any) => {
              const exercise = new Exercise({
                externalId: ex.id,
                name: ex.name,
                type: ex.category.name || 'Strength',
                muscleGroup: ex.muscles[0]?.name || 'Full Body',
                difficulty: ex.difficulty || 'Intermediate',
                equipmentNeeded: ex.equipment.map((e: any) => e.name) || ['None'],
                instructions: ex.description ? ex.description.split('. ').filter((s: string) => s) : ['No instructions provided'],
                gifUrl: null, // Add free GIFs later
              });
              return exercise.save();
            })
          );
        } catch (error) {
          console.error('Wger API error:', error);
        }
      }

      return exercises;
    },
  },

  Mutation: {
    logWorkout: async (
      _: any,
      { email, exerciseId, duration, repetitions, sets }: { email: string; exerciseId: string; duration: number; repetitions?: number; sets?: number }
    ) => {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) throw new Error('User not found');

      const exercise = await Exercise.findById(exerciseId);
      if (!exercise) throw new Error('Exercise not found');

      await WorkoutLog.create({
        userId: user._id,
        exerciseId,
        duration,
        repetitions,
        sets,
        date: new Date(),
      });

      return true;
    },
  },
};
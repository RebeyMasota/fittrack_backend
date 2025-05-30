import Meal from '../models/Meal';
import MealLog from '../models/MealLog';
import User from '../models/User';
import UserMetrics from '../models/UserMetrics';
import axios from 'axios';

export const nutritionResolvers = {
  Query: {
    getMeals: async (
      _: any,
      { dietaryTags, minProtein, maxCalories }: { dietaryTags?: string[]; minProtein?: number; maxCalories?: number }
    ) => {
      const filter: any = {};
      if (dietaryTags && dietaryTags.length > 0) filter.dietaryTags = { $in: dietaryTags };
      if (minProtein) filter['macros.protein'] = { $gte: minProtein };
      if (maxCalories) filter.calories = { $lte: maxCalories };

      let meals = await Meal.find(filter);

      // If no meals in DB, fetch from Edamam API (placeholder)
      if (meals.length === 0) {
        try {
          const response = await axios.get('https://api.edamam.com/api/meal-planner/v1', {
            params: {
              app_id: process.env.EDAMAM_APP_ID,
              app_key: process.env.EDAMAM_APP_KEY,
              type: 'public',
              diet: dietaryTags ? dietaryTags.join(',') : undefined,
              'nutrients[PROCNT]': minProtein ? `${minProtein}-` : undefined,
              calories: maxCalories ? `0-${maxCalories}` : undefined,
            },
          });

          meals = await Promise.all(
            response.data.hits.map(async (hit: any) => {
              const meal = new Meal({
                externalId: hit.recipe.uri,
                name: hit.recipe.label,
                calories: Math.round(hit.recipe.calories),
                macros: {
                  protein: hit.recipe.totalNutrients.PROCNT?.quantity || 0,
                  carbs: hit.recipe.totalNutrients.CHOCDF?.quantity || 0,
                  fats: hit.recipe.totalNutrients.FAT?.quantity || 0,
                },
                dietaryTags: [...(hit.recipe.dietLabels || []), ...(hit.recipe.healthLabels || [])],
                prepInstructions: hit.recipe.ingredientLines.join(' '),
                imageUrl: hit.recipe.image || null,
              });
              return meal.save();
            })
          );
        } catch (error) {
          console.error('Edamam API error:', error);
        }
      }

      return meals;
    },
  },

  Mutation: {
    logMeal: async (
      _: any,
      { email, mealId, calories, macros }: { email: string; mealId: string; calories: number; macros: { protein: number; carbs: number; fats: number } }
    ) => {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) throw new Error('User not found');

      const meal = await Meal.findById(mealId);
      if (!meal) throw new Error('Meal not found');

      await MealLog.create({
        userId: user._id,
        mealId,
        calories,
        macros,
        date: new Date(),
      });

      // Update UserMetrics
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
          nutritionKcal: calories,
          nutritionGoal: user.fitnessGoal === 'Gain Muscle' ? 3500 : user.fitnessGoal === 'Lose Weight' ? 1800 : 2000,
          waterLiters: 0,
          waterGoal: 2,
        });
      } else {
        metrics.nutritionKcal += calories;
        await metrics.save();
      }

      return true;
    },
  },
};
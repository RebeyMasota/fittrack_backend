// backend/src/utils/userMetricsHelper.ts
import UserMetrics from '../models/UserMetrics';
import { IUser } from '../models/User';

interface MetricsConfig {
  stepsGoal: number;
  sleepGoal: number;
  nutritionGoal: number;
  waterGoal: number;
}

/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor equation
 */
const calculateBMR = (weight: number, height: number, age: number, gender: string): number => {
  if (gender === 'Male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure) based on activity level
 */
const calculateTDEE = (bmr: number, activityLevel: string): number => {
  const multipliers = {
    'Sedentary': 1.2,
    'Moderate': 1.55,
    'Active': 1.725
  };
  
  return bmr * (multipliers[activityLevel as keyof typeof multipliers] || 1.2);
};

/**
 * Get personalized metrics configuration based on user profile
 */
const getPersonalizedMetrics = (user: IUser): MetricsConfig => {
  const { 
    weight = 70, 
    height = 170, 
    age = 30, 
    gender = 'Male',
    fitnessGoal = 'Maintain Health',
    activityLevel = 'Moderate',
    healthConditions = []
  } = user;

  // Calculate BMR and TDEE
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);

  // Base metrics
  let config: MetricsConfig = {
    stepsGoal: 10000,
    sleepGoal: 8,
    nutritionGoal: Math.round(tdee),
    waterGoal: 2.5
  };

  // Adjust based on fitness goal
  switch (fitnessGoal) {
    case 'Lose Weight':
      config.stepsGoal = activityLevel === 'Active' ? 12000 : 
                        activityLevel === 'Moderate' ? 10000 : 8000;
      config.nutritionGoal = Math.round(tdee * 0.8); // 20% caloric deficit
      config.waterGoal = 3.0; // Higher water intake for metabolism
      break;

    case 'Gain Muscle':
      config.stepsGoal = activityLevel === 'Active' ? 8000 : 
                        activityLevel === 'Moderate' ? 7000 : 6000;
      config.nutritionGoal = Math.round(tdee * 1.1); // 10% caloric surplus
      config.waterGoal = 3.5; // Higher water for muscle recovery
      config.sleepGoal = 8.5; // Extra sleep for recovery
      break;

    case 'Maintain Health':
    default:
      // Keep base values with minor adjustments based on activity
      config.stepsGoal = activityLevel === 'Active' ? 12000 : 
                        activityLevel === 'Moderate' ? 10000 : 7000;
      break;
  }

  // Adjust for health conditions
  if (healthConditions.includes('Heart Condition') || healthConditions.includes('Hypertension')) {
    config.stepsGoal = Math.min(config.stepsGoal, 8000); // Lower intensity
    config.nutritionGoal = Math.round(config.nutritionGoal * 0.95); // Slightly lower calories
  }

  if (healthConditions.includes('Diabetes')) {
    config.stepsGoal = Math.max(config.stepsGoal, 8000); // Encourage walking
    config.nutritionGoal = Math.round(config.nutritionGoal * 0.9); // Lower calorie target
  }

  if (healthConditions.includes('Knee Injury') || healthConditions.includes('Back Pain')) {
    config.stepsGoal = Math.min(config.stepsGoal, 7000); // Reduce impact
  }

  if (healthConditions.includes('Asthma')) {
    config.stepsGoal = Math.min(config.stepsGoal, 8000); // Moderate activity
  }

  // Gender-based adjustments for water intake
  if (gender === 'Male') {
    config.waterGoal += 0.5; // Men typically need more water
  }

  // Age-based adjustments
  if (age > 50) {
    config.sleepGoal = 7.5; // Slightly less sleep needed
    config.waterGoal += 0.5; // Older adults need more hydration
  }

  // Weight-based water adjustments
  if (weight > 80) {
    config.waterGoal += 0.5;
  } else if (weight < 60) {
    config.waterGoal -= 0.3;
  }

  // Ensure minimum values
  config.stepsGoal = Math.max(config.stepsGoal, 5000);
  config.sleepGoal = Math.max(config.sleepGoal, 7);
  config.nutritionGoal = Math.max(config.nutritionGoal, 1200);
  config.waterGoal = Math.max(config.waterGoal, 2);

  return config;
};

/**
 * Create initial UserMetrics entry for a new user
 */
export const createInitialUserMetrics = async (user: IUser): Promise<void> => {
  try {
    const config = getPersonalizedMetrics(user);
    
    // Create metrics for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if metrics already exist for today
    const existingMetrics = await UserMetrics.findOne({
      userId: user._id,
      date: today
    });

    if (!existingMetrics) {
      await UserMetrics.create({
        userId: user._id,
        date: today,
        steps: 0,
        stepsGoal: config.stepsGoal,
        sleepHours: 0,
        sleepGoal: config.sleepGoal,
        nutritionKcal: 0,
        nutritionGoal: config.nutritionGoal,
        waterLiters: 0,
        waterGoal: config.waterGoal
      });

      console.log(`Initial metrics created for user ${user._id}:`, config);
    }
  } catch (error) {
    console.error('Error creating initial user metrics:', error);
    throw error;
  }
};

/**
 * Update existing metrics goals when user profile changes
 */
export const updateUserMetricsGoals = async (user: IUser): Promise<void> => {
  try {
    const config = getPersonalizedMetrics(user);
    
    // Update today's metrics goals if they exist
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await UserMetrics.findOneAndUpdate(
      {
        userId: user._id,
        date: today
      },
      {
        stepsGoal: config.stepsGoal,
        sleepGoal: config.sleepGoal,
        nutritionGoal: config.nutritionGoal,
        waterGoal: config.waterGoal
      },
      { 
        new: true,
        upsert: true // Create if doesn't exist
      }
    );

    console.log(`Metrics goals updated for user ${user._id}:`, config);
  } catch (error) {
    console.error('Error updating user metrics goals:', error);
    throw error;
  }
};

export default {
  createInitialUserMetrics,
  updateUserMetricsGoals,
  getPersonalizedMetrics
};
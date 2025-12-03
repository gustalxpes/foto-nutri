export interface NutritionData {
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
}

export interface Meal {
  id: string;
  userId: string;
  datetime: Date;
  mealType: 'café' | 'almoço' | 'jantar' | 'lanche' | 'outro';
  imageUrl: string;
  servings: number;
  nutrition: NutritionData;
  foods: string[];
  confidence?: number;
}

export interface DailySummary {
  id: string;
  userId: string;
  date: Date;
  totalCalories: number;
  totalCarbs: number;
  totalProtein: number;
  totalFat: number;
  totalFiber: number;
  mealsCount: number;
}

export interface UserGoals {
  dailyCalories: number;
  dailyCarbs: number;
  dailyProtein: number;
  dailyFat: number;
  dailyFiber: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  goals: UserGoals;
  createdAt: Date;
}

export type MealTypeLabel = {
  [key in Meal['mealType']]: string;
};

export const mealTypeLabels: MealTypeLabel = {
  'café': 'Café da Manhã',
  'almoço': 'Almoço',
  'jantar': 'Jantar',
  'lanche': 'Lanche',
  'outro': 'Outro',
};

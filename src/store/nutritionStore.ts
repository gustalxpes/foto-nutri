import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Meal, DailySummary, UserGoals, NutritionData } from '@/types/nutrition';

interface NutritionState {
  meals: Meal[];
  dailySummaries: DailySummary[];
  userGoals: UserGoals;
  currentUser: {
    id: string;
    name: string;
    email: string;
  } | null;
  
  // Actions
  addMeal: (meal: Omit<Meal, 'id'>) => void;
  updateMeal: (id: string, updates: Partial<Meal>) => void;
  deleteMeal: (id: string) => void;
  setUserGoals: (goals: UserGoals) => void;
  setCurrentUser: (user: { id: string; name: string; email: string } | null) => void;
  getDailySummary: (date: Date) => DailySummary | undefined;
  getMealsForDate: (date: Date) => Meal[];
}

const defaultGoals: UserGoals = {
  dailyCalories: 2000,
  dailyCarbs: 250,
  dailyProtein: 150,
  dailyFat: 65,
  dailyFiber: 30,
};

const generateId = () => Math.random().toString(36).substring(2, 15);

const isSameDay = (date1: Date, date2: Date) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return d1.toDateString() === d2.toDateString();
};

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      meals: [],
      dailySummaries: [],
      userGoals: defaultGoals,
      currentUser: null,

      addMeal: (mealData) => {
        const meal: Meal = {
          ...mealData,
          id: generateId(),
        };

        set((state) => {
          const newMeals = [...state.meals, meal];
          
          // Update daily summary
          const mealDate = new Date(meal.datetime);
          const existingSummaryIndex = state.dailySummaries.findIndex(
            (s) => isSameDay(new Date(s.date), mealDate)
          );

          let newSummaries = [...state.dailySummaries];
          
          if (existingSummaryIndex >= 0) {
            const existing = newSummaries[existingSummaryIndex];
            newSummaries[existingSummaryIndex] = {
              ...existing,
              totalCalories: existing.totalCalories + meal.nutrition.calories * meal.servings,
              totalCarbs: existing.totalCarbs + meal.nutrition.carbs * meal.servings,
              totalProtein: existing.totalProtein + meal.nutrition.protein * meal.servings,
              totalFat: existing.totalFat + meal.nutrition.fat * meal.servings,
              totalFiber: existing.totalFiber + meal.nutrition.fiber * meal.servings,
              mealsCount: existing.mealsCount + 1,
            };
          } else {
            newSummaries.push({
              id: generateId(),
              userId: meal.userId,
              date: mealDate,
              totalCalories: meal.nutrition.calories * meal.servings,
              totalCarbs: meal.nutrition.carbs * meal.servings,
              totalProtein: meal.nutrition.protein * meal.servings,
              totalFat: meal.nutrition.fat * meal.servings,
              totalFiber: meal.nutrition.fiber * meal.servings,
              mealsCount: 1,
            });
          }

          return { meals: newMeals, dailySummaries: newSummaries };
        });
      },

      updateMeal: (id, updates) => {
        set((state) => ({
          meals: state.meals.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        }));
      },

      deleteMeal: (id) => {
        set((state) => {
          const meal = state.meals.find((m) => m.id === id);
          if (!meal) return state;

          const mealDate = new Date(meal.datetime);
          const summaryIndex = state.dailySummaries.findIndex(
            (s) => isSameDay(new Date(s.date), mealDate)
          );

          let newSummaries = [...state.dailySummaries];
          if (summaryIndex >= 0) {
            const existing = newSummaries[summaryIndex];
            newSummaries[summaryIndex] = {
              ...existing,
              totalCalories: existing.totalCalories - meal.nutrition.calories * meal.servings,
              totalCarbs: existing.totalCarbs - meal.nutrition.carbs * meal.servings,
              totalProtein: existing.totalProtein - meal.nutrition.protein * meal.servings,
              totalFat: existing.totalFat - meal.nutrition.fat * meal.servings,
              totalFiber: existing.totalFiber - meal.nutrition.fiber * meal.servings,
              mealsCount: existing.mealsCount - 1,
            };
          }

          return {
            meals: state.meals.filter((m) => m.id !== id),
            dailySummaries: newSummaries,
          };
        });
      },

      setUserGoals: (goals) => set({ userGoals: goals }),
      
      setCurrentUser: (user) => set({ currentUser: user }),

      getDailySummary: (date) => {
        const { dailySummaries } = get();
        return dailySummaries.find((s) => isSameDay(new Date(s.date), date));
      },

      getMealsForDate: (date) => {
        const { meals } = get();
        return meals.filter((m) => isSameDay(new Date(m.datetime), date));
      },
    }),
    {
      name: 'nutrition-storage',
    }
  )
);

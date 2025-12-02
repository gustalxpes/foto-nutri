import { motion } from 'framer-motion';
import { Clock, Flame, ChevronRight } from 'lucide-react';
import { Meal, mealTypeLabels } from '@/types/nutrition';
import { cn } from '@/lib/utils';

interface MealCardProps {
  meal: Meal;
  onClick?: () => void;
}

export const MealCard = ({ meal, onClick }: MealCardProps) => {
  const totalCalories = Math.round(meal.nutrition.calories * meal.servings);
  const time = new Date(meal.datetime).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-card rounded-xl p-4 shadow-card flex items-center gap-4 cursor-pointer hover:shadow-elevated transition-shadow"
    >
      <div className="relative">
        <img
          src={meal.imageUrl}
          alt="Refeição"
          className="w-16 h-16 rounded-lg object-cover"
        />
        {meal.confidence < 0.8 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-warning rounded-full flex items-center justify-center">
            <span className="text-[10px] text-warning-foreground">!</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-primary bg-accent px-2 py-0.5 rounded-full">
            {mealTypeLabels[meal.mealType]}
          </span>
        </div>
        <p className="text-sm font-medium text-foreground truncate">
          {meal.foods.slice(0, 2).join(', ')}
          {meal.foods.length > 2 && ` +${meal.foods.length - 2}`}
        </p>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {time}
          </span>
          <span className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-macro-carbs" />
            {totalCalories} kcal
          </span>
        </div>
      </div>

      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </motion.div>
  );
};

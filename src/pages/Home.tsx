import { motion } from 'framer-motion';
import { Plus, Flame, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ProgressRing } from '@/components/ProgressRing';
import { MacroCard } from '@/components/MacroCard';
import { MealCard } from '@/components/MealCard';
import { BottomNav } from '@/components/BottomNav';
import { useNutritionStore } from '@/store/nutritionStore';

export const Home = () => {
  const navigate = useNavigate();
  const { userGoals, getMealsForDate, getDailySummary, currentUser } = useNutritionStore();
  
  const today = new Date();
  const todayMeals = getMealsForDate(today);
  const summary = getDailySummary(today);

  const currentCalories = summary?.totalCalories || 0;
  const calorieProgress = (currentCalories / userGoals.dailyCalories) * 100;
  const remainingCalories = Math.max(userGoals.dailyCalories - currentCalories, 0);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-hero px-6 pt-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <p className="text-sm text-muted-foreground">{greeting()},</p>
            <h1 className="text-xl font-bold font-display text-foreground">
              {currentUser?.name || 'Usuário'}
            </h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg">👋</span>
          </div>
        </motion.div>

        {/* Calorie Progress */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-6 shadow-card"
        >
          <div className="flex items-center gap-6">
            <ProgressRing
              progress={calorieProgress}
              size={100}
              strokeWidth={8}
              color="hsl(var(--primary))"
            >
              <div className="text-center">
                <Flame className="w-5 h-5 text-macro-carbs mx-auto mb-1" />
                <span className="text-lg font-bold font-display">{Math.round(currentCalories)}</span>
              </div>
            </ProgressRing>

            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Consumido hoje</p>
              <p className="text-2xl font-bold font-display text-foreground">
                {Math.round(currentCalories)} <span className="text-sm font-normal text-muted-foreground">kcal</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">
                  {Math.round(remainingCalories)} kcal restantes
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Macros */}
      <section className="px-6 -mt-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3"
        >
          <MacroCard
            label="Carboidratos"
            current={summary?.totalCarbs || 0}
            goal={userGoals.dailyCarbs}
            colorClass="text-macro-carbs"
          />
          <MacroCard
            label="Proteínas"
            current={summary?.totalProtein || 0}
            goal={userGoals.dailyProtein}
            colorClass="text-macro-protein"
          />
          <MacroCard
            label="Gorduras"
            current={summary?.totalFat || 0}
            goal={userGoals.dailyFat}
            colorClass="text-macro-fat"
          />
          <MacroCard
            label="Fibras"
            current={summary?.totalFiber || 0}
            goal={userGoals.dailyFiber}
            colorClass="text-macro-fiber"
          />
        </motion.div>
      </section>

      {/* Quick Add Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="px-6 mt-6"
      >
        <Button
          variant="outline"
          size="lg"
          className="w-full justify-start gap-3"
          onClick={() => navigate('/capture')}
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Plus className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-medium">Adicionar Refeição</p>
            <p className="text-xs text-muted-foreground">Tire uma foto ou adicione manualmente</p>
          </div>
        </Button>
      </motion.div>

      {/* Today's Meals */}
      <section className="px-6 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold font-display text-foreground">Refeições de Hoje</h2>
          {todayMeals.length > 0 && (
            <button
              onClick={() => navigate('/history')}
              className="text-sm text-primary font-medium"
            >
              Ver todas
            </button>
          )}
        </div>

        {todayMeals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-2xl p-8 text-center shadow-card"
          >
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">🍽️</span>
            </div>
            <p className="text-muted-foreground mb-4">
              Nenhuma refeição registrada hoje
            </p>
            <Button variant="hero" onClick={() => navigate('/capture')}>
              Adicionar Primeira Refeição
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {todayMeals.slice(0, 3).map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onClick={() => navigate(`/meal/${meal.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      <BottomNav />
    </div>
  );
};

export default Home;

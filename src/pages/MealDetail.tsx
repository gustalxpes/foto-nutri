import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2, Clock, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNutritionStore } from '@/store/nutritionStore';
import { mealTypeLabels } from '@/types/nutrition';
import { toast } from 'sonner';

export const MealDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { meals, deleteMeal } = useNutritionStore();

  const meal = meals.find((m) => m.id === id);

  if (!meal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Refeição não encontrada</p>
          <Button variant="hero" onClick={() => navigate('/home')}>
            Voltar para Home
          </Button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    deleteMeal(meal.id);
    toast.success('Refeição removida');
    navigate(-1);
  };

  const totalCalories = Math.round(meal.nutrition.calories * meal.servings);
  const datetime = new Date(meal.datetime);

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Image */}
      <div className="relative">
        <img
          src={meal.imageUrl}
          alt="Refeição"
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 to-transparent" />
        <header className="absolute top-0 left-0 right-0 flex items-center justify-between p-4">
          <Button
            variant="glass"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="glass"
            size="icon"
            onClick={handleDelete}
            className="text-destructive"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        </header>
      </div>

      <div className="px-6 py-6 -mt-8 relative">
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 shadow-card mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm font-medium">
              {mealTypeLabels[meal.mealType]}
            </span>
            {meal.confidence < 0.8 && (
              <span className="px-3 py-1 bg-warning/20 text-warning rounded-full text-xs font-medium">
                Estimativa
              </span>
            )}
          </div>

          <h1 className="text-xl font-bold font-display text-foreground mb-2">
            {meal.foods.join(', ')}
          </h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {datetime.toLocaleDateString('pt-BR')} às{' '}
              {datetime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </motion.div>

        {/* Nutrition Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-6 shadow-card mb-6"
        >
          <h2 className="text-lg font-semibold font-display text-foreground mb-4">
            Informações Nutricionais
          </h2>

          <div className="flex items-center justify-center mb-6">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-2 mx-auto">
                <Flame className="w-8 h-8 text-macro-carbs" />
              </div>
              <span className="text-3xl font-bold font-display text-foreground">
                {totalCalories}
              </span>
              <span className="text-muted-foreground ml-1">kcal</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted rounded-xl p-4 text-center">
              <span className="text-2xl font-bold text-macro-carbs">
                {Math.round(meal.nutrition.carbs * meal.servings)}g
              </span>
              <p className="text-sm text-muted-foreground">Carboidratos</p>
            </div>
            <div className="bg-muted rounded-xl p-4 text-center">
              <span className="text-2xl font-bold text-macro-protein">
                {Math.round(meal.nutrition.protein * meal.servings)}g
              </span>
              <p className="text-sm text-muted-foreground">Proteínas</p>
            </div>
            <div className="bg-muted rounded-xl p-4 text-center">
              <span className="text-2xl font-bold text-macro-fat">
                {Math.round(meal.nutrition.fat * meal.servings)}g
              </span>
              <p className="text-sm text-muted-foreground">Gorduras</p>
            </div>
            <div className="bg-muted rounded-xl p-4 text-center">
              <span className="text-2xl font-bold text-macro-fiber">
                {Math.round(meal.nutrition.fiber * meal.servings)}g
              </span>
              <p className="text-sm text-muted-foreground">Fibras</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Porções</span>
              <span className="font-semibold">{meal.servings}x</span>
            </div>
          </div>
        </motion.div>

        {/* Foods List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-6 shadow-card"
        >
          <h2 className="text-lg font-semibold font-display text-foreground mb-4">
            Alimentos Identificados
          </h2>
          <div className="flex flex-wrap gap-2">
            {meal.foods.map((food) => (
              <span
                key={food}
                className="px-4 py-2 bg-accent text-accent-foreground rounded-full text-sm font-medium"
              >
                {food}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MealDetail;

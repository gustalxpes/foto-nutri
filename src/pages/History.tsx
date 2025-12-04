import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MealCard } from '@/components/MealCard';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { mealTypeLabels, Meal } from '@/types/nutrition';

interface MealData {
  id: string;
  datetime: string;
  meal_type: string;
  image_url: string | null;
  servings: number;
  foods: string[];
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  fiber: number;
}

export const History = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [meals, setMeals] = useState<MealData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState<Meal['mealType'] | 'todos'>('todos');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      fetchMeals();
    }
  }, [user, authLoading, navigate, selectedDate]);

  const fetchMeals = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .gte('datetime', startOfDay.toISOString())
        .lte('datetime', endOfDay.toISOString())
        .order('datetime', { ascending: false });

      if (error) {
        console.error('Error fetching meals:', error);
        return;
      }

      setMeals(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const filteredMeals = useMemo(() => {
    return meals.filter((meal) => {
      const matchesFilter = filter === 'todos' || meal.meal_type === filter;
      return matchesFilter;
    });
  }, [meals, filter]);

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const isToday = isSameDay(selectedDate, new Date());

  const filterOptions: (Meal['mealType'] | 'todos')[] = ['todos', 'café', 'almoço', 'jantar', 'lanche'];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-hero px-6 pt-6 pb-6">
        <h1 className="text-2xl font-bold font-display text-foreground mb-4">Histórico</h1>

        {/* Date Navigator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-4 shadow-card"
        >
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateDay('prev')}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {isToday ? 'Hoje' : formatDate(selectedDate).split(',')[0]}
              </p>
              <p className="font-semibold text-foreground capitalize">
                {selectedDate.toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateDay('next')}
              disabled={isToday}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </header>

      {/* Filter */}
      <section className="px-6 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filterOptions.map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === option
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              {option === 'todos' ? 'Todos' : mealTypeLabels[option]}
            </button>
          ))}
        </div>
      </section>

      {/* Meals List */}
      <section className="px-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredMeals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-card rounded-2xl p-8 text-center shadow-card"
          >
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">
              Nenhuma refeição registrada {isToday ? 'hoje' : 'nesta data'}
            </p>
            <Button variant="hero" onClick={() => navigate('/capture')}>
              Adicionar Refeição
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredMeals.map((meal, index) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MealCard
                  meal={{
                    id: meal.id,
                    userId: user?.id || '',
                    datetime: new Date(meal.datetime),
                    mealType: meal.meal_type as Meal['mealType'],
                    imageUrl: meal.image_url || '',
                    servings: meal.servings,
                    nutrition: {
                      calories: meal.calories,
                      carbs: meal.carbs,
                      protein: meal.protein,
                      fat: meal.fat,
                      fiber: meal.fiber,
                    },
                    foods: meal.foods,
                  }}
                  onClick={() => navigate(`/meal/${meal.id}`)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <BottomNav />
    </div>
  );
};

export default History;

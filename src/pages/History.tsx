import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MealCard } from '@/components/MealCard';
import { BottomNav } from '@/components/BottomNav';
import { useNutritionStore } from '@/store/nutritionStore';
import { mealTypeLabels, Meal } from '@/types/nutrition';

export const History = () => {
  const navigate = useNavigate();
  const { meals } = useNutritionStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState<Meal['mealType'] | 'todos'>('todos');

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
    return meals
      .filter((meal) => {
        const matchesDate = isSameDay(new Date(meal.datetime), selectedDate);
        const matchesFilter = filter === 'todos' || meal.mealType === filter;
        return matchesDate && matchesFilter;
      })
      .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
  }, [meals, selectedDate, filter]);

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const isToday = isSameDay(selectedDate, new Date());

  const filterOptions: (Meal['mealType'] | 'todos')[] = ['todos', 'café', 'almoço', 'jantar', 'lanche'];

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
        {filteredMeals.length === 0 ? (
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
                  meal={meal}
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

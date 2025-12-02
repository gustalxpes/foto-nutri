import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Flame, Target } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { ProgressRing } from '@/components/ProgressRing';
import { useNutritionStore } from '@/store/nutritionStore';

export const Reports = () => {
  const { meals, userGoals, dailySummaries } = useNutritionStore();

  // Get last 7 days data
  const weeklyData = useMemo(() => {
    const days: { date: Date; calories: number; target: number }[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const summary = dailySummaries.find(
        (s) => new Date(s.date).toDateString() === date.toDateString()
      );

      days.push({
        date,
        calories: summary?.totalCalories || 0,
        target: userGoals.dailyCalories,
      });
    }

    return days;
  }, [dailySummaries, userGoals]);

  // Calculate weekly totals and averages
  const weeklyStats = useMemo(() => {
    const totalCalories = weeklyData.reduce((sum, day) => sum + day.calories, 0);
    const daysWithData = weeklyData.filter((d) => d.calories > 0).length;
    const avgCalories = daysWithData > 0 ? totalCalories / daysWithData : 0;
    const weeklyTarget = userGoals.dailyCalories * 7;
    const onTrack = totalCalories <= weeklyTarget;

    return {
      totalCalories,
      avgCalories,
      weeklyTarget,
      onTrack,
      daysTracked: daysWithData,
    };
  }, [weeklyData, userGoals]);

  const maxCalories = Math.max(
    ...weeklyData.map((d) => d.calories),
    userGoals.dailyCalories
  );

  const getDayLabel = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-hero px-6 pt-6 pb-6">
        <h1 className="text-2xl font-bold font-display text-foreground mb-2">Relatórios</h1>
        <p className="text-muted-foreground">Acompanhe seu progresso</p>
      </header>

      <div className="px-6 py-4">
        {/* Weekly Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 shadow-card mb-6"
        >
          <h2 className="text-lg font-semibold font-display text-foreground mb-4">
            Resumo Semanal
          </h2>

          <div className="flex items-center gap-6">
            <ProgressRing
              progress={(weeklyStats.totalCalories / weeklyStats.weeklyTarget) * 100}
              size={100}
              strokeWidth={8}
              color={weeklyStats.onTrack ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
            >
              <div className="text-center">
                <Target className="w-5 h-5 text-primary mx-auto mb-1" />
                <span className="text-xs text-muted-foreground">{weeklyStats.daysTracked}/7</span>
              </div>
            </ProgressRing>

            <div className="flex-1 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Total da semana</p>
                <p className="text-2xl font-bold font-display text-foreground">
                  {Math.round(weeklyStats.totalCalories).toLocaleString()} kcal
                </p>
              </div>
              <div className="flex items-center gap-2">
                {weeklyStats.onTrack ? (
                  <>
                    <TrendingDown className="w-4 h-4 text-primary" />
                    <span className="text-sm text-primary font-medium">Dentro da meta</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 text-destructive" />
                    <span className="text-sm text-destructive font-medium">Acima da meta</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Weekly Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-6 shadow-card mb-6"
        >
          <h2 className="text-lg font-semibold font-display text-foreground mb-4">
            Últimos 7 dias
          </h2>

          <div className="flex items-end justify-between gap-2 h-40 mb-4">
            {weeklyData.map((day, index) => {
              const height = maxCalories > 0 ? (day.calories / maxCalories) * 100 : 0;
              const isToday = index === weeklyData.length - 1;
              const isOverTarget = day.calories > userGoals.dailyCalories;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {day.calories > 0 ? Math.round(day.calories) : '-'}
                  </span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(height, 4)}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className={`w-full rounded-t-lg ${
                      day.calories === 0
                        ? 'bg-muted'
                        : isOverTarget
                        ? 'bg-destructive/80'
                        : isToday
                        ? 'gradient-primary'
                        : 'bg-primary/60'
                    }`}
                  />
                  <span className={`text-xs capitalize ${isToday ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                    {getDayLabel(day.date)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Target line indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-3 h-3 rounded bg-primary/60" />
            <span>Dentro da meta</span>
            <div className="w-3 h-3 rounded bg-destructive/80 ml-4" />
            <span>Acima da meta</span>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="bg-card rounded-xl p-4 shadow-card">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-3">
              <Flame className="w-5 h-5 text-macro-carbs" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Média diária</p>
            <p className="text-xl font-bold font-display text-foreground">
              {Math.round(weeklyStats.avgCalories)} kcal
            </p>
          </div>

          <div className="bg-card rounded-xl p-4 shadow-card">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-3">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Meta diária</p>
            <p className="text-xl font-bold font-display text-foreground">
              {userGoals.dailyCalories} kcal
            </p>
          </div>
        </motion.div>

        {/* Tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-accent rounded-2xl p-4 mt-6"
        >
          <p className="text-sm text-accent-foreground">
            💡 <strong>Dica:</strong> Registre suas refeições consistentemente para ter uma visão
            mais precisa do seu consumo nutricional ao longo do tempo.
          </p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Reports;

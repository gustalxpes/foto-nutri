import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Flame, Target, Loader2 } from 'lucide-react';
import { BottomNav } from '@/components/BottomNav';
import { ProgressRing } from '@/components/ProgressRing';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, ReferenceLine, Tooltip } from 'recharts';

interface Profile {
  daily_calories_goal: number;
  daily_carbs_goal: number;
  daily_protein_goal: number;
  daily_fat_goal: number;
  daily_fiber_goal: number;
  diet_days: number[];
}

interface DayData {
  date: Date;
  calories: number;
  target: number;
  dayOfWeek: number;
  isDietDay: boolean;
}

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export const Reports = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [weeklyData, setWeeklyData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();

      // Real-time subscription for meals
      const mealsChannel = supabase
        .channel('reports-meals')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'meals',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchData();
          }
        )
        .subscribe();

      // Real-time subscription for profile
      const profileChannel = supabase
        .channel('reports-profile')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(mealsChannel);
        supabase.removeChannel(profileChannel);
      };
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('daily_calories_goal, daily_carbs_goal, daily_protein_goal, daily_fat_goal, daily_fiber_goal, diet_days')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      const userProfile: Profile = {
        daily_calories_goal: profileData?.daily_calories_goal || 2000,
        daily_carbs_goal: profileData?.daily_carbs_goal || 250,
        daily_protein_goal: profileData?.daily_protein_goal || 150,
        daily_fat_goal: profileData?.daily_fat_goal || 65,
        daily_fiber_goal: profileData?.daily_fiber_goal || 30,
        diet_days: profileData?.diet_days || [1, 2, 3, 4, 5],
      };
      setProfile(userProfile);

      // Fetch meals for last 7 days
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const { data: mealsData, error: mealsError } = await supabase
        .from('meals')
        .select('datetime, calories')
        .eq('user_id', user.id)
        .gte('datetime', sevenDaysAgo.toISOString())
        .lte('datetime', new Date(today.setHours(23, 59, 59, 999)).toISOString());

      if (mealsError) throw mealsError;

      // Build weekly data
      const days: DayData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dayOfWeek = date.getDay();

        const dayMeals = mealsData?.filter((meal) => {
          const mealDate = new Date(meal.datetime);
          return mealDate.toDateString() === date.toDateString();
        }) || [];

        const totalCalories = dayMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);

        days.push({
          date,
          calories: totalCalories,
          target: userProfile.daily_calories_goal,
          dayOfWeek,
          isDietDay: userProfile.diet_days.includes(dayOfWeek),
        });
      }

      setWeeklyData(days);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  };

  const toggleDietDay = async (dayOfWeek: number) => {
    if (!user || !profile) return;

    const newDietDays = profile.diet_days.includes(dayOfWeek)
      ? profile.diet_days.filter((d) => d !== dayOfWeek)
      : [...profile.diet_days, dayOfWeek].sort();

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ diet_days: newDietDays })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile({ ...profile, diet_days: newDietDays });
      setWeeklyData((prev) =>
        prev.map((day) => ({
          ...day,
          isDietDay: newDietDays.includes(day.dayOfWeek),
        }))
      );
      toast.success('Dias de dieta atualizados');
    } catch (error) {
      console.error('Erro ao atualizar dias de dieta:', error);
      toast.error('Erro ao atualizar');
    }
  };

  const weeklyStats = useMemo(() => {
    if (!profile) return null;

    const dietDaysData = weeklyData.filter((d) => d.isDietDay);
    const totalCalories = dietDaysData.reduce((sum, day) => sum + day.calories, 0);
    const daysWithData = dietDaysData.filter((d) => d.calories > 0).length;
    const avgCalories = daysWithData > 0 ? totalCalories / daysWithData : 0;
    const weeklyTarget = profile.daily_calories_goal * dietDaysData.length;
    const onTrack = totalCalories <= weeklyTarget;

    return {
      totalCalories,
      avgCalories,
      weeklyTarget,
      onTrack,
      daysTracked: daysWithData,
      totalDietDays: dietDaysData.length,
    };
  }, [weeklyData, profile]);

  const getDayLabel = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile || !weeklyStats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-hero px-6 pt-6 pb-6">
        <h1 className="text-2xl font-bold font-display text-foreground mb-2">Relatórios</h1>
        <p className="text-muted-foreground">Acompanhe seu progresso</p>
      </header>

      <div className="px-6 py-4">
        {/* Diet Days Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 shadow-card mb-6"
        >
          <h2 className="text-lg font-semibold font-display text-foreground mb-4">
            Dias de Dieta
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Selecione os dias em que você quer manter a dieta
          </p>
          <div className="flex justify-between gap-2">
            {WEEKDAY_LABELS.map((label, index) => (
              <button
                key={index}
                onClick={() => toggleDietDay(index)}
                className={`flex-1 py-2 px-1 rounded-lg text-sm font-medium transition-colors ${
                  profile.diet_days.includes(index)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Weekly Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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
                <span className="text-xs text-muted-foreground">
                  {weeklyStats.daysTracked}/{weeklyStats.totalDietDays}
                </span>
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
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-6 shadow-card mb-6"
        >
          <h2 className="text-lg font-semibold font-display text-foreground mb-4">
            Últimos 7 dias
          </h2>

          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyData.map((day) => ({
                  name: getDayLabel(day.date),
                  calories: day.calories,
                  target: profile.daily_calories_goal,
                  isDietDay: day.isDietDay,
                  isOverTarget: day.calories > profile.daily_calories_goal,
                  isToday: day.date.toDateString() === new Date().toDateString(),
                }))}
                margin={{ top: 20, right: 5, left: 5, bottom: 5 }}
              >
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  formatter={(value: number) => [`${Math.round(value)} kcal`, 'Calorias']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <ReferenceLine 
                  y={profile.daily_calories_goal} 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="3 3"
                  label={{ 
                    value: `Meta: ${profile.daily_calories_goal}`, 
                    position: 'top',
                    fontSize: 10,
                    fill: 'hsl(var(--muted-foreground))'
                  }}
                />
                <Bar 
                  dataKey="calories" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                >
                  {weeklyData.map((day, index) => {
                    const isOverTarget = day.calories > profile.daily_calories_goal;
                    const isToday = day.date.toDateString() === new Date().toDateString();
                    
                    let fill = 'hsl(var(--muted))';
                    if (!day.isDietDay) {
                      fill = 'hsl(var(--muted) / 0.5)';
                    } else if (day.calories === 0) {
                      fill = 'hsl(var(--muted))';
                    } else if (isOverTarget) {
                      fill = 'hsl(var(--destructive) / 0.8)';
                    } else if (isToday) {
                      fill = 'hsl(var(--primary))';
                    } else {
                      fill = 'hsl(var(--primary) / 0.6)';
                    }
                    
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary/60" />
              <span>Dentro da meta</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-destructive/80" />
              <span>Acima da meta</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-muted/50" />
              <span>Dia livre</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
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
              {profile.daily_calories_goal} kcal
            </p>
          </div>
        </motion.div>

        {/* Tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
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
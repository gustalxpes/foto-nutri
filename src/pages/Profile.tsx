import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Target, LogOut, ChevronRight, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfileData {
  name: string | null;
  email: string | null;
  daily_calories_goal: number | null;
  daily_carbs_goal: number | null;
  daily_protein_goal: number | null;
  daily_fat_goal: number | null;
  daily_fiber_goal: number | null;
}

export const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedGoals, setEditedGoals] = useState({
    dailyCalories: 2000,
    dailyCarbs: 250,
    dailyProtein: 150,
    dailyFat: 65,
    dailyFiber: 30,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('name, email, daily_calories_goal, daily_carbs_goal, daily_protein_goal, daily_fat_goal, daily_fiber_goal')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
        setEditedGoals({
          dailyCalories: data.daily_calories_goal || 2000,
          dailyCarbs: data.daily_carbs_goal || 250,
          dailyProtein: data.daily_protein_goal || 150,
          dailyFat: data.daily_fat_goal || 65,
          dailyFiber: data.daily_fiber_goal || 30,
        });
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoals = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          daily_calories_goal: editedGoals.dailyCalories,
          daily_carbs_goal: editedGoals.dailyCarbs,
          daily_protein_goal: editedGoals.dailyProtein,
          daily_fat_goal: editedGoals.dailyFat,
          daily_fiber_goal: editedGoals.dailyFiber,
        })
        .eq('user_id', user.id);

      if (error) {
        toast.error('Erro ao salvar metas');
        console.error('Error saving goals:', error);
        return;
      }

      setProfile((prev) => prev ? {
        ...prev,
        daily_calories_goal: editedGoals.dailyCalories,
        daily_carbs_goal: editedGoals.dailyCarbs,
        daily_protein_goal: editedGoals.dailyProtein,
        daily_fat_goal: editedGoals.dailyFat,
        daily_fiber_goal: editedGoals.dailyFiber,
      } : null);
      
      setIsEditingGoals(false);
      toast.success('Metas atualizadas com sucesso!');
    } catch (err) {
      console.error('Error:', err);
      toast.error('Erro ao salvar metas');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.success('Você saiu da sua conta');
    navigate('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const userGoals = {
    dailyCalories: profile?.daily_calories_goal || 2000,
    dailyCarbs: profile?.daily_carbs_goal || 250,
    dailyProtein: profile?.daily_protein_goal || 150,
    dailyFat: profile?.daily_fat_goal || 65,
    dailyFiber: profile?.daily_fiber_goal || 30,
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-hero px-6 pt-6 pb-8">
        <h1 className="text-2xl font-bold font-display text-foreground mb-6">Perfil</h1>

        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 shadow-card"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {profile?.name || 'Usuário'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {profile?.email || user?.email || 'usuario@email.com'}
              </p>
            </div>
          </div>
        </motion.div>
      </header>

      <div className="px-6">
        {/* Goals Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl shadow-card mb-4 overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <span className="font-semibold text-foreground">Metas Diárias</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingGoals(!isEditingGoals)}
            >
              {isEditingGoals ? 'Cancelar' : 'Editar'}
            </Button>
          </div>

          {isEditingGoals ? (
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Calorias (kcal)</Label>
                  <Input
                    type="number"
                    value={editedGoals.dailyCalories}
                    onChange={(e) =>
                      setEditedGoals({ ...editedGoals, dailyCalories: Number(e.target.value) })
                    }
                    className="h-10"
                  />
                </div>
                <div>
                  <Label className="text-xs">Carboidratos (g)</Label>
                  <Input
                    type="number"
                    value={editedGoals.dailyCarbs}
                    onChange={(e) =>
                      setEditedGoals({ ...editedGoals, dailyCarbs: Number(e.target.value) })
                    }
                    className="h-10"
                  />
                </div>
                <div>
                  <Label className="text-xs">Proteínas (g)</Label>
                  <Input
                    type="number"
                    value={editedGoals.dailyProtein}
                    onChange={(e) =>
                      setEditedGoals({ ...editedGoals, dailyProtein: Number(e.target.value) })
                    }
                    className="h-10"
                  />
                </div>
                <div>
                  <Label className="text-xs">Gorduras (g)</Label>
                  <Input
                    type="number"
                    value={editedGoals.dailyFat}
                    onChange={(e) =>
                      setEditedGoals({ ...editedGoals, dailyFat: Number(e.target.value) })
                    }
                    className="h-10"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs">Fibras (g)</Label>
                  <Input
                    type="number"
                    value={editedGoals.dailyFiber}
                    onChange={(e) =>
                      setEditedGoals({ ...editedGoals, dailyFiber: Number(e.target.value) })
                    }
                    className="h-10"
                  />
                </div>
              </div>
              <Button 
                variant="hero" 
                className="w-full" 
                onClick={handleSaveGoals}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Salvar Metas
              </Button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Calorias</span>
                <span className="font-semibold">{userGoals.dailyCalories} kcal</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Carboidratos</span>
                <span className="font-semibold">{userGoals.dailyCarbs}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Proteínas</span>
                <span className="font-semibold">{userGoals.dailyProtein}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Gorduras</span>
                <span className="font-semibold">{userGoals.dailyFat}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Fibras</span>
                <span className="font-semibold">{userGoals.dailyFiber}g</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl shadow-card overflow-hidden"
        >
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-destructive" />
              </div>
              <span className="font-medium text-destructive">Sair da Conta</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;

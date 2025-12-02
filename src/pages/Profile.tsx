import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Target, LogOut, ChevronRight, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BottomNav } from '@/components/BottomNav';
import { useNutritionStore } from '@/store/nutritionStore';
import { toast } from 'sonner';

export const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, userGoals, setUserGoals, setCurrentUser } = useNutritionStore();
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [editedGoals, setEditedGoals] = useState(userGoals);

  const handleSaveGoals = () => {
    setUserGoals(editedGoals);
    setIsEditingGoals(false);
    toast.success('Metas atualizadas com sucesso!');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    toast.success('Você saiu da sua conta');
    navigate('/');
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
                {currentUser?.name || 'Usuário'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentUser?.email || 'usuario@email.com'}
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
              <Button variant="hero" className="w-full" onClick={handleSaveGoals}>
                <Save className="w-4 h-4 mr-2" />
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

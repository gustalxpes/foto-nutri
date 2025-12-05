import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Goals {
  dailyCalories: number;
  dailyCarbs: number;
  dailyProtein: number;
  dailyFat: number;
  dailyFiber: number;
}

interface GoalsEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals: Goals;
  onSave: (goals: Goals) => Promise<void>;
}

export const GoalsEditModal = ({ isOpen, onClose, goals, onSave }: GoalsEditModalProps) => {
  const [editedGoals, setEditedGoals] = useState<Goals>(goals);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editedGoals);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold font-display text-foreground">Editar Metas</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Calorias (kcal)</Label>
              <Input
                type="number"
                value={editedGoals.dailyCalories}
                onChange={(e) => setEditedGoals({ ...editedGoals, dailyCalories: Number(e.target.value) })}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-muted-foreground">Carboidratos (g)</Label>
                <Input
                  type="number"
                  value={editedGoals.dailyCarbs}
                  onChange={(e) => setEditedGoals({ ...editedGoals, dailyCarbs: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Proteínas (g)</Label>
                <Input
                  type="number"
                  value={editedGoals.dailyProtein}
                  onChange={(e) => setEditedGoals({ ...editedGoals, dailyProtein: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Gorduras (g)</Label>
                <Input
                  type="number"
                  value={editedGoals.dailyFat}
                  onChange={(e) => setEditedGoals({ ...editedGoals, dailyFat: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Fibras (g)</Label>
                <Input
                  type="number"
                  value={editedGoals.dailyFiber}
                  onChange={(e) => setEditedGoals({ ...editedGoals, dailyFiber: Number(e.target.value) })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="hero" className="flex-1" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

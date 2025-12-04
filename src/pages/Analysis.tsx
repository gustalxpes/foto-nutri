import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, AlertTriangle, Minus, Plus, X, Edit2, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Meal, mealTypeLabels } from '@/types/nutrition';
import { toast } from 'sonner';
import sampleMealImage from '@/assets/sample-meal.jpg';

interface FoodDetail {
  name: string;
  grams: number;
}

interface AnalysisResult {
  foods: string[];
  food_details?: FoodDetail[];
  nutrition: {
    calories: number;
    carbs: number;
    protein: number;
    fat: number;
    fiber: number;
  };
  confidence: number;
}

// Fallback for when no analysis result is provided
const defaultAnalysis: AnalysisResult = {
  foods: ['Alimento não identificado'],
  food_details: [{ name: 'Alimento não identificado', grams: 0 }],
  nutrition: {
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0,
    fiber: 0,
  },
  confidence: 0,
};

export const Analysis = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const imageUrl = location.state?.imageUrl || sampleMealImage;
  const analysisResult: AnalysisResult = location.state?.analysisResult || defaultAnalysis;
  
  // Initialize food details from analysis or create from foods array
  const initialFoodDetails: FoodDetail[] = analysisResult.food_details || 
    analysisResult.foods.map((food) => ({ name: food, grams: 100 }));
  
  const [servings, setServings] = useState(1);
  const [mealType, setMealType] = useState<Meal['mealType']>('almoço');
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingFoods, setIsEditingFoods] = useState(false);
  const [editedNutrition, setEditedNutrition] = useState(analysisResult.nutrition);
  const [foodDetails, setFoodDetails] = useState<FoodDetail[]>(initialFoodDetails);
  const [isSaving, setIsSaving] = useState(false);

  const adjustedNutrition = {
    calories: Math.round(editedNutrition.calories * servings),
    carbs: Math.round(editedNutrition.carbs * servings),
    protein: Math.round(editedNutrition.protein * servings),
    fat: Math.round(editedNutrition.fat * servings),
    fiber: Math.round(editedNutrition.fiber * servings),
  };

  const updateFoodGrams = (index: number, grams: number) => {
    const newFoodDetails = [...foodDetails];
    newFoodDetails[index] = { ...newFoodDetails[index], grams };
    setFoodDetails(newFoodDetails);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Você precisa estar logado para salvar refeições');
        navigate('/login');
        return;
      }

      const foodNames = foodDetails.map((f) => `${f.name} (${f.grams}g)`);

      const { error } = await supabase.from('meals').insert({
        user_id: user.id,
        datetime: new Date().toISOString(),
        meal_type: mealType,
        image_url: imageUrl,
        servings,
        foods: foodNames,
        calories: adjustedNutrition.calories,
        carbs: adjustedNutrition.carbs,
        protein: adjustedNutrition.protein,
        fat: adjustedNutrition.fat,
        fiber: adjustedNutrition.fiber,
        confidence: analysisResult.confidence,
      });

      if (error) {
        console.error('Erro ao salvar:', error);
        toast.error('Erro ao salvar refeição. Tente novamente.');
        return;
      }

      toast.success('Refeição registrada com sucesso!');
      navigate('/home');
    } catch (err) {
      console.error('Erro:', err);
      toast.error('Erro ao salvar refeição');
    } finally {
      setIsSaving(false);
    }
  };

  const mealTypes: Meal['mealType'][] = ['café', 'almoço', 'jantar', 'lanche', 'outro'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-4 pb-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <X className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold font-display">Resultado da Análise</h1>
        <div className="w-10" />
      </header>

      <div className="px-6 pb-8">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden mb-6 aspect-video"
        >
          <img
            src={imageUrl}
            alt="Refeição analisada"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {analysisResult.confidence < 0.8 && (
            <div className="absolute top-3 left-3 bg-warning/90 text-warning-foreground px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm font-medium">
              <AlertTriangle className="w-4 h-4" />
              Estimativa imprecisa
            </div>
          )}
        </motion.div>

        {/* Foods Identified with Grams */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-4 shadow-card mb-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-medium text-muted-foreground">Alimentos identificados</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingFoods(!isEditingFoods)}
              className="text-primary"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              {isEditingFoods ? 'Concluir' : 'Editar'}
            </Button>
          </div>

          {isEditingFoods ? (
            <div className="space-y-3">
              {foodDetails.map((food, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="flex-1 text-sm text-foreground">{food.name}</span>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={food.grams}
                      onChange={(e) => updateFoodGrams(index, Number(e.target.value))}
                      className="w-20 h-8 text-center"
                    />
                    <span className="text-sm text-muted-foreground">g</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {foodDetails.map((food, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-2 bg-accent rounded-lg"
                >
                  <span className="text-sm font-medium text-accent-foreground">{food.name}</span>
                  <span className="text-sm text-muted-foreground">{food.grams}g</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Meal Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-xl p-4 shadow-card mb-4"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Tipo de refeição</h3>
          <div className="flex flex-wrap gap-2">
            {mealTypes.map((type) => (
              <button
                key={type}
                onClick={() => setMealType(type)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  mealType === type
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {mealTypeLabels[type]}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Servings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl p-4 shadow-card mb-4"
        >
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Porção</h3>
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setServings(Math.max(0.5, servings - 0.5))}
              disabled={servings <= 0.5}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-2xl font-bold font-display min-w-[60px] text-center">
              {servings}x
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setServings(servings + 0.5)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Nutrition Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card rounded-xl p-4 shadow-card mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">Valores nutricionais</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="text-primary"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              {isEditing ? 'Concluir' : 'Editar'}
            </Button>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Calorias (kcal)</Label>
                  <Input
                    type="number"
                    value={editedNutrition.calories}
                    onChange={(e) =>
                      setEditedNutrition({ ...editedNutrition, calories: Number(e.target.value) })
                    }
                    className="h-10"
                  />
                </div>
                <div>
                  <Label className="text-xs">Carboidratos (g)</Label>
                  <Input
                    type="number"
                    value={editedNutrition.carbs}
                    onChange={(e) =>
                      setEditedNutrition({ ...editedNutrition, carbs: Number(e.target.value) })
                    }
                    className="h-10"
                  />
                </div>
                <div>
                  <Label className="text-xs">Proteínas (g)</Label>
                  <Input
                    type="number"
                    value={editedNutrition.protein}
                    onChange={(e) =>
                      setEditedNutrition({ ...editedNutrition, protein: Number(e.target.value) })
                    }
                    className="h-10"
                  />
                </div>
                <div>
                  <Label className="text-xs">Gorduras (g)</Label>
                  <Input
                    type="number"
                    value={editedNutrition.fat}
                    onChange={(e) =>
                      setEditedNutrition({ ...editedNutrition, fat: Number(e.target.value) })
                    }
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Calorias</span>
                <span className="font-semibold text-macro-carbs">{adjustedNutrition.calories} kcal</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Carboidratos</span>
                <span className="font-semibold text-macro-carbs">{adjustedNutrition.carbs}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Proteínas</span>
                <span className="font-semibold text-macro-protein">{adjustedNutrition.protein}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Gorduras</span>
                <span className="font-semibold text-macro-fat">{adjustedNutrition.fat}g</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Fibras</span>
                <span className="font-semibold text-macro-fiber">{adjustedNutrition.fiber}g</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          <Button 
            variant="hero" 
            size="xl" 
            className="w-full" 
            onClick={handleSave}
            disabled={isSaving}
          >
            <Check className="w-5 h-5 mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar Refeição'}
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={() => navigate('/capture')}>
            Refazer Análise
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Analysis;
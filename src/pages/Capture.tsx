import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Camera, Image as ImageIcon, X, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const Capture = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setCapturedImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleAnalyze = async () => {
    if (!capturedImage) return;
    
    setIsAnalyzing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: { imageBase64: capturedImage }
      });

      if (error) {
        console.error('Erro na análise:', error);
        toast.error('Erro ao analisar imagem. Tente novamente.');
        setIsAnalyzing(false);
        return;
      }

      if (data.error) {
        toast.error(data.error);
        setIsAnalyzing(false);
        return;
      }

      // Navigate to analysis results with the image and AI results
      navigate('/analysis', { 
        state: { 
          imageUrl: capturedImage,
          analysisResult: data
        } 
      });
    } catch (err) {
      console.error('Erro:', err);
      toast.error('Não foi possível analisar a imagem. Tente novamente.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-4 pb-2">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <X className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold font-display">Nova Refeição</h1>
        <div className="w-10" />
      </header>

      <div className="flex-1 flex flex-col px-6 py-4">
        <AnimatePresence mode="wait">
          {!capturedImage ? (
            <motion.div
              key="capture"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Camera Preview Area */}
              <div className="flex-1 bg-muted rounded-2xl flex items-center justify-center mb-6 min-h-[300px]">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-card mx-auto mb-4 flex items-center justify-center shadow-card">
                    <Camera className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-2">
                    Tire uma foto da sua refeição
                  </p>
                  <p className="text-sm text-muted-foreground/60">
                    Nossa IA irá analisar os nutrientes
                  </p>
                </div>
              </div>

              {/* Capture Buttons */}
              <div className="space-y-3">
                <Button
                  variant="hero"
                  size="xl"
                  className="w-full"
                  onClick={handleCameraCapture}
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Tirar Foto
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Selecionar da Galeria
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Image Preview */}
              <div className="flex-1 relative rounded-2xl overflow-hidden mb-6 min-h-[300px]">
                <img
                  src={capturedImage}
                  alt="Refeição capturada"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center text-primary-foreground">
                      <Loader2 className="w-12 h-12 animate-spin mx-auto mb-3" />
                      <p className="font-medium">Analisando refeição...</p>
                      <p className="text-sm opacity-80">Nossa IA está identificando os alimentos</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  variant="hero"
                  size="xl"
                  className="w-full"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    'Analisar Refeição'
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={handleRetake}
                  disabled={isAnalyzing}
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Refazer Foto
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Capture;

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Camera, BarChart3, Target, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Camera,
    title: 'Foto Inteligente',
    description: 'Tire uma foto e nossa IA analisa os nutrientes',
  },
  {
    icon: BarChart3,
    title: 'Acompanhamento',
    description: 'Monitore seu progresso diário e semanal',
  },
  {
    icon: Target,
    title: 'Metas Personalizadas',
    description: 'Defina seus objetivos nutricionais',
  },
];

export const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8"
        >
          <div className="w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center shadow-glow">
            <Sparkles className="w-12 h-12 text-primary-foreground" />
          </div>
          <motion.div
            className="absolute -right-2 -top-2 w-8 h-8 bg-warning rounded-full flex items-center justify-center"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-lg">🍎</span>
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold font-display text-foreground text-center mb-3"
        >
          NutriSnap
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-lg text-muted-foreground text-center max-w-xs mb-12"
        >
          Controle sua alimentação com inteligência artificial
        </motion.p>

        {/* Features */}
        <div className="w-full max-w-sm space-y-4 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-center gap-4 bg-card rounded-2xl p-4 shadow-card"
            >
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="px-6 pb-8 space-y-3"
      >
        <Button
          variant="hero"
          size="xl"
          className="w-full"
          onClick={() => navigate('/login')}
        >
          Começar Agora
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-primary font-medium hover:underline"
          >
            Entrar
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Welcome;

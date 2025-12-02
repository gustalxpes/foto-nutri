import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail, Lock, User, Sparkles } from 'lucide-react';
import { useNutritionStore } from '@/store/nutritionStore';
import { toast } from 'sonner';

export const Login = () => {
  const navigate = useNavigate();
  const setCurrentUser = useNutritionStore((state) => state.setCurrentUser);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock authentication
    setCurrentUser({
      id: '1',
      name: name || email.split('@')[0],
      email,
    });

    toast.success(isLogin ? 'Bem-vindo de volta!' : 'Conta criada com sucesso!');
    navigate('/home');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 pt-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <Sparkles className="w-10 h-10 text-primary-foreground" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl font-bold font-display text-foreground mb-2"
        >
          {isLogin ? 'Entrar' : 'Criar Conta'}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground mb-8"
        >
          {isLogin ? 'Continue sua jornada nutricional' : 'Comece a monitorar sua alimentação'}
        </motion.p>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-4"
        >
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nome
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-11 h-12 rounded-xl bg-card border-border"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-11 h-12 rounded-xl bg-card border-border"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 h-12 rounded-xl bg-card border-border"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="w-full mt-6"
            disabled={isLoading}
          >
            {isLoading ? 'Carregando...' : isLogin ? 'Entrar' : 'Criar Conta'}
          </Button>
        </motion.form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-sm text-muted-foreground"
        >
          {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-medium hover:underline"
          >
            {isLogin ? 'Criar conta' : 'Entrar'}
          </button>
        </motion.p>
      </div>
    </div>
  );
};

export default Login;

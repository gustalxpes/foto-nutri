import { Home, Clock, User, BarChart3, Plus } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

const navItems = [
  { icon: Home, label: 'Home', path: '/home' },
  { icon: Clock, label: 'Histórico', path: '/history' },
  { icon: null, label: 'Nova', path: '/capture' },
  { icon: BarChart3, label: 'Relatórios', path: '/reports' },
  { icon: User, label: 'Perfil', path: '/profile' },
];

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border safe-area-inset z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const isCenter = index === 2;

          if (isCenter) {
            return (
              <motion.div
                key={item.path}
                className="relative -mt-6"
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="fab"
                  size="fab"
                  onClick={() => navigate(item.path)}
                  className="shadow-glow"
                >
                  <Plus className="w-6 h-6" />
                </Button>
              </motion.div>
            );
          }

          const Icon = item.icon!;

          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute -bottom-0 w-1 h-1 bg-primary rounded-full"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

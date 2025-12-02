import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MacroCardProps {
  label: string;
  current: number;
  goal: number;
  unit?: string;
  colorClass: string;
  icon?: React.ReactNode;
}

export const MacroCard = ({
  label,
  current,
  goal,
  unit = 'g',
  colorClass,
  icon,
}: MacroCardProps) => {
  const percentage = Math.min((current / goal) * 100, 100);
  const isOver = current > goal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-xl p-4 shadow-card"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        {icon}
      </div>
      <div className="flex items-baseline gap-1 mb-3">
        <span className={cn('text-2xl font-bold font-display', isOver ? 'text-destructive' : colorClass)}>
          {Math.round(current)}
        </span>
        <span className="text-sm text-muted-foreground">
          / {goal}{unit}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn(
            'h-full rounded-full',
            isOver ? 'bg-destructive' : colorClass.replace('text-', 'bg-')
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
};

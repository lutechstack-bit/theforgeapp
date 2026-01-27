import React from 'react';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStreak } from '@/hooks/useStreak';

interface StreakBadgeProps {
  className?: string;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({ className }) => {
  const { streak, isActiveToday, isLoading } = useStreak();

  if (isLoading || streak === 0) return null;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium',
        'bg-gradient-to-r from-orange-500/20 to-amber-500/20',
        'border border-orange-500/30',
        'animate-in fade-in-0 slide-in-from-bottom-2 duration-300',
        isActiveToday && 'ring-2 ring-orange-500/40 ring-offset-1 ring-offset-background',
        className
      )}
    >
      <Flame 
        className={cn(
          'w-4 h-4 text-orange-500',
          isActiveToday && 'animate-pulse'
        )} 
      />
      <span className="text-orange-400 font-semibold">
        {streak}-day streak{streak > 1 ? '!' : ''}
      </span>
    </div>
  );
};

import React from 'react';
import { cn } from '@/lib/utils';
import { Lock, Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface StickyNoteCardProps {
  title: string;
  icon?: string;
  color?: string;
  rotation?: number;
  variant: 'completed' | 'current' | 'upcoming';
  completedCount?: number;
  totalCount?: number;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const colorVariants: Record<string, { bg: string; accent: string; pin: string }> = {
  emerald: {
    bg: 'from-emerald-50/90 to-emerald-100/80 dark:from-emerald-950/40 dark:to-emerald-900/30',
    accent: 'text-emerald-600 dark:text-emerald-400',
    pin: 'from-emerald-500 to-emerald-600',
  },
  amber: {
    bg: 'from-amber-50/90 to-amber-100/80 dark:from-amber-950/40 dark:to-amber-900/30',
    accent: 'text-amber-600 dark:text-amber-400',
    pin: 'from-amber-500 to-amber-600',
  },
  blue: {
    bg: 'from-blue-50/90 to-blue-100/80 dark:from-blue-950/40 dark:to-blue-900/30',
    accent: 'text-blue-600 dark:text-blue-400',
    pin: 'from-blue-500 to-blue-600',
  },
  purple: {
    bg: 'from-purple-50/90 to-purple-100/80 dark:from-purple-950/40 dark:to-purple-900/30',
    accent: 'text-purple-600 dark:text-purple-400',
    pin: 'from-purple-500 to-purple-600',
  },
  rose: {
    bg: 'from-rose-50/90 to-rose-100/80 dark:from-rose-950/40 dark:to-rose-900/30',
    accent: 'text-rose-600 dark:text-rose-400',
    pin: 'from-rose-500 to-rose-600',
  },
  primary: {
    bg: 'from-primary/10 to-primary/20',
    accent: 'text-primary',
    pin: 'from-primary to-primary/80',
  },
};

export const StickyNoteCard: React.FC<StickyNoteCardProps> = ({
  title,
  icon = 'Circle',
  color = 'amber',
  rotation = 0,
  variant,
  completedCount = 0,
  totalCount = 0,
  children,
  className,
  onClick,
}) => {
  const colorStyle = colorVariants[color] || colorVariants.amber;
  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.Circle;
  const isLocked = variant === 'upcoming';
  const isCompleted = variant === 'completed';
  const isCurrent = variant === 'current';
  const allDone = completedCount === totalCount && totalCount > 0;

  return (
    <div
      onClick={!isLocked ? onClick : undefined}
      style={{ transform: `rotate(${rotation}deg)` }}
      className={cn(
        'relative rounded-xl p-4 transition-all duration-300',
        'bg-gradient-to-br shadow-md',
        colorStyle.bg,
        !isLocked && 'cursor-pointer hover:rotate-0 hover:-translate-y-1 hover:shadow-lg',
        isLocked && 'opacity-60',
        isCurrent && 'ring-2 ring-primary/50 shadow-lg',
        className
      )}
    >
      {/* Paper clip/pin */}
      <div
        className={cn(
          'absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-3 rounded-b-sm',
          'bg-gradient-to-b shadow-sm',
          colorStyle.pin
        )}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn('p-1.5 rounded-lg bg-background/50', colorStyle.accent)}>
            {isLocked ? (
              <Lock className="w-4 h-4" />
            ) : (
              <IconComponent className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 className={cn('font-semibold text-sm', colorStyle.accent)}>
              {title}
            </h3>
            {isCompleted && allDone && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> All done!
              </span>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        {totalCount > 0 && (
          <div className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            allDone 
              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-background/50 text-muted-foreground'
          )}>
            {completedCount}/{totalCount}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-1">
        {children}
      </div>

      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-background/20 backdrop-blur-[1px]">
          <span className="text-xs text-muted-foreground font-medium">Coming soon</span>
        </div>
      )}
    </div>
  );
};

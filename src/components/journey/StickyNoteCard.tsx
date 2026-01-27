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
  fullWidth?: boolean;
}

// Dark glassmorphism with distinct colors per stage for visual differentiation
const stageAccentColors: Record<string, { border: string; glow: string; accent: string }> = {
  'pre_registration': { 
    border: '#FFBC3B', 
    glow: 'rgba(255, 188, 59, 0.25)', 
    accent: '#FFBC3B' 
  },
  'pre_travel': { 
    border: '#10B981', 
    glow: 'rgba(16, 185, 129, 0.25)', 
    accent: '#10B981' 
  },
  'final_prep': { 
    border: '#DD6F16', 
    glow: 'rgba(221, 111, 22, 0.25)', 
    accent: '#DD6F16' 
  },
  'online_forge': { 
    border: '#3B82F6', 
    glow: 'rgba(59, 130, 246, 0.25)', 
    accent: '#3B82F6' 
  },
  'physical_forge': { 
    border: '#D38F0C', 
    glow: 'rgba(211, 143, 12, 0.25)', 
    accent: '#D38F0C' 
  },
  'post_forge': { 
    border: '#8B5CF6', 
    glow: 'rgba(139, 92, 246, 0.25)', 
    accent: '#8B5CF6' 
  },
  // Fallback colors
  'emerald': { 
    border: '#10B981', 
    glow: 'rgba(16, 185, 129, 0.25)', 
    accent: '#10B981' 
  },
  'amber': { 
    border: '#FFBC3B', 
    glow: 'rgba(255, 188, 59, 0.25)', 
    accent: '#FFBC3B' 
  },
  'blue': { 
    border: '#3B82F6', 
    glow: 'rgba(59, 130, 246, 0.25)', 
    accent: '#3B82F6' 
  },
  'purple': { 
    border: '#8B5CF6', 
    glow: 'rgba(139, 92, 246, 0.25)', 
    accent: '#8B5CF6' 
  },
  'rose': { 
    border: '#F43F5E', 
    glow: 'rgba(244, 63, 94, 0.25)', 
    accent: '#F43F5E' 
  },
  'primary': { 
    border: '#FFBC3B', 
    glow: 'rgba(255, 188, 59, 0.25)', 
    accent: '#FFBC3B' 
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
  fullWidth = false,
}) => {
  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.Circle;
  const isLocked = variant === 'upcoming';
  const isCompleted = variant === 'completed';
  const isCurrent = variant === 'current';
  const allDone = completedCount === totalCount && totalCount > 0;

  // Get accent colors based on stage
  const colors = stageAccentColors[color] || stageAccentColors.amber;

  return (
    <div
      onClick={!isLocked ? onClick : undefined}
      className={cn(
        'relative rounded-xl p-4 transition-all duration-300',
        // Dark glassmorphism background
        'bg-black/60 backdrop-blur-xl',
        // Border with accent color
        'border',
        // Shadows and glow effect
        'shadow-lg',
        !isLocked && 'cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5',
        isLocked && 'opacity-60',
        isCurrent && 'ring-2 ring-primary/50',
        fullWidth && 'w-full',
        className
      )}
      style={{
        borderColor: `${colors.border}99`, // 60% opacity border for visibility
        boxShadow: isCurrent 
          ? `0 4px 30px ${colors.glow}, 0 0 60px ${colors.glow}, inset 0 1px 0 ${colors.border}30`
          : `0 4px 20px ${colors.glow}, 0 0 40px ${colors.glow}`,
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {/* Colored top accent line */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
        style={{ backgroundColor: colors.border }}
      />
      
      {/* Pin matches stage color */}
      <div
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-3 rounded-b-sm shadow-md"
        style={{
          background: `linear-gradient(to bottom, ${colors.border}, ${colors.accent})`,
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div 
            className={cn(
              'p-1.5 rounded-lg',
              isCompleted 
                ? 'bg-emerald-500/20' 
                : 'bg-white/10'
            )}
            style={{
              color: isCompleted ? '#10B981' : colors.accent
            }}
          >
            {isLocked ? (
              <Lock className="w-4 h-4 text-muted-foreground" />
            ) : (
              <IconComponent className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 
              className="font-semibold text-sm"
              style={{ color: '#FCF7EF' }} // Cream foreground
            >
              {title}
            </h3>
            {isCompleted && allDone && (
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> All done!
              </span>
            )}
          </div>
        </div>

        {/* Progress indicator */}
        {totalCount > 0 && (
          <div 
            className={cn(
              'text-xs font-medium px-2 py-0.5 rounded-full',
              allDone 
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-white/10 text-white/70'
            )}
          >
            {completedCount}/{totalCount}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-1 text-white/80">
        {children}
      </div>

      {/* Locked overlay */}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 backdrop-blur-[2px]">
          <span className="text-xs text-white/60 font-medium">Coming soon</span>
        </div>
      )}
    </div>
  );
};

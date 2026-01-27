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
  fullWidth?: boolean; // For carousel mode
}

// Light mode paper backgrounds
const lightPaperBackgrounds: Record<string, string> = {
  'pre_registration': '#FEF7E0', // warm cream
  'pre_travel': '#FFF8E6',       // pale amber
  'final_prep': '#FEF3C7',       // light gold
  'online_forge': '#FDF6E3',     // soft cream
  'physical_forge': '#FFFBEB',   // warm white
  'post_forge': '#FEF9E7',       // champagne
  // Fallback colors
  'emerald': '#ECFDF5',
  'amber': '#FEF3C7',
  'blue': '#EFF6FF',
  'purple': '#FAF5FF',
  'rose': '#FFF1F2',
  'primary': '#FEF7E0',
};

// Dark mode paper backgrounds - warmer, papery darks
const darkPaperBackgrounds: Record<string, string> = {
  'pre_registration': '#2A2520', // warm dark brown
  'pre_travel': '#2D2618',       // amber-tinted dark
  'final_prep': '#332B1C',       // gold-tinted dark
  'online_forge': '#2A2618',     // cream-tinted dark
  'physical_forge': '#302A1E',   // warm sepia dark
  'post_forge': '#2B2519',       // champagne-tinted dark
  // Fallback colors
  'emerald': '#1C2A25',
  'amber': '#2A2518',
  'blue': '#1C2433',
  'purple': '#251C33',
  'rose': '#2A1C1F',
  'primary': '#2A2520',
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

  // Get paper background color based on color scheme
  const lightBg = lightPaperBackgrounds[color] || lightPaperBackgrounds.amber;
  const darkBg = darkPaperBackgrounds[color] || darkPaperBackgrounds.amber;

  return (
    <div
      onClick={!isLocked ? onClick : undefined}
      className={cn(
        'relative rounded-xl p-4 transition-all duration-300 overflow-hidden',
        // Light mode background
        'bg-[var(--sticky-bg-light)]',
        // Dark mode background
        'dark:bg-[var(--sticky-bg-dark)]',
        // Paper texture with subtle noise
        'before:absolute before:inset-0 before:rounded-xl before:pointer-events-none',
        'before:bg-[linear-gradient(90deg,transparent_95%,rgba(0,0,0,0.02)_100%),linear-gradient(transparent_95%,rgba(0,0,0,0.02)_100%)]',
        'dark:before:bg-[linear-gradient(90deg,transparent_95%,rgba(255,255,255,0.02)_100%),linear-gradient(transparent_95%,rgba(255,255,255,0.02)_100%)]',
        // Shadows
        'shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_6px_rgba(0,0,0,0.05),0_10px_20px_rgba(0,0,0,0.08)]',
        'dark:shadow-[0_1px_3px_rgba(0,0,0,0.3),0_4px_6px_rgba(0,0,0,0.25),0_10px_20px_rgba(0,0,0,0.35)]',
        'border border-black/5 dark:border-white/5',
        !isLocked && 'cursor-pointer hover:rotate-0 hover:-translate-y-1 hover:shadow-lg',
        isLocked && 'opacity-60',
        isCurrent && 'ring-2 ring-[#D38F0C]/50 shadow-lg shadow-[#D38F0C]/20 dark:ring-[#FFBC3B]/40 dark:shadow-[#FFBC3B]/10',
        fullWidth && 'w-full',
        className
      )}
      style={{
        '--sticky-bg-light': lightBg,
        '--sticky-bg-dark': darkBg,
        transform: `rotate(${rotation}deg)`,
      } as React.CSSProperties}
    >
      {/* Paper clip/pin - Forge brand gradient (same in both modes for contrast) */}
      <div
        className={cn(
          'absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-3 rounded-b-sm',
          'shadow-[0_2px_4px_rgba(0,0,0,0.3)]'
        )}
        style={{
          background: 'linear-gradient(to bottom, #FFBC3B, #D38F0C)',
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            'p-1.5 rounded-lg',
            isCompleted 
              ? 'bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/30 dark:text-emerald-400' 
              : 'bg-gray-900/10 text-gray-700 dark:bg-white/10 dark:text-gray-300'
          )}>
            {isLocked ? (
              <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <IconComponent className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-900 dark:text-[#E8E0D4]">
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
              ? 'bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/30 dark:text-emerald-400'
              : 'bg-gray-900/10 text-gray-700 dark:bg-white/10 dark:text-gray-300'
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
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/30 dark:bg-black/30 backdrop-blur-[1px]">
          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Coming soon</span>
        </div>
      )}
    </div>
  );
};

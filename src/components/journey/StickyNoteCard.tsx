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

// Paper backgrounds - solid light colors for visibility
const paperBackgrounds: Record<string, string> = {
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
  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.Circle;
  const isLocked = variant === 'upcoming';
  const isCompleted = variant === 'completed';
  const isCurrent = variant === 'current';
  const allDone = completedCount === totalCount && totalCount > 0;

  // Get paper background color
  const paperBg = paperBackgrounds[color] || paperBackgrounds.amber;

  return (
    <div
      onClick={!isLocked ? onClick : undefined}
      style={{ 
        transform: `rotate(${rotation}deg)`,
        backgroundColor: paperBg,
      }}
      className={cn(
        'relative rounded-xl p-4 transition-all duration-300',
        'shadow-[0_1px_3px_rgba(0,0,0,0.08),0_4px_6px_rgba(0,0,0,0.05),0_10px_20px_rgba(0,0,0,0.08)]',
        'border border-black/5',
        // Paper texture effect
        'before:absolute before:inset-0 before:rounded-xl before:pointer-events-none',
        'before:bg-[linear-gradient(90deg,transparent_95%,rgba(0,0,0,0.02)_100%),linear-gradient(transparent_95%,rgba(0,0,0,0.02)_100%)]',
        !isLocked && 'cursor-pointer hover:rotate-0 hover:-translate-y-1 hover:shadow-lg',
        isLocked && 'opacity-60',
        isCurrent && 'ring-2 ring-[#D38F0C]/50 shadow-lg shadow-[#D38F0C]/20',
        className
      )}
    >
      {/* Paper clip/pin - Forge brand gradient */}
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
            isCompleted ? 'bg-emerald-500/20 text-emerald-700' : 'bg-gray-900/10 text-gray-700'
          )}>
            {isLocked ? (
              <Lock className="w-4 h-4 text-gray-500" />
            ) : (
              <IconComponent className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm text-gray-900">
              {title}
            </h3>
            {isCompleted && allDone && (
              <span className="text-[10px] text-emerald-600 flex items-center gap-1">
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
              ? 'bg-emerald-500/20 text-emerald-700'
              : 'bg-gray-900/10 text-gray-700'
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
        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/30 backdrop-blur-[1px]">
          <span className="text-xs text-gray-600 font-medium">Coming soon</span>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { cn } from '@/lib/utils';

interface KYFormProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

// Multi-colored progress segments - Forge gold tones
const SEGMENT_COLORS = [
  'bg-forge-yellow',
  'bg-forge-gold',
  'bg-amber-500',
  'bg-orange-500',
  'bg-forge-yellow',
  'bg-forge-gold',
  'bg-amber-500',
  'bg-orange-500',
  'bg-forge-yellow',
  'bg-forge-gold',
];

export const KYFormProgressBar: React.FC<KYFormProgressBarProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <div className="flex gap-1">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const colorClass = SEGMENT_COLORS[index % SEGMENT_COLORS.length];

        return (
          <div
            key={index}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-300',
              isCompleted || isCurrent ? colorClass : 'bg-muted/30'
            )}
          />
        );
      })}
    </div>
  );
};

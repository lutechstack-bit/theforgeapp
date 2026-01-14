import React from 'react';
import { cn } from '@/lib/utils';

interface KYFormProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

// Multi-colored progress segments - vibrant cycling colors
const SEGMENT_COLORS = [
  'bg-forge-orange',
  'bg-forge-gold',
  'bg-forge-yellow',
  'bg-forge-gold',
  'bg-forge-orange',
  'bg-forge-yellow',
  'bg-forge-gold',
  'bg-forge-orange',
  'bg-forge-yellow',
  'bg-forge-gold',
];

export const KYFormProgressBar: React.FC<KYFormProgressBarProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const colorClass = SEGMENT_COLORS[index % SEGMENT_COLORS.length];

        return (
          <div
            key={index}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              isCompleted || isCurrent ? colorClass : 'bg-muted/20'
            )}
          />
        );
      })}
    </div>
  );
};

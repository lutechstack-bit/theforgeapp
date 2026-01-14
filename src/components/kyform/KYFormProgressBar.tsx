import React from 'react';
import { cn } from '@/lib/utils';

interface KYFormProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepTitles?: string[];
}

// Multi-colored progress segments matching the design reference
const SEGMENT_COLORS = [
  'bg-emerald-500',
  'bg-cyan-500',
  'bg-blue-500',
  'bg-violet-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-rose-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-lime-500',
];

export const KYFormProgressBar: React.FC<KYFormProgressBarProps> = ({
  currentStep,
  totalSteps,
  stepTitles,
}) => {
  const questionNumber = String(currentStep + 1).padStart(2, '0');

  return (
    <div className="space-y-3">
      {/* Question number badge */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground tracking-wider">
          Q.{questionNumber}
        </span>
        <span className="text-xs text-muted-foreground">
          {currentStep + 1} of {totalSteps}
        </span>
      </div>

      {/* Multi-colored segmented progress bar */}
      <div className="flex gap-1">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const colorClass = SEGMENT_COLORS[index % SEGMENT_COLORS.length];

          return (
            <div
              key={index}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-all duration-300',
                isCompleted || isCurrent ? colorClass : 'bg-muted/40',
                isCurrent && 'animate-pulse'
              )}
            />
          );
        })}
      </div>

      {/* Current step title */}
      {stepTitles && stepTitles[currentStep] && (
        <p className="text-sm font-medium text-foreground">
          {stepTitles[currentStep]}
        </p>
      )}
    </div>
  );
};

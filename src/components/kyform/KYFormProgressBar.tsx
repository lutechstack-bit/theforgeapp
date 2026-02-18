import React from 'react';
import { cn } from '@/lib/utils';

interface KYFormProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const KYFormProgressBar: React.FC<KYFormProgressBarProps> = ({
  currentStep,
  totalSteps,
}) => {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepIndex = i + 1;
        const isCompleted = stepIndex < currentStep;
        const isCurrent = stepIndex === currentStep;

        return (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-500',
              isCompleted && 'bg-gradient-to-r from-forge-gold to-forge-orange',
              isCurrent && 'bg-forge-gold',
              !isCompleted && !isCurrent && 'bg-muted/20'
            )}
          />
        );
      })}
    </div>
  );
};

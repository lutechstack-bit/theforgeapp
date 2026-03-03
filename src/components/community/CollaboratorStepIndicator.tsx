import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { key: 'identity', label: 'Identity' },
  { key: 'craft', label: 'Craft' },
  { key: 'work', label: 'Work' },
  { key: 'forge', label: 'Forge' },
];

interface CollaboratorStepIndicatorProps {
  currentStep: number;
}

export const CollaboratorStepIndicator: React.FC<CollaboratorStepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <React.Fragment key={step.key}>
            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isCurrent && 'bg-primary text-primary-foreground ring-2 ring-primary/30',
                  !isCompleted && !isCurrent && 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : index + 1}
              </div>
              <span
                className={cn(
                  'text-xs font-medium hidden sm:inline',
                  isCurrent ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'h-px w-6 sm:w-10',
                  index < currentStep ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

import React from 'react';

interface KYFormProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles?: string[];
}

export const KYFormProgress: React.FC<KYFormProgressProps> = ({ 
  currentStep, 
  totalSteps,
  stepTitles 
}) => {
  return (
    <div className="space-y-2">
      {/* Progress bar */}
      <div className="flex gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i < currentStep ? 'bg-primary' : i === currentStep ? 'bg-primary/50' : 'bg-secondary'
            }`}
          />
        ))}
      </div>
      
      {/* Step indicator */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {totalSteps}
        </span>
        {stepTitles && stepTitles[currentStep] && (
          <span className="text-sm font-medium text-foreground">
            {stepTitles[currentStep]}
          </span>
        )}
      </div>
    </div>
  );
};

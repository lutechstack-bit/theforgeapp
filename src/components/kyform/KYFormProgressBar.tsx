import React from 'react';

interface KYFormProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export const KYFormProgressBar: React.FC<KYFormProgressBarProps> = ({
  currentStep,
  totalSteps,
}) => {
  const percentage = Math.min((currentStep / totalSteps) * 100, 100);

  return (
    <div className="space-y-1.5">
      <div className="h-1.5 w-full rounded-full bg-muted/20 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-forge-gold to-forge-orange transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

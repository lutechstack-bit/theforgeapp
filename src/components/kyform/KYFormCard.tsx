import React from 'react';
import { cn } from '@/lib/utils';
import { KYFormProgressBar } from './KYFormProgressBar';

interface KYFormCardProps {
  children: React.ReactNode;
  className?: string;
  isAnimating?: 'out' | 'in' | null;
  questionNumber?: number;
  currentStep?: number;
  totalSteps?: number;
  stepTitle?: string;
}

export const KYFormCard: React.FC<KYFormCardProps> = ({
  children,
  className,
  isAnimating,
  questionNumber,
  currentStep,
  totalSteps,
  stepTitle,
}) => {
  return (
    <div
      className={cn(
        'relative rounded-2xl p-5 md:p-6',
        'bg-card border border-forge-gold/20',
        'shadow-xl shadow-black/30',
        'ring-1 ring-forge-gold/10',
        isAnimating === 'out' && 'animate-stack-pop-out',
        isAnimating === 'in' && 'animate-stack-pop-in',
        className
      )}
    >
      {/* Progress bar inside card */}
      {currentStep !== undefined && totalSteps !== undefined && (
        <KYFormProgressBar currentStep={currentStep} totalSteps={totalSteps} />
      )}
      
      {/* Question number indicator */}
      {questionNumber !== undefined && (
        <div className="mt-4 mb-2">
          <span className="text-sm font-semibold text-forge-gold tracking-wide">
            Q.{String(questionNumber).padStart(2, '0')}
          </span>
        </div>
      )}
      
      {/* Step title */}
      {stepTitle && (
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
          {stepTitle}
        </h2>
      )}
      
      {children}
    </div>
  );
};

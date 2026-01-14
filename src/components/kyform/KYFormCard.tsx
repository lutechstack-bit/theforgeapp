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
        'relative rounded-3xl p-6 md:p-7',
        'bg-card/95 backdrop-blur-sm',
        'border border-forge-gold/30',
        'shadow-[0_0_30px_-5px_rgba(255,188,59,0.25),0_0_60px_-10px_rgba(211,143,12,0.15),0_8px_32px_-8px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,188,59,0.12)]',
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
        <div className="mt-5 mb-1">
          <span className="text-xs font-bold text-forge-gold/80 tracking-widest uppercase">
            Q.{String(questionNumber).padStart(2, '0')}
          </span>
        </div>
      )}
      
      {/* Step title */}
      {stepTitle && (
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-5">
          {stepTitle}
        </h2>
      )}
      
      {children}
    </div>
  );
};

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
        'relative rounded-3xl p-3 md:p-7 overflow-hidden',
        'bg-card/60 backdrop-blur-md',
        'border border-forge-gold/25',
        'shadow-[0_0_30px_-5px_rgba(255,188,59,0.2),0_0_60px_-10px_rgba(211,143,12,0.12),0_8px_32px_-8px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,188,59,0.1)]',
        'ring-1 ring-forge-gold/8',
        isAnimating === 'out' && 'animate-stack-pop-out',
        isAnimating === 'in' && 'animate-stack-pop-in',
        className
      )}
    >
      {/* Top shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-forge-gold/40 to-transparent" />

      {children}
    </div>
  );
};

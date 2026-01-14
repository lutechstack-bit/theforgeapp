import React from 'react';
import { cn } from '@/lib/utils';

interface KYFormCardProps {
  children: React.ReactNode;
  questionNumber: number;
  className?: string;
  isAnimating?: 'out' | 'in' | null;
}

export const KYFormCard: React.FC<KYFormCardProps> = ({
  children,
  questionNumber,
  className,
  isAnimating,
}) => {
  const formattedNumber = String(questionNumber).padStart(2, '0');

  return (
    <div
      className={cn(
        'relative rounded-3xl p-6 md:p-8',
        'bg-gradient-to-br from-secondary/60 via-card/80 to-secondary/40',
        'border border-border/50',
        'shadow-lg shadow-black/20',
        isAnimating === 'out' && 'animate-stack-pop-out',
        isAnimating === 'in' && 'animate-stack-pop-in',
        className
      )}
    >
      {/* Question number badge */}
      <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">
        Q.{formattedNumber}
      </div>

      {/* Card content */}
      <div className="pt-2">
        {children}
      </div>
    </div>
  );
};

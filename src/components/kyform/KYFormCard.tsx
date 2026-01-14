import React from 'react';
import { cn } from '@/lib/utils';

interface KYFormCardProps {
  children: React.ReactNode;
  className?: string;
  isAnimating?: 'out' | 'in' | null;
}

export const KYFormCard: React.FC<KYFormCardProps> = ({
  children,
  className,
  isAnimating,
}) => {
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
      {children}
    </div>
  );
};

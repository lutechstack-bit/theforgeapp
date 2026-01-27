import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  variant?: 'completed' | 'current' | 'upcoming';
  children?: React.ReactNode;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 32,
  strokeWidth = 3,
  variant = 'upcoming',
  children,
  className,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const getStrokeColor = () => {
    switch (variant) {
      case 'completed':
        return 'stroke-emerald-500';
      case 'current':
        return 'stroke-primary';
      default:
        return 'stroke-muted-foreground/30';
    }
  };

  const getTrackColor = () => {
    switch (variant) {
      case 'completed':
        return 'stroke-emerald-500/20';
      case 'current':
        return 'stroke-primary/20';
      default:
        return 'stroke-muted-foreground/10';
    }
  };

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={getTrackColor()}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(getStrokeColor(), 'transition-all duration-500 ease-out')}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

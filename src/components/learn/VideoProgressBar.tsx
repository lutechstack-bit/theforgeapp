import React from 'react';
import { cn } from '@/lib/utils';

interface VideoProgressBarProps {
  progress: number; // 0-100
  className?: string;
}

export const VideoProgressBar: React.FC<VideoProgressBarProps> = ({
  progress,
  className,
}) => {
  if (progress <= 0) return null;

  return (
    <div className={cn("absolute bottom-0 left-0 right-0 h-1 bg-background/50", className)}>
      <div 
        className="h-full bg-primary transition-all duration-300"
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
};

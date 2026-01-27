import React, { useState, useEffect, useRef } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface StickyProgressBarProps {
  stageName: string;
  completed: number;
  total: number;
  observeRef: React.RefObject<HTMLDivElement>;
  className?: string;
}

export const StickyProgressBar: React.FC<StickyProgressBarProps> = ({
  stageName,
  completed,
  total,
  observeRef,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const progressPercent = total > 0 ? (completed / total) * 100 : 0;

  useEffect(() => {
    const observerElement = observeRef.current;
    if (!observerElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar when the observed element goes out of view
        setIsVisible(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: '-60px 0px 0px 0px', // Account for top bar height
      }
    );

    observer.observe(observerElement);

    return () => {
      observer.disconnect();
    };
  }, [observeRef]);

  return (
    <div
      className={cn(
        'fixed top-14 left-0 right-0 z-30 transition-all duration-300',
        'bg-background/95 backdrop-blur-sm border-b border-border',
        'px-4 py-2 safe-area-pt',
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-full pointer-events-none',
        className
      )}
    >
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        <span className="text-sm font-medium text-foreground whitespace-nowrap">
          {stageName}
        </span>
        <Progress value={progressPercent} className="h-2 flex-1" />
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {completed}/{total}
        </span>
      </div>
    </div>
  );
};

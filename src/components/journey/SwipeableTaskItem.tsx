import React, { useState, useRef, useCallback } from 'react';
import { Check, X, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { JourneyTask } from '@/hooks/useStudentJourney';

interface SwipeableTaskItemProps {
  task: JourneyTask;
  isCompleted: boolean;
  isAutoCompleted: boolean;
  onToggle: () => void;
  onNavigate?: (deepLink: string) => void;
  prepProgress?: { completed: number; total: number } | null;
}

const SWIPE_THRESHOLD = 80;

export const SwipeableTaskItem: React.FC<SwipeableTaskItemProps> = ({
  task,
  isCompleted,
  isAutoCompleted,
  onToggle,
  onNavigate,
  prepProgress,
}) => {
  const [offsetX, setOffsetX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const isToggling = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping) return;
    
    // Cancel any pending RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    // Use RAF for smooth 60fps animation
    rafRef.current = requestAnimationFrame(() => {
      const deltaX = e.touches[0].clientX - startX.current;
      
      // Elastic resistance for natural feel
      let boundedDelta = deltaX;
      if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
        const excess = Math.abs(deltaX) - SWIPE_THRESHOLD;
        boundedDelta = (deltaX > 0 ? 1 : -1) * (SWIPE_THRESHOLD + excess * 0.2);
      }
      
      setOffsetX(boundedDelta);
    });
  }, [isSwiping]);

  const handleTouchEnd = useCallback(() => {
    // Cancel any pending RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    setIsSwiping(false);
    
    // Prevent double-toggle with debounce
    if (isToggling.current) {
      setOffsetX(0);
      return;
    }
    
    const didComplete = offsetX >= SWIPE_THRESHOLD && !isCompleted;
    const didUncomplete = offsetX <= -SWIPE_THRESHOLD && isCompleted;
    
    if (didComplete || didUncomplete) {
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
      
      isToggling.current = true;
      onToggle();
      
      // Reset debounce after animation
      setTimeout(() => {
        isToggling.current = false;
      }, 300);
    }
    
    setOffsetX(0);
  }, [offsetX, isCompleted, onToggle]);

  const handleCheckboxClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Prevent double-toggle
    if (isToggling.current) return;
    
    isToggling.current = true;
    onToggle();
    
    setTimeout(() => {
      isToggling.current = false;
    }, 300);
  }, [onToggle]);

  const handleDeepLinkClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.deep_link && onNavigate) {
      onNavigate(task.deep_link);
    }
  }, [task.deep_link, onNavigate]);

  const handleRowClick = useCallback(() => {
    // Prevent double-toggle
    if (isToggling.current) return;
    
    isToggling.current = true;
    onToggle();
    
    setTimeout(() => {
      isToggling.current = false;
    }, 300);
  }, [onToggle]);

  // Calculate background colors based on swipe direction
  const showCompleteIndicator = offsetX > 20 && !isCompleted;
  const showUncompleteIndicator = offsetX < -20 && isCompleted;

  return (
    <div 
      className="relative overflow-hidden rounded-lg"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Background indicators */}
      <div 
        className={cn(
          'absolute inset-0 flex items-center justify-start pl-4 transition-opacity duration-150',
          'bg-emerald-500/20',
          showCompleteIndicator ? 'opacity-100' : 'opacity-0'
        )}
      >
        <Check className="w-5 h-5 text-emerald-500" />
      </div>
      <div 
        className={cn(
          'absolute inset-0 flex items-center justify-end pr-4 transition-opacity duration-150',
          'bg-destructive/20',
          showUncompleteIndicator ? 'opacity-100' : 'opacity-0'
        )}
      >
        <X className="w-5 h-5 text-destructive" />
      </div>

      {/* Main content */}
      <div
        className={cn(
          'relative flex items-start gap-3 p-3 rounded-lg bg-background cursor-pointer',
          'hover:bg-muted/50',
          isCompleted && 'opacity-70'
        )}
        style={{ 
          transform: `translateX(${offsetX}px) scale(${isSwiping ? 0.98 : 1})`,
          transition: isSwiping ? 'none' : 'transform 200ms ease-out',
          willChange: isSwiping ? 'transform' : 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleRowClick}
      >
        {/* Checkbox */}
        <button
          className={cn(
            'w-5 h-5 mt-0.5 rounded-md flex items-center justify-center shrink-0 border-2 transition-all touch-target',
            isCompleted
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-muted-foreground/40 hover:border-muted-foreground'
          )}
          onClick={handleCheckboxClick}
        >
          {isCompleted && <Check className="w-3 h-3 text-white" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-sm font-medium',
                isCompleted && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </span>
            {isAutoCompleted && (
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {task.description}
            </p>
          )}

          {/* Prep category progress bar */}
          {prepProgress && prepProgress.total > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <Progress 
                  value={(prepProgress.completed / prepProgress.total) * 100} 
                  className="h-1.5 flex-1" 
                />
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {prepProgress.completed}/{prepProgress.total} items
                </span>
              </div>
              {isAutoCompleted && prepProgress.completed === prepProgress.total && (
                <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Auto-synced from Prep
                </p>
              )}
            </div>
          )}
        </div>

        {/* Deep link arrow */}
        {task.deep_link && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 shrink-0"
            onClick={handleDeepLinkClick}
          >
            <span className="text-xs mr-1">Go</span>
            <ChevronRight className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

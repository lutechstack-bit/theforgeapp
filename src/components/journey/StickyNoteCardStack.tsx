import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { JourneyStage } from '@/hooks/useStudentJourney';

interface StickyNoteCardStackProps {
  stages: JourneyStage[];
  currentIndex: number;
  onStageChange: (index: number) => void;
  children: (stage: JourneyStage, index: number) => React.ReactNode;
  className?: string;
}

export const StickyNoteCardStack: React.FC<StickyNoteCardStackProps> = ({
  stages,
  currentIndex,
  onStageChange,
  children,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const startXRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const SWIPE_THRESHOLD = 50;

  // Native touch handler for passive: false
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchMoveNative = (e: TouchEvent) => {
      if (!isDragging) return;
      const currentX = e.touches[0].clientX;
      const diff = currentX - startXRef.current;
      
      // Prevent vertical scroll when swiping horizontally
      if (Math.abs(diff) > 10) {
        e.preventDefault();
      }
      setDragOffset(diff);
    };

    container.addEventListener('touchmove', handleTouchMoveNative, { passive: false });
    return () => container.removeEventListener('touchmove', handleTouchMoveNative);
  }, [isDragging]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
    setDragOffset(0);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragOffset > SWIPE_THRESHOLD && currentIndex > 0) {
      onStageChange(currentIndex - 1);
    } else if (dragOffset < -SWIPE_THRESHOLD && currentIndex < stages.length - 1) {
      onStageChange(currentIndex + 1);
    }
    
    setDragOffset(0);
  }, [isDragging, dragOffset, currentIndex, stages.length, onStageChange]);

  // Mouse handlers for desktop testing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    setDragOffset(0);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const diff = e.clientX - startXRef.current;
    setDragOffset(diff);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    handleTouchEnd();
  }, [handleTouchEnd]);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      handleTouchEnd();
    }
  }, [isDragging, handleTouchEnd]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Card Stack Container - with overflow hidden to clip background cards */}
      <div 
        ref={containerRef}
        className="relative min-h-[320px] overflow-hidden"
        style={{ touchAction: 'pan-y pinch-zoom' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Cards - only show current and immediate neighbors */}
        {stages.map((stage, index) => {
          const offset = index - currentIndex;
          // Only show current card and 1 card on each side for cleaner UI
          const isVisible = Math.abs(offset) <= 1;
          
          if (!isVisible) return null;

          // Reduced transforms for cleaner look
          const baseRotation = offset * 1;
          const baseTranslateX = offset * 4;
          const baseTranslateY = Math.abs(offset) * 4;
          const scale = 1 - Math.abs(offset) * 0.04;
          const zIndex = 10 - Math.abs(offset);
          const opacity = offset === 0 ? 1 : 0.3;

          // Add drag offset only to current card
          const translateX = offset === 0 ? dragOffset : baseTranslateX;
          const rotation = offset === 0 ? (dragOffset / 25) : baseRotation;

          return (
            <div
              key={stage.id}
              className={cn(
                'absolute inset-0',
                isDragging && offset === 0 ? 'transition-none' : 'transition-all duration-300 ease-out',
                offset !== 0 && 'pointer-events-none'
              )}
              style={{
                transform: `translateX(${translateX}px) translateY(${baseTranslateY}px) rotate(${rotation}deg) scale(${scale})`,
                zIndex,
                opacity,
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
              }}
            >
              {children(stage, index)}
            </div>
          );
        })}
      </div>

      {/* Dot Indicators */}
      <div className="flex justify-center gap-2">
        {stages.map((stage, index) => {
          const isCurrent = index === currentIndex;
          const isCompleted = index < currentIndex;
          
          return (
            <button
              key={stage.id}
              onClick={() => onStageChange(index)}
              className={cn(
                'rounded-full transition-all duration-300',
                isCurrent 
                  ? 'w-6 h-2 bg-primary' 
                  : isCompleted
                  ? 'w-2 h-2 bg-emerald-500'
                  : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              )}
              aria-label={`Go to ${stage.title}`}
            />
          );
        })}
      </div>
    </div>
  );
};

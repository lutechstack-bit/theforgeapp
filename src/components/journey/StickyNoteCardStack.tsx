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
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const velocityRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);

  const SWIPE_THRESHOLD = 50;
  const VELOCITY_THRESHOLD = 0.3;

  // Keep ref in sync with state for native event handler
  useEffect(() => {
    isDraggingRef.current = isDragging;
  }, [isDragging]);

  // Native touch handler for passive: false
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchMoveNative = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      
      const currentX = e.touches[0].clientX;
      const currentTime = Date.now();
      const timeDelta = currentTime - lastTimeRef.current;
      
      // Track velocity for momentum
      if (timeDelta > 0) {
        velocityRef.current = (currentX - lastXRef.current) / timeDelta;
      }
      
      lastXRef.current = currentX;
      lastTimeRef.current = currentTime;
      
      const diff = currentX - startXRef.current;
      
      // Prevent vertical scroll when swiping horizontally
      if (Math.abs(diff) > 10) {
        e.preventDefault();
      }
      
      // Use RAF for smooth animation
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      
      rafRef.current = requestAnimationFrame(() => {
        setDragOffset(diff);
      });
    };

    container.addEventListener('touchmove', handleTouchMoveNative, { passive: false });
    return () => container.removeEventListener('touchmove', handleTouchMoveNative);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
    lastXRef.current = e.touches[0].clientX;
    lastTimeRef.current = Date.now();
    velocityRef.current = 0;
    setDragOffset(0);
  }, []);

  const handleTouchEnd = useCallback(() => {
    // Cancel any pending RAF
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    if (!isDragging) return;
    setIsDragging(false);

    const velocity = velocityRef.current;
    const shouldSwipeByVelocity = Math.abs(velocity) > VELOCITY_THRESHOLD;
    const shouldSwipeByDistance = Math.abs(dragOffset) > SWIPE_THRESHOLD;

    let newIndex = currentIndex;

    if (shouldSwipeByVelocity || shouldSwipeByDistance) {
      // Use velocity direction if fast enough, otherwise use distance
      const direction = shouldSwipeByVelocity ? velocity : dragOffset;
      
      if (direction > 0 && currentIndex > 0) {
        newIndex = currentIndex - 1;
      } else if (direction < 0 && currentIndex < stages.length - 1) {
        newIndex = currentIndex + 1;
      }
    }

    if (newIndex !== currentIndex) {
      // Haptic feedback on successful swipe
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
      onStageChange(newIndex);
    }
    
    setDragOffset(0);
  }, [isDragging, dragOffset, currentIndex, stages.length, onStageChange]);

  // Mouse handlers for desktop testing
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    lastTimeRef.current = Date.now();
    velocityRef.current = 0;
    setDragOffset(0);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const currentTime = Date.now();
    const timeDelta = currentTime - lastTimeRef.current;
    
    if (timeDelta > 0) {
      velocityRef.current = (e.clientX - lastXRef.current) / timeDelta;
    }
    
    lastXRef.current = e.clientX;
    lastTimeRef.current = currentTime;
    
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
        className="relative min-h-[280px] overflow-hidden"
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
                offset !== 0 && 'pointer-events-none'
              )}
              style={{
                transform: `translateX(${translateX}px) translateY(${baseTranslateY}px) rotate(${rotation}deg) scale(${scale})`,
                zIndex,
                opacity,
                transition: isDragging && offset === 0 ? 'none' : 'transform 300ms ease-out, opacity 300ms ease-out',
                willChange: isDragging ? 'transform' : 'auto',
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

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface KYFormCardStackProps {
  currentStep: number;
  totalSteps: number;
  children: React.ReactNode;
  onAnimationComplete?: () => void;
}

export const KYFormCardStack: React.FC<KYFormCardStackProps> = ({
  currentStep,
  totalSteps,
  children,
  onAnimationComplete,
}) => {
  const [displayStep, setDisplayStep] = useState(currentStep);
  const [isAnimating, setIsAnimating] = useState<'forward' | 'backward' | null>(null);
  const prevStepRef = useRef(currentStep);

  useEffect(() => {
    if (currentStep !== prevStepRef.current) {
      const direction = currentStep > prevStepRef.current ? 'forward' : 'backward';
      setIsAnimating(direction);
      
      // Wait for animation to complete before updating displayed step
      const timer = setTimeout(() => {
        setDisplayStep(currentStep);
        setIsAnimating(null);
        onAnimationComplete?.();
      }, 350);

      prevStepRef.current = currentStep;
      return () => clearTimeout(timer);
    }
  }, [currentStep, onAnimationComplete]);

  // Convert children to array and get visible cards
  const childArray = React.Children.toArray(children);

  return (
    <div className="relative perspective-1000">
      {/* Card stack visual - showing depth effect */}
      <div className="relative">
        {/* Third card (behind) - only show if there are more steps */}
        {displayStep < totalSteps - 2 && (
          <div
            className={cn(
              'absolute inset-0 rounded-3xl',
              'bg-gradient-to-br from-secondary/30 via-card/40 to-secondary/20',
              'border border-border/30',
              'transform translate-y-4 scale-[0.92]',
              'opacity-30',
              'transition-all duration-300'
            )}
          />
        )}

        {/* Second card (behind current) - only show if there are more steps */}
        {displayStep < totalSteps - 1 && (
          <div
            className={cn(
              'absolute inset-0 rounded-3xl',
              'bg-gradient-to-br from-secondary/40 via-card/60 to-secondary/30',
              'border border-border/40',
              'transform translate-y-2 scale-[0.96]',
              'opacity-50',
              'transition-all duration-300',
              isAnimating === 'forward' && 'animate-stack-reveal'
            )}
          />
        )}

        {/* Current card */}
        <div
          className={cn(
            'relative z-10',
            isAnimating === 'forward' && 'animate-stack-pop-out',
            isAnimating === 'backward' && 'animate-stack-pop-in'
          )}
        >
          {childArray[displayStep]}
        </div>
      </div>
    </div>
  );
};

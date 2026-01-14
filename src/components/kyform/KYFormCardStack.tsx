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
      
      // Update display step after animation starts for smooth transition
      const timer = setTimeout(() => {
        setDisplayStep(currentStep);
        setIsAnimating(null);
        onAnimationComplete?.();
      }, 500);

      prevStepRef.current = currentStep;
      return () => clearTimeout(timer);
    }
  }, [currentStep, onAnimationComplete]);

  const childArray = React.Children.toArray(children);

  return (
    <div className="relative">
      {/* Card stack visual - rotation-based depth effect */}
      <div className="relative">
        {/* Third card (behind) - more rotation and offset */}
        {displayStep < totalSteps - 2 && (
          <div
            className={cn(
              'absolute inset-0 rounded-3xl pointer-events-none',
              'bg-card/30 border border-forge-gold/5',
              'transform rotate-[3deg] translate-y-4 translate-x-4',
              'opacity-35',
              'transition-all duration-500 ease-out'
            )}
          />
        )}

        {/* Second card (behind current) - slight rotation */}
        {displayStep < totalSteps - 1 && (
          <div
            className={cn(
              'absolute inset-0 rounded-3xl pointer-events-none',
              'bg-card/50 border border-forge-gold/10',
              'transform rotate-[1.5deg] translate-y-2 translate-x-2',
              'opacity-60',
              'transition-all duration-500 ease-out',
              isAnimating === 'forward' && 'animate-stack-reveal'
            )}
          />
        )}

        {/* Current card with swipe animation */}
        <div
          key={displayStep}
          className={cn(
            'relative z-10',
            isAnimating === 'forward' && 'animate-stack-pop-out',
            isAnimating === 'backward' && 'animate-stack-backward-out'
          )}
        >
          {childArray[isAnimating ? prevStepRef.current : displayStep]}
        </div>

        {/* Incoming card */}
        {isAnimating && (
          <div
            className={cn(
              'absolute inset-0 z-20',
              isAnimating === 'forward' && 'animate-stack-pop-in',
              isAnimating === 'backward' && 'animate-stack-backward-in'
            )}
          >
            {childArray[currentStep]}
          </div>
        )}
      </div>
    </div>
  );
};

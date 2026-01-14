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
      
      const timer = setTimeout(() => {
        setDisplayStep(currentStep);
        setIsAnimating(null);
        onAnimationComplete?.();
      }, 350);

      prevStepRef.current = currentStep;
      return () => clearTimeout(timer);
    }
  }, [currentStep, onAnimationComplete]);

  const childArray = React.Children.toArray(children);

  return (
    <div className="relative">
      {/* Card stack visual - rotation-based depth effect like reference */}
      <div className="relative">
        {/* Third card (behind) - rotated offset */}
        {displayStep < totalSteps - 2 && (
          <div
            className={cn(
              'absolute inset-0 rounded-2xl',
              'bg-card/60 border border-forge-gold/10',
              'transform rotate-3 translate-y-3 translate-x-3',
              'opacity-40',
              'transition-all duration-300'
            )}
          />
        )}

        {/* Second card (behind current) - slight rotation */}
        {displayStep < totalSteps - 1 && (
          <div
            className={cn(
              'absolute inset-0 rounded-2xl',
              'bg-card/80 border border-forge-gold/20',
              'transform rotate-[1.5deg] translate-y-1.5 translate-x-1.5',
              'opacity-60',
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

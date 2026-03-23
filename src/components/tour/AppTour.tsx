import React, { useState, useEffect, useCallback, useRef } from 'react';
import { tourSteps } from './tourSteps';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppTourProps {
  userId: string;
  onComplete: () => void;
}

export const AppTour: React.FC<AppTourProps> = ({ userId, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [visible, setVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const step = tourSteps[currentStep];
  const totalSteps = tourSteps.length;

  const getTargetElement = useCallback(() => {
    const s = tourSteps[currentStep];
    if (isMobile && s.mobileSelector) {
      return document.querySelector(s.mobileSelector);
    }
    return document.querySelector(s.targetSelector);
  }, [currentStep, isMobile]);

  const updateRect = useCallback(() => {
    const el = getTargetElement();
    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
      setVisible(true);
    } else {
      setTargetRect(null);
      setVisible(true);
    }
  }, [getTargetElement]);

  useEffect(() => {
    // Small delay to let DOM settle
    const timer = setTimeout(updateRect, 300);
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [updateRect, currentStep]);

  const markComplete = useCallback(async () => {
    try {
      await supabase
        .from('profiles')
        .update({ has_seen_tour: true } as any)
        .eq('id', userId);
    } catch (e) {
      console.error('Failed to update tour status', e);
    }
    onComplete();
  }, [userId, onComplete]);

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      markComplete();
    }
  };

  const handleSkip = () => {
    markComplete();
  };

  if (!visible) return null;

  const padding = 6;
  const spotlightStyle = targetRect
    ? {
        top: targetRect.top - padding,
        left: targetRect.left - padding,
        width: targetRect.width + padding * 2,
        height: targetRect.height + padding * 2,
      }
    : null;

  // Tooltip positioning
  const getTooltipStyle = (): React.CSSProperties => {
    if (!targetRect) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }

    const gap = 16;

    if (isMobile) {
      // Always show above the bottom nav on mobile
      return {
        bottom: `${window.innerHeight - targetRect.top + gap}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: 'calc(100vw - 32px)',
      };
    }

    switch (step.position) {
      case 'right':
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.right + gap,
          transform: 'translateY(-50%)',
        };
      case 'bottom':
        return {
          top: targetRect.bottom + gap,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          top: targetRect.top + targetRect.height / 2,
          right: window.innerWidth - targetRect.left + gap,
          transform: 'translateY(-50%)',
        };
      case 'top':
        return {
          bottom: window.innerHeight - targetRect.top + gap,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translateX(-50%)',
        };
      default:
        return {};
    }
  };

  return (
    <div className="fixed inset-0 z-[100]" aria-modal="true" role="dialog">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 transition-opacity duration-300" />

      {/* Spotlight cutout */}
      {spotlightStyle && (
        <div
          className="absolute rounded-xl ring-2 ring-primary/80 bg-transparent z-[101] transition-all duration-300 ease-out"
          style={{
            ...spotlightStyle,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[102] w-80 max-w-[calc(100vw-32px)] transition-all duration-300 ease-out"
        style={getTooltipStyle()}
      >
        <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-2xl">
          <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">{step.description}</p>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5 mb-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-200',
                  i === currentStep ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                )}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip Tour
            </button>
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              {currentStep === totalSteps - 1 ? 'Got it!' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

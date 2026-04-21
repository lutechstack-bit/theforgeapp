import React from 'react';
import { X } from 'lucide-react';
import type { TooltipRenderProps } from 'react-joyride';
import forgeIcon from '@/assets/forge-icon.png';

/**
 * ForgeTooltip is the visual for every step of the onboarding tour.
 *
 * Replaces Joyride's default tooltip with a custom component that:
 *   1. Matches the Forge dark/amber design system (not Joyride's stock white box).
 *   2. Never clips the viewport: centered placement + max-width cap + viewport
 *      padding handle narrow phones gracefully.
 *   3. Shows a 'STEP N OF M' breadcrumb so users orient themselves without
 *      relying on Joyride's default progress-in-button-label treatment.
 *   4. Welcome step (index 0) gets the Forge icon above the title for a
 *      premium, on-brand opener.
 *
 * Wired in via Joyride's `tooltipComponent` prop inside OnboardingTour.tsx.
 */

export const ForgeTooltip: React.FC<TooltipRenderProps> = ({
  index,
  size,
  step,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
  isLastStep,
  continuous,
}) => {
  const isWelcome = index === 0;

  return (
    <div
      {...tooltipProps}
      role="dialog"
      aria-modal="true"
      className="relative bg-[#0F0F10] text-[#F5F5F5] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,191,0,0.12)]
        border border-[rgba(255,191,0,0.18)]
        w-[min(92vw,440px)]
        p-6 sm:p-7"
      style={{ fontFamily: 'inherit' }}
    >
      {/* Close X (top right) */}
      <button
        {...closeProps}
        type="button"
        aria-label="Close tour"
        className="absolute top-3 right-3 p-1.5 rounded-full text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Forge icon on welcome */}
      {isWelcome && (
        <div className="flex items-center justify-center mb-5">
          <div className="h-12 w-12 rounded-2xl bg-[#FFBF00]/10 ring-1 ring-[#FFBF00]/30 flex items-center justify-center overflow-hidden">
            <img src={forgeIcon} alt="" aria-hidden className="h-8 w-8 object-contain" />
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#FFBF00]/70 mb-2">
        Step {index + 1} of {size}
      </p>

      {/* Title */}
      {step.title && (
        <h3 className="text-xl sm:text-[22px] font-bold leading-tight text-white mb-3">
          {step.title}
        </h3>
      )}

      {/* Body */}
      {step.content && (
        <div className="text-sm sm:text-[15px] leading-relaxed text-[#E5E7EB]">
          {step.content}
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 flex items-center gap-2">
        {/* Skip on the far left (not on the last step) */}
        {!isLastStep && (
          <button
            {...skipProps}
            type="button"
            className="text-xs font-medium text-[#9CA3AF] hover:text-white transition-colors px-2 py-2"
          >
            Skip tour
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          {index > 0 && (
            <button
              {...backProps}
              type="button"
              className="text-sm font-medium text-[#FFBF00] hover:bg-[#FFBF00]/10 transition-colors px-4 py-2 rounded-lg"
            >
              Back
            </button>
          )}
          <button
            {...primaryProps}
            type="button"
            className="text-sm font-semibold text-[#0F0F10] bg-[#FFBF00] hover:bg-[#FFD042] transition-colors px-5 py-2 rounded-lg shadow-[0_4px_12px_rgba(255,191,0,0.25)]"
          >
            {isLastStep ? "Let's go" : continuous ? 'Next' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgeTooltip;

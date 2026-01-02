import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2, Check } from 'lucide-react';

interface KYFormNavigationProps {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  loading?: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  showBackOnFirstStep?: boolean;
}

export const KYFormNavigation: React.FC<KYFormNavigationProps> = ({
  currentStep,
  totalSteps,
  canProceed,
  loading = false,
  onBack,
  onNext,
  onSubmit,
  showBackOnFirstStep = false,
}) => {
  const isLastStep = currentStep === totalSteps - 1;
  const showBack = currentStep > 0 || showBackOnFirstStep;

  return (
    <div className="flex gap-3 pt-6">
      {showBack && (
        <Button
          variant="outline"
          size="lg"
          onClick={onBack}
          disabled={loading}
          className="flex-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      )}
      
      {!isLastStep ? (
        <Button
          variant="premium"
          size="lg"
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          variant="premium"
          size="lg"
          onClick={onSubmit}
          disabled={loading || !canProceed}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              Complete Form
            </>
          )}
        </Button>
      )}
    </div>
  );
};

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import KYProfileCard from '@/components/home/KYProfileCard';
import { kyFormAvailable } from '@/lib/kyFormRoutes';
import { useEffectiveCohort } from '@/hooks/useEffectiveCohort';

interface OnboardingStepsSectionProps {
  title?: string;
  subtitle?: string;
}

const OnboardingStepsSection: React.FC<OnboardingStepsSectionProps> = () => {
  const { profile } = useAuth();
  const { effectiveCohortType } = useEffectiveCohort();

  if (!profile) return null;
  if (profile.ky_form_completed) return null;
  if (!profile.profile_setup_completed) return null;
  // FAI has no KY form yet — don't show the KY onboarding card to FAI students.
  if (!kyFormAvailable(effectiveCohortType)) return null;

  return <KYProfileCard />;
};

export default OnboardingStepsSection;

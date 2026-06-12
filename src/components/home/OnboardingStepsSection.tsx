import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import KYProfileCard from '@/components/home/KYProfileCard';
import { kyFormAvailable } from '@/lib/kyFormRoutes';

interface OnboardingStepsSectionProps {
  title?: string;
  subtitle?: string;
}

const OnboardingStepsSection: React.FC<OnboardingStepsSectionProps> = () => {
  const { profile, edition } = useAuth();

  if (!profile) return null;
  if (profile.ky_form_completed) return null;
  if (!profile.profile_setup_completed) return null;
  // FAI has no KY form yet — don't show the KY onboarding card to FAI students.
  if (!kyFormAvailable(edition?.cohort_type ?? (profile as any)?.cohort_type)) return null;

  return <KYProfileCard />;
};

export default OnboardingStepsSection;

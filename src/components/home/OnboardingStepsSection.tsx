import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import KYProfileCard from '@/components/home/KYProfileCard';

interface OnboardingStepsSectionProps {
  title?: string;
  subtitle?: string;
}

const OnboardingStepsSection: React.FC<OnboardingStepsSectionProps> = () => {
  const { profile } = useAuth();

  if (!profile) return null;
  if (profile.ky_form_completed) return null;
  if (!profile.profile_setup_completed) return null;

  return <KYProfileCard />;
};

export default OnboardingStepsSection;

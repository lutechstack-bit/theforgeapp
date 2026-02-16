import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { KYFormCompletion } from '@/components/kyform/KYFormCompletion';

const Welcome: React.FC = () => {
  const { profile } = useAuth();

  // Determine cohort type from profile's edition
  const cohortType = (profile as any)?.edition?.cohort_type || 'FORGE';

  return (
    <KYFormCompletion cohortType={cohortType} />
  );
};

export default Welcome;

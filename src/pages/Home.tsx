import React, { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import { HomeCarouselSkeleton } from '@/components/home/HomeCarouselSkeleton';
import { HomeErrorState } from '@/components/home/HomeErrorState';
import HomeJourneySection from '@/components/home/HomeJourneySection';

import HeroBanner from '@/components/home/HeroBanner';
import OnboardingStepsSection from '@/components/home/OnboardingStepsSection';
import BatchmatesSection from '@/components/home/BatchmatesSection';
import AlumniShowcaseSection from '@/components/home/AlumniShowcaseSection';
import PaymentFocusCard from '@/components/home/PaymentFocusCard';
import LiveSessionCard from '@/components/home/LiveSessionCard';
import TravelStaySection from '@/components/home/TravelStaySection';
import AdminCohortSwitcher from '@/components/admin/AdminCohortSwitcher';

import { useHomepageSections } from '@/hooks/useHomepageSections';
import { useEffectiveCohort } from '@/hooks/useEffectiveCohort';
import {  promiseWithTimeout, isTimeoutError } from '@/lib/promiseTimeout';

const QUERY_TIMEOUT = 12000;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { profile, edition, userDataLoading } = useAuth();
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  
  const { getSection } = useHomepageSections();

  const showDebug = searchParams.get('homeDebug') === '1';
  const { effectiveCohortType } = useEffectiveCohort();
  const userCohortType = effectiveCohortType;

  // Fetch alumni showcase
  const alumniShowcaseQuery = useQuery({
    queryKey: ['alumni-showcase', userCohortType],
    queryFn: async () => {
      const result = await promiseWithTimeout(
        supabase
          .from('alumni_showcase')
          .select('*')
          .eq('cohort_type', userCohortType || 'FORGE')
          .eq('is_active', true)
          .order('order_index', { ascending: true })
          .limit(12)
          .then(res => res),
        QUERY_TIMEOUT,
        'alumni_showcase'
      );
      if (result.error) throw result.error;
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const isAnyError = alumniShowcaseQuery.isError;
  const isAnyLoading = alumniShowcaseQuery.isLoading;

  const failedQueries = [
    alumniShowcaseQuery.isError && { name: 'Alumni Showcase', error: alumniShowcaseQuery.error as Error },
  ].filter(Boolean) as { name: string; error: Error }[];

  // Loading timeout
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (userDataLoading) return;
    if (isAnyLoading) {
      setLoadingTimedOut(false);
      timeoutRef.current = setTimeout(() => setLoadingTimedOut(true), 15000);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isAnyLoading, userDataLoading]);

  const handleRetry = () => {
    setLoadingTimedOut(false);
    queryClient.invalidateQueries({ queryKey: ['alumni-showcase'] });
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  // Get section configs
  const countdownSection = getSection('countdown');
  const paymentSection = getSection('payment');
  
  const onboardingSection = getSection('onboarding');
  const journeySection = getSection('journey');
  const batchmatesSection = getSection('batchmates');
  const alumniSection = getSection('alumni');
  const travelStaySection = getSection('travel_stay');

  return (
    <div className="min-h-screen">
      {/* Hero Banner — full bleed, with overlaid countdown */}
      <HeroBanner edition={edition} showCountdown={!!countdownSection} />

      <div className="page-container">
        <div className="space-y-6 sm:space-y-8 pb-24 md:pb-8 max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto">

          {/* Payment Due Card - removed from here, moved below onboarding */}



          {/* 3. Onboarding Steps */}
          {onboardingSection && (
            <OnboardingStepsSection
              title={onboardingSection.title}
              subtitle={onboardingSection.subtitle || undefined}
            />
          )}

          {/* 4. Payment Focus Card */}
          {paymentSection !== null && <PaymentFocusCard />}

          {/* 5. Journey Timeline */}
          {journeySection && (
            <div id="journey-section">
              <HomeJourneySection
                title={journeySection.title}
                subtitle={journeySection.subtitle || undefined}
              />
            </div>
          )}

          {/* 5. Batchmates */}
          {batchmatesSection && (
            <BatchmatesSection
              title={batchmatesSection.title}
              subtitle={batchmatesSection.subtitle || undefined}
            />
          )}

          {/* Debug Panel */}
          {showDebug && (
            <div className="text-xs font-mono bg-muted/50 border border-border rounded-lg p-4 space-y-2">
              <p className="font-semibold">Home Debug Panel</p>
              <p>Alumni Showcase: {alumniShowcaseQuery.isLoading ? '⏳' : alumniShowcaseQuery.isError ? '❌' : `✅ (${alumniShowcaseQuery.data?.length || 0})`}</p>
              <p>User Cohort: {userCohortType || '(none)'}</p>
            </div>
          )}

          {/* Error State */}
          {(isAnyError || loadingTimedOut) && (
            <HomeErrorState
              failedQueries={loadingTimedOut && !isAnyError
                ? [{ name: 'All', error: new Error('Loading timed out.') }]
                : failedQueries}
              onRetry={handleRetry}
              showDebug={showDebug}
            />
          )}

          {/* 6. Alumni Showcase */}
          {alumniSection && !loadingTimedOut && (
            <AlumniShowcaseSection
              alumni={alumniShowcaseQuery.data || []}
              isLoading={alumniShowcaseQuery.isLoading}
              cohortType={userCohortType || 'FORGE'}
              title={alumniSection.title}
              subtitle={alumniSection.subtitle || undefined}
            />
          )}

          {/* 7. Travel & Stay */}
          {travelStaySection && !loadingTimedOut && (
            <TravelStaySection
              title={travelStaySection.title}
              subtitle={travelStaySection.subtitle || undefined}
            />
          )}
        </div>
      </div>

      {/* Admin Cohort Switcher */}
      <AdminCohortSwitcher />
    </div>
  );
};

export default Home;

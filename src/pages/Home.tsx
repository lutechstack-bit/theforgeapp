import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { extractYouTubeId } from '@/components/home/AlumniShowcaseSection';
import { supabase } from '@/integrations/supabase/client';
import { CompactCountdownTimer } from '@/components/home/CompactCountdownTimer';
import { HomeCarouselSkeleton } from '@/components/home/HomeCarouselSkeleton';
import { HomeErrorState } from '@/components/home/HomeErrorState';
import HomeJourneySection from '@/components/home/HomeJourneySection';
import TodaysFocusCard from '@/components/home/TodaysFocusCard';
import OnboardingStepsSection from '@/components/home/OnboardingStepsSection';
import BatchmatesSection from '@/components/home/BatchmatesSection';
import AlumniShowcaseSection from '@/components/home/AlumniShowcaseSection';
import TravelStaySection from '@/components/home/TravelStaySection';
import AdminCohortSwitcher from '@/components/admin/AdminCohortSwitcher';
import { useTodaysFocus } from '@/hooks/useTodaysFocus';
import { useHomepageSections } from '@/hooks/useHomepageSections';
import { Users } from 'lucide-react';
import { promiseWithTimeout, isTimeoutError } from '@/lib/promiseTimeout';

const QUERY_TIMEOUT = 12000;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { profile, edition, userDataLoading } = useAuth();
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { activeFocusCard } = useTodaysFocus();
  const { getSection } = useHomepageSections();

  const showDebug = searchParams.get('homeDebug') === '1';
  const userCohortType = edition?.cohort_type;

  // Fetch alumni testimonials from admin-managed table
  const alumniQuery = useQuery({
    queryKey: ['home_alumni_testimonials', userCohortType],
    queryFn: async () => {
      const result = await promiseWithTimeout(
        supabase
          .from('alumni_testimonials')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true })
          .then(res => res),
        QUERY_TIMEOUT,
        'home_alumni_testimonials'
      );
      if (result.error) throw result.error;
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const displayAlumni = useMemo(() => {
    const data = alumniQuery.data;
    if (!data) return [];

    let filtered = data;
    if (userCohortType) {
      const cohortFiltered = data.filter((a: any) =>
        a.cohort_types?.includes(userCohortType)
      );
      if (cohortFiltered.length > 0) filtered = cohortFiltered;
    }

    return filtered.map((a: any) => {
      const videoId = extractYouTubeId(a.video_url || '');
      const thumbnail = a.thumbnail_url || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null);
      return {
        id: a.id,
        name: a.name,
        role: a.role,
        video_url: a.video_url,
        thumbnail_url: thumbnail,
        film: a.film,
        achievement: a.achievement,
      };
    });
  }, [alumniQuery.data, userCohortType]);

  const isAnyError = alumniQuery.isError;
  const isAnyLoading = alumniQuery.isLoading;

  const failedQueries = [
    alumniQuery.isError && { name: 'Alumni Testimonials', error: alumniQuery.error as Error },
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
    queryClient.invalidateQueries({ queryKey: ['home_student_works_all'] });
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  // Get section configs
  const countdownSection = getSection('countdown');
  const focusSection = getSection('todays_focus');
  const onboardingSection = getSection('onboarding');
  const journeySection = getSection('journey');
  const batchmatesSection = getSection('batchmates');
  const alumniSection = getSection('alumni');
  const travelStaySection = getSection('travel_stay');

  return (
    <div className="min-h-screen">
      <div className="page-container">
        <div className="space-y-6 sm:space-y-8 pb-24 md:pb-8 max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto">
          {/* Personalized Welcome */}
          <div>
            <h1 className="page-title">Hi {firstName}</h1>
            <p className="text-muted-foreground text-sm">Let's make today count</p>
          </div>

          {/* 1. Countdown Timer */}
          {countdownSection && <CompactCountdownTimer edition={edition} />}
          {!countdownSection && userDataLoading && <Skeleton className="h-24 rounded-2xl" />}

          {/* 2. Today's Focus */}
          {focusSection && activeFocusCard && (
            <TodaysFocusCard card={activeFocusCard} />
          )}

          {/* 3. Onboarding Steps */}
          {onboardingSection && (
            <OnboardingStepsSection
              title={onboardingSection.title}
              subtitle={onboardingSection.subtitle || undefined}
            />
          )}

          {/* 4. Journey Timeline */}
          {journeySection && (
            <HomeJourneySection
              title={journeySection.title}
              subtitle={journeySection.subtitle || undefined}
            />
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
              <p>Alumni: {alumniQuery.isLoading ? '⏳' : alumniQuery.isError ? '❌' : `✅ (${displayAlumni.length})`}</p>
              <p>Focus Card: {activeFocusCard ? activeFocusCard.title : '(none)'}</p>
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
              alumni={displayAlumni}
              isLoading={alumniQuery.isLoading}
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

          {/* Empty State */}
          {!loadingTimedOut &&
            alumniQuery.isFetched &&
            displayAlumni.length === 0 &&
            !isAnyError && (
              <div className="rounded-2xl p-8 text-center bg-card/50 border border-border/30">
                <Users className="h-12 w-12 text-primary/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Content Coming Soon</h3>
                <p className="text-muted-foreground">
                  Check back soon for alumni stories and more!
                </p>
              </div>
            )}
        </div>
      </div>

      {/* Admin Cohort Switcher */}
      <AdminCohortSwitcher />
    </div>
  );
};

export default Home;

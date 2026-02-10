import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ContentCarousel } from '@/components/shared/ContentCarousel';
import { CleanMentorCard } from '@/components/shared/CleanMentorCard';
import { MentorDetailModal } from '@/components/shared/MentorDetailModal';
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
import { Mentor } from '@/data/mentorsData';
import { promiseWithTimeout, isTimeoutError } from '@/lib/promiseTimeout';

const QUERY_TIMEOUT = 12000;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const { profile, edition, userDataLoading } = useAuth();
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { activeFocusCard } = useTodaysFocus();
  const { getSection } = useHomepageSections();

  const showDebug = searchParams.get('homeDebug') === '1';
  const userCohortType = edition?.cohort_type;

  const handleMentorClick = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setIsMentorModalOpen(true);
  };

  // Fetch mentors
  const mentorsQuery = useQuery({
    queryKey: ['home_mentors_all'],
    queryFn: async () => {
      const result = await promiseWithTimeout(
        supabase
          .from('mentors')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true })
          .then(res => res),
        QUERY_TIMEOUT,
        'home_mentors'
      );
      if (result.error) throw result.error;
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch alumni testimonials
  const alumniTestimonialsQuery = useQuery({
    queryKey: ['home_alumni_testimonials_all'],
    queryFn: async () => {
      const result = await promiseWithTimeout(
        supabase
          .from('alumni_testimonials')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true })
          .then(res => res),
        QUERY_TIMEOUT,
        'home_alumni'
      );
      if (result.error) throw result.error;
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Filtered data
  const displayMentors = useMemo(() => {
    const allMentors = mentorsQuery.data || [];
    if (!userCohortType || allMentors.length === 0) return allMentors;
    const filtered = allMentors.filter(
      (m) => m.cohort_types && m.cohort_types.includes(userCohortType)
    );
    return filtered.length > 0 ? filtered : allMentors;
  }, [mentorsQuery.data, userCohortType]);

  const displayAlumni = useMemo(() => {
    const allAlumni = alumniTestimonialsQuery.data || [];
    if (!userCohortType || allAlumni.length === 0) return allAlumni;
    const filtered = allAlumni.filter(
      (a) => a.cohort_types && a.cohort_types.includes(userCohortType)
    );
    return filtered.length > 0 ? filtered : allAlumni;
  }, [alumniTestimonialsQuery.data, userCohortType]);

  // Aggregate states
  const isAnyError = mentorsQuery.isError || alumniTestimonialsQuery.isError;
  const isAnyLoading = mentorsQuery.isLoading || alumniTestimonialsQuery.isLoading;

  const failedQueries = [
    mentorsQuery.isError && { name: 'Mentors', error: mentorsQuery.error as Error },
    alumniTestimonialsQuery.isError && { name: 'Alumni', error: alumniTestimonialsQuery.error as Error },
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
    queryClient.invalidateQueries({ queryKey: ['home_mentors_all'] });
    queryClient.invalidateQueries({ queryKey: ['home_alumni_testimonials_all'] });
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  // Get section configs
  const countdownSection = getSection('countdown');
  const focusSection = getSection('todays_focus');
  const onboardingSection = getSection('onboarding');
  const journeySection = getSection('journey');
  const batchmatesSection = getSection('batchmates');
  const mentorsSection = getSection('mentors');
  const alumniSection = getSection('alumni');
  const travelStaySection = getSection('travel_stay');

  return (
    <div className="min-h-screen">
      <div className="px-4 py-3 sm:px-5 sm:py-4 md:px-6 md:py-6">
        {/* Main Content */}
        <div className="space-y-8 sm:space-y-10 max-w-3xl mx-auto">
          {/* Personalized Welcome */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">Hi {firstName}</h1>
            <p className="text-muted-foreground text-sm">Let's make today count</p>
          </div>

          {/* 1. Countdown Timer */}
          {countdownSection && <CompactCountdownTimer edition={edition} />}

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
              <p>Mentors: {mentorsQuery.isLoading ? '⏳' : mentorsQuery.isError ? '❌' : `✅ (${displayMentors.length})`}</p>
              <p>Alumni: {alumniTestimonialsQuery.isLoading ? '⏳' : alumniTestimonialsQuery.isError ? '❌' : `✅ (${displayAlumni.length})`}</p>
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

          {/* 6. Mentors Section */}
          {mentorsSection && !loadingTimedOut && (
            <>
              {mentorsQuery.isLoading ? (
                <HomeCarouselSkeleton title={mentorsSection.title} />
              ) : displayMentors.length > 0 ? (
                <ContentCarousel title={mentorsSection.title}>
                  {displayMentors.map((mentor) => {
                    const mentorData: Mentor = {
                      id: mentor.id,
                      name: mentor.name,
                      title: mentor.title,
                      roles: (mentor.roles as string[]) || [],
                      imageUrl: mentor.image_url || '',
                      modalImageUrl: mentor.modal_image_url || undefined,
                      bio: (mentor.bio as string[]) || [],
                      brands: (mentor.brands as any[]) || [],
                    };
                    return (
                      <CleanMentorCard
                        key={mentor.id}
                        mentor={mentorData}
                        onClick={() => handleMentorClick(mentorData)}
                      />
                    );
                  })}
                </ContentCarousel>
              ) : null}
            </>
          )}

          {/* Mentor Detail Modal */}
          <MentorDetailModal
            mentor={selectedMentor}
            isOpen={isMentorModalOpen}
            onClose={() => setIsMentorModalOpen(false)}
          />

          {/* 7. Alumni Showcase */}
          {alumniSection && !loadingTimedOut && (
            <AlumniShowcaseSection
              alumni={displayAlumni}
              isLoading={alumniTestimonialsQuery.isLoading}
              title={alumniSection.title}
              subtitle={alumniSection.subtitle || undefined}
            />
          )}

          {/* 8. Travel & Stay */}
          {travelStaySection && !loadingTimedOut && (
            <TravelStaySection
              title={travelStaySection.title}
              subtitle={travelStaySection.subtitle || undefined}
            />
          )}

          {/* Empty State */}
          {!loadingTimedOut &&
            mentorsQuery.isFetched &&
            alumniTestimonialsQuery.isFetched &&
            displayMentors.length === 0 &&
            displayAlumni.length === 0 &&
            !isAnyError && (
              <div className="rounded-2xl p-8 text-center bg-card/50 border border-border/30">
                <Users className="h-12 w-12 text-primary/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Content Coming Soon</h3>
                <p className="text-muted-foreground">
                  Check back soon for mentors, alumni stories, and more!
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

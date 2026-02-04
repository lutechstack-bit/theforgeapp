import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ContentCarousel } from '@/components/shared/ContentCarousel';
import { SimpleEventCard } from '@/components/shared/SimpleEventCard';
import { TestimonialVideoCard } from '@/components/shared/TestimonialVideoCard';
import { FlipMentorCard } from '@/components/shared/FlipMentorCard';
import { MentorDetailModal } from '@/components/shared/MentorDetailModal';
import { LearnCourseCard } from '@/components/learn/LearnCourseCard';
import { CompactCountdownTimer } from '@/components/home/CompactCountdownTimer';
import { HomeCarouselSkeleton } from '@/components/home/HomeCarouselSkeleton';
import { HomeErrorState } from '@/components/home/HomeErrorState';
import HomeJourneySection from '@/components/home/HomeJourneySection';
import RoadmapSidebar from '@/components/roadmap/RoadmapSidebar';
import FloatingHighlightsButton from '@/components/roadmap/FloatingHighlightsButton';
import AdminCohortSwitcher from '@/components/admin/AdminCohortSwitcher';
import { Users } from 'lucide-react';
import { Mentor } from '@/data/mentorsData';
import { promiseWithTimeout, isTimeoutError } from '@/lib/promiseTimeout';

// Query timeout (12 seconds)
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

  const showDebug = searchParams.get('homeDebug') === '1';

  const handleMentorClick = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setIsMentorModalOpen(true);
  };

  const userCohortType = edition?.cohort_type;

  // Fetch events with timeout protection
  const eventsQuery = useQuery({
    queryKey: ['home_events'],
    queryFn: async () => {
      const homepageResult = await promiseWithTimeout(
        supabase
          .from('events')
          .select('*')
          .eq('show_on_homepage', true)
          .order('event_date', { ascending: false })
          .limit(6)
          .then(res => res),
        QUERY_TIMEOUT,
        'home_events_featured'
      );
      
      if (homepageResult.error) throw homepageResult.error;
      
      if (homepageResult.data && homepageResult.data.length > 0) {
        return { events: homepageResult.data, isPastEvents: false };
      }
      
      const pastResult = await promiseWithTimeout(
        supabase
          .from('events')
          .select('*')
          .lt('event_date', new Date().toISOString())
          .order('event_date', { ascending: false })
          .limit(6)
          .then(res => res),
        QUERY_TIMEOUT,
        'home_events_past'
      );
      
      if (pastResult.error) throw pastResult.error;
      return { events: pastResult.data || [], isPastEvents: true };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch learn content with timeout protection
  const learnContentQuery = useQuery({
    queryKey: ['home_learn_content'],
    queryFn: async () => {
      const result = await promiseWithTimeout(
        supabase
          .from('learn_content')
          .select('*')
          .order('order_index', { ascending: true })
          .limit(6)
          .then(res => res),
        QUERY_TIMEOUT,
        'home_learn_content'
      );
      if (result.error) throw result.error;
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Fetch mentors with timeout protection
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

  // Fetch alumni testimonials with timeout protection
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

  // Client-side filtering with fallback for mentors
  const displayMentors = useMemo(() => {
    const allMentors = mentorsQuery.data || [];
    if (!userCohortType || allMentors.length === 0) {
      return allMentors;
    }
    const filtered = allMentors.filter(
      (m) => m.cohort_types && m.cohort_types.includes(userCohortType)
    );
    return filtered.length > 0 ? filtered : allMentors;
  }, [mentorsQuery.data, userCohortType]);

  // Client-side filtering with fallback for alumni
  const displayAlumni = useMemo(() => {
    const allAlumni = alumniTestimonialsQuery.data || [];
    if (!userCohortType || allAlumni.length === 0) {
      return allAlumni;
    }
    const filtered = allAlumni.filter(
      (a) => a.cohort_types && a.cohort_types.includes(userCohortType)
    );
    return filtered.length > 0 ? filtered : allAlumni;
  }, [alumniTestimonialsQuery.data, userCohortType]);

  const displayLearnContent = learnContentQuery.data || [];
  const displayEvents = eventsQuery.data?.events || [];

  // Aggregate query states
  const isAnyLoading = 
    eventsQuery.isLoading || 
    learnContentQuery.isLoading || 
    mentorsQuery.isLoading || 
    alumniTestimonialsQuery.isLoading;

  const isAnyError = 
    eventsQuery.isError || 
    learnContentQuery.isError || 
    mentorsQuery.isError || 
    alumniTestimonialsQuery.isError;

  const allFetched = 
    eventsQuery.isFetched && 
    learnContentQuery.isFetched && 
    mentorsQuery.isFetched && 
    alumniTestimonialsQuery.isFetched;

  const hasAnyContent = 
    displayMentors.length > 0 || 
    displayAlumni.length > 0 || 
    displayLearnContent.length > 0 || 
    displayEvents.length > 0;

  // Collect failed queries for error display
  const failedQueries = [
    eventsQuery.isError && { name: 'Events', error: eventsQuery.error as Error },
    learnContentQuery.isError && { name: 'Learn', error: learnContentQuery.error as Error },
    mentorsQuery.isError && { name: 'Mentors', error: mentorsQuery.error as Error },
    alumniTestimonialsQuery.isError && { name: 'Alumni', error: alumniTestimonialsQuery.error as Error },
  ].filter(Boolean) as { name: string; error: Error }[];

  // Loading timeout protection - only start counting AFTER user data is loaded
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Don't start timeout while profile/edition are still loading
    if (userDataLoading) {
      return;
    }

    // If still loading content after profile is ready, start the timeout
    if (isAnyLoading) {
      setLoadingTimedOut(false);
      timeoutRef.current = setTimeout(() => {
        setLoadingTimedOut(true);
      }, 15000);
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
    queryClient.invalidateQueries({ queryKey: ['home_events'] });
    queryClient.invalidateQueries({ queryKey: ['home_learn_content'] });
    queryClient.invalidateQueries({ queryKey: ['home_mentors_all'] });
    queryClient.invalidateQueries({ queryKey: ['home_alumni_testimonials_all'] });
  };

  return (
    <div className="min-h-screen">
      {/* Desktop Layout with Sidebar */}
      <div className="flex gap-6 px-4 py-3 sm:px-5 sm:py-4 md:px-6 md:py-6">
        
        {/* Main Content Column */}
        <div className="flex-1 space-y-10 sm:space-y-12 min-w-0">
          {/* Compact Countdown Timer - Gold themed strip at top */}
          <CompactCountdownTimer edition={edition} />

          {/* Journey Timeline - Embedded from Roadmap */}
          <HomeJourneySection />

          {/* Debug Panel (only when ?homeDebug=1) */}
          {showDebug && (
            <div className="text-xs font-mono bg-muted/50 border border-border rounded-lg p-4 space-y-2">
              <p className="font-semibold">Home Debug Panel</p>
              <p>Events: {eventsQuery.isLoading ? '⏳' : eventsQuery.isError ? `❌ ${isTimeoutError(eventsQuery.error) ? 'TIMEOUT' : 'ERROR'}` : `✅ (${displayEvents.length})`}</p>
              <p>Learn: {learnContentQuery.isLoading ? '⏳' : learnContentQuery.isError ? `❌ ${isTimeoutError(learnContentQuery.error) ? 'TIMEOUT' : 'ERROR'}` : `✅ (${displayLearnContent.length})`}</p>
              <p>Mentors: {mentorsQuery.isLoading ? '⏳' : mentorsQuery.isError ? `❌ ${isTimeoutError(mentorsQuery.error) ? 'TIMEOUT' : 'ERROR'}` : `✅ (${displayMentors.length})`}</p>
              <p>Alumni: {alumniTestimonialsQuery.isLoading ? '⏳' : alumniTestimonialsQuery.isError ? `❌ ${isTimeoutError(alumniTestimonialsQuery.error) ? 'TIMEOUT' : 'ERROR'}` : `✅ (${displayAlumni.length})`}</p>
              <p>User Cohort: {userCohortType || '(none)'}</p>
              <p>User Data Loading: {userDataLoading ? 'Yes' : 'No'}</p>
            </div>
          )}

          {/* Error State - show when queries fail or timeout */}
          {(isAnyError || loadingTimedOut) && (
            <HomeErrorState 
              failedQueries={loadingTimedOut && !isAnyError 
                ? [{ name: 'All', error: new Error('Loading timed out. Please check your connection.') }] 
                : failedQueries} 
              onRetry={handleRetry}
              showDebug={showDebug}
            />
          )}

          {/* Per-section rendering - each section loads independently */}
          {!loadingTimedOut && (
            <>
              {/* Mentors Section */}
              {mentorsQuery.isLoading ? (
                <HomeCarouselSkeleton title="Meet Your Mentors" />
              ) : displayMentors.length > 0 ? (
                <ContentCarousel title="Meet Your Mentors">
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
                      <FlipMentorCard
                        key={mentor.id}
                        mentor={mentorData}
                        onClick={() => handleMentorClick(mentorData)}
                      />
                    );
                  })}
                </ContentCarousel>
              ) : null}

              {/* Mentor Detail Modal */}
              <MentorDetailModal
                mentor={selectedMentor}
                isOpen={isMentorModalOpen}
                onClose={() => setIsMentorModalOpen(false)}
              />

              {/* Alumni Section */}
              {alumniTestimonialsQuery.isLoading ? (
                <HomeCarouselSkeleton title="Alumni Spotlight" />
              ) : displayAlumni.length > 0 ? (
                <ContentCarousel title="Alumni Spotlight">
                  {displayAlumni.map((alumni) => (
                    <TestimonialVideoCard
                      key={alumni.id}
                      name={alumni.name}
                      role={alumni.role || undefined}
                      videoUrl={alumni.video_url}
                    />
                  ))}
                </ContentCarousel>
              ) : null}

              {/* Learn Section */}
              {learnContentQuery.isLoading ? (
                <HomeCarouselSkeleton title="Fundamental learning for Forge and beyond" />
              ) : displayLearnContent.length > 0 ? (
                <ContentCarousel title="Fundamental learning for Forge and beyond" onSeeAll={() => navigate('/learn')}>
                  {displayLearnContent.map((content: any) => (
                    <LearnCourseCard
                      key={content.id}
                      id={content.id}
                      title={content.title}
                      thumbnailUrl={content.thumbnail_url || undefined}
                      durationMinutes={content.duration_minutes}
                    />
                  ))}
                </ContentCarousel>
              ) : null}

              {/* Events Section */}
              {eventsQuery.isLoading ? (
                <HomeCarouselSkeleton title="More from LevelUp" />
              ) : displayEvents.length > 0 ? (
                <ContentCarousel title="More from LevelUp" onSeeAll={() => navigate('/events')}>
                  {displayEvents.map((event: any) => (
                    <SimpleEventCard
                      key={event.id}
                      id={event.id}
                      title={event.title}
                      imageUrl={event.image_url || undefined}
                      onClick={() => navigate('/events')}
                    />
                  ))}
                </ContentCarousel>
              ) : null}

              {/* Empty State - Only show when all queries succeeded AND no content */}
              {allFetched && !hasAnyContent && !isAnyError && (
                <div className="glass-premium rounded-2xl p-8 text-center">
                  <Users className="h-12 w-12 text-primary/50 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Content Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Check back soon for alumni stories, mentors, courses, and events!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Desktop Sidebar - Hidden on mobile/tablet */}
        <div className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
          <div className="sticky top-24">
            <RoadmapSidebar editionId={profile?.edition_id} />
          </div>
        </div>
      </div>

      {/* Mobile Floating Button - Hidden on desktop */}
      <FloatingHighlightsButton editionId={profile?.edition_id} />
      
      {/* Admin Cohort Switcher - Admin only */}
      <AdminCohortSwitcher />
    </div>
  );
};

export default Home;

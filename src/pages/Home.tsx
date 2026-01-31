import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ContentCarousel } from '@/components/shared/ContentCarousel';
import { SimpleEventCard } from '@/components/shared/SimpleEventCard';
import { TestimonialVideoCard } from '@/components/shared/TestimonialVideoCard';
import { FlipMentorCard } from '@/components/shared/FlipMentorCard';
import { MentorDetailModal } from '@/components/shared/MentorDetailModal';
import { LearnCourseCard } from '@/components/learn/LearnCourseCard';
import { CompactCountdownTimer } from '@/components/home/CompactCountdownTimer';
import HomeJourneySection from '@/components/home/HomeJourneySection';
import RoadmapSidebar from '@/components/roadmap/RoadmapSidebar';
import FloatingHighlightsButton from '@/components/roadmap/FloatingHighlightsButton';
import AdminCohortSwitcher from '@/components/admin/AdminCohortSwitcher';
import { Users } from 'lucide-react';
import { Mentor } from '@/data/mentorsData';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);

  const handleMentorClick = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setIsMentorModalOpen(true);
  };

  // Fetch edition data for countdown and cohort filtering
  const { data: edition } = useQuery({
    queryKey: ['user-edition', profile?.edition_id],
    queryFn: async () => {
      if (!profile?.edition_id) return null;
      const { data, error } = await supabase
        .from('editions')
        .select('*')
        .eq('id', profile.edition_id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.edition_id,
  });

  // Get user's cohort type from their edition
  const userCohortType = edition?.cohort_type;

  // Fetch events from database - prioritize homepage featured, then past events fallback
  const { data: events } = useQuery({
    queryKey: ['home_events'],
    queryFn: async () => {
      // First try to get events marked for homepage
      const { data: homepageEvents, error: homepageError } = await supabase
        .from('events')
        .select('*')
        .eq('show_on_homepage', true)
        .order('event_date', { ascending: false })
        .limit(6);
      
      if (homepageError) throw homepageError;
      
      // If we have homepage events, return them
      if (homepageEvents && homepageEvents.length > 0) {
        return { events: homepageEvents, isPastEvents: false };
      }
      
      // Fallback to recent past events
      const { data: pastEvents, error: pastError } = await supabase
        .from('events')
        .select('*')
        .lt('event_date', new Date().toISOString())
        .order('event_date', { ascending: false })
        .limit(6);
      
      if (pastError) throw pastError;
      return { events: pastEvents || [], isPastEvents: true };
    },
  });

  // Fetch learn content from database
  const { data: learnContent } = useQuery({
    queryKey: ['home_learn_content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learn_content')
        .select('*')
        .order('order_index', { ascending: true })
        .limit(6);
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch mentors from database - filtered by user's cohort type
  const { data: mentors } = useQuery({
    queryKey: ['home_mentors', userCohortType],
    queryFn: async () => {
      let query = supabase
        .from('mentors')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      
      // Filter by cohort if user has an edition with cohort_type
      if (userCohortType) {
        query = query.contains('cohort_types', [userCohortType]);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch alumni testimonials from database - filtered by user's cohort type
  const { data: alumniTestimonials } = useQuery({
    queryKey: ['home_alumni_testimonials', userCohortType],
    queryFn: async () => {
      let query = supabase
        .from('alumni_testimonials')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      
      // Filter by cohort if user has an edition with cohort_type
      if (userCohortType) {
        query = query.contains('cohort_types', [userCohortType]);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const displayLearnContent = learnContent || [];
  const displayEvents = events?.events || [];
  const isPastEvents = events?.isPastEvents ?? false;

  return (
    <div className="min-h-screen">
      {/* Desktop Layout with Sidebar */}
      <div className="flex gap-6 px-4 py-3 sm:px-5 sm:py-4 md:px-6 md:py-6">
        
        {/* Main Content Column */}
        <div className="flex-1 space-y-5 sm:space-y-6 min-w-0">
          {/* Compact Countdown Timer - Gold themed strip at top */}
          <CompactCountdownTimer edition={edition} />

          {/* Journey Timeline - Embedded from Roadmap */}
          <HomeJourneySection />

          {/* Meet Your Mentors - Moved up after hero */}
          {mentors && mentors.length > 0 && (
            <ContentCarousel title="Meet Your Mentors">
              {mentors.map((mentor) => {
                // Transform DB mentor to Mentor type for FlipMentorCard
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
          )}

          {/* Mentor Detail Modal */}
          <MentorDetailModal
            mentor={selectedMentor}
            isOpen={isMentorModalOpen}
            onClose={() => setIsMentorModalOpen(false)}
          />

          {/* Alumni Testimonials */}
          {alumniTestimonials && alumniTestimonials.length > 0 && (
            <ContentCarousel title="Alumni Spotlight">
              {alumniTestimonials.map((alumni) => (
                <TestimonialVideoCard
                  key={alumni.id}
                  name={alumni.name}
                  role={alumni.role || undefined}
                  videoUrl={alumni.video_url}
                />
              ))}
            </ContentCarousel>
          )}

          {/* Learn Section */}
          {displayLearnContent.length > 0 && (
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
          )}

          {/* Events Section - Moved to end */}
          {displayEvents.length > 0 && (
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
          )}

          {/* Empty State */}
          {(!alumniTestimonials?.length && !mentors?.length && !learnContent?.length && !displayEvents?.length) && (
            <div className="glass-premium rounded-2xl p-8 text-center">
              <Users className="h-12 w-12 text-primary/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Content Coming Soon</h3>
              <p className="text-muted-foreground">
                Check back soon for alumni stories, mentors, courses, and events!
              </p>
            </div>
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
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ContentCarousel } from '@/components/shared/ContentCarousel';
import { EventCard } from '@/components/shared/EventCard';
import { TestimonialVideoCard } from '@/components/shared/TestimonialVideoCard';
import { FlipMentorCard } from '@/components/shared/FlipMentorCard';
import { MentorDetailModal } from '@/components/shared/MentorDetailModal';
import { LearnCourseCard } from '@/components/learn/LearnCourseCard';
import { KYFormReminderBanner } from '@/components/onboarding/KYFormReminderBanner';
import { CompactCountdownTimer } from '@/components/home/CompactCountdownTimer';
import { ProgressHeroSection } from '@/components/home/ProgressHeroSection';

import { WhatYouCanDoHere } from '@/components/home/WhatYouCanDoHere';
import { ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Mentor } from '@/data/mentorsData';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { profile, isFullAccess } = useAuth();
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

  // Fetch home cards (students, mentors, etc.)
  const { data: homeCards } = useQuery({
    queryKey: ['home_cards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('home_cards')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch events from database
  const { data: events } = useQuery({
    queryKey: ['home_events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(6);
      if (error) throw error;
      return data || [];
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

  const dummyLearnContent = [
    { id: '1', title: 'The Art of Visual Storytelling', duration_minutes: 45, thumbnail_url: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400' },
    { id: '2', title: 'Mastering Cinematography', duration_minutes: 60, thumbnail_url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400' },
    { id: '3', title: 'Sound Design Fundamentals', duration_minutes: 30, thumbnail_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400' },
    { id: '4', title: 'Post-Production Workflow', duration_minutes: 55, thumbnail_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400' },
  ];

  const dummyEvents = [
    { 
      id: '1', 
      title: 'Masterclass: Creating Award-Winning Short Films', 
      event_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Los Angeles, CA',
      image_url: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=600',
      is_virtual: false,
      hostName: 'Steven Spielberg',
      hostAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      isFillingFast: true,
    },
    { 
      id: '2', 
      title: 'Virtual Networking: Connect with Industry Pros', 
      event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: null,
      image_url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600',
      is_virtual: true,
      hostName: 'Film Connect',
      hostAvatarUrl: null,
      isFillingFast: false,
    },
    { 
      id: '3', 
      title: 'Documentary Filmmaking Workshop', 
      event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'New York, NY',
      image_url: 'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=600',
      is_virtual: false,
      hostName: 'Documentary Guild',
      hostAvatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
      isFillingFast: true,
    },
  ];
  
  const displayLearnContent = (learnContent && learnContent.length > 0) ? learnContent : dummyLearnContent;
  const displayEvents = (events && events.length > 0) ? events : dummyEvents;

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      {/* Compact Countdown Timer - Gold themed strip at top */}
      <CompactCountdownTimer edition={edition} />

      {/* Progress Hero Section - My Progress dashboard */}
      <ProgressHeroSection />

      {/* Compact Community Card */}
      <div className="bg-card border border-border rounded-xl p-3 sm:p-4 hover-gold-glow tap-scale card-shine reveal-section" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Users className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Connect with Peers</h3>
              <p className="text-xs text-muted-foreground">Join the conversation</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/community')}
            variant="outline"
            size="sm"
            className="rounded-lg border-border hover:bg-muted"
          >
            View
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>

      {/* KY Form Reminder Banner */}
      <KYFormReminderBanner />


      {/* What You Can Do Here - Onboarding for new users */}
      <WhatYouCanDoHere />

      {/* Alumni Testimonials - Enhanced with demographics */}
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

      {/* Upcoming Events - Moved higher */}
      {displayEvents.length > 0 && (
        <ContentCarousel title="Upcoming Events" onSeeAll={() => navigate('/events')}>
          {displayEvents.map((event: any) => (
            <EventCard
              key={event.id}
              title={event.title}
              date={format(new Date(event.event_date), 'EEE, MMM d')}
              location={event.location || undefined}
              imageUrl={event.image_url || undefined}
              hostName={event.hostName}
              hostAvatarUrl={event.hostAvatarUrl}
              isFillingFast={event.isFillingFast}
              isVirtual={event.is_virtual}
              onClick={() => navigate('/events')}
            />
          ))}
        </ContentCarousel>
      )}

      {/* Meet Your Mentors */}
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

      {/* Learn Section */}
      {displayLearnContent.length > 0 && (
        <ContentCarousel title="Learn" onSeeAll={() => navigate('/learn')}>
          {displayLearnContent.map((content: any) => (
            <LearnCourseCard
              key={content.id}
              id={content.id}
              title={content.title}
              thumbnailUrl={content.thumbnail_url || undefined}
              durationMinutes={content.duration_minutes}
              isLocked={content.is_premium && !isFullAccess}
            />
          ))}
        </ContentCarousel>
      )}

      {/* Empty State */}
      {(!alumniTestimonials?.length && !mentors?.length && !learnContent?.length && !events?.length) && (
        <div className="glass-premium rounded-2xl p-8 text-center">
          <Users className="h-12 w-12 text-primary/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Content Coming Soon</h3>
          <p className="text-muted-foreground">
            Check back soon for alumni stories, mentors, courses, and events!
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;
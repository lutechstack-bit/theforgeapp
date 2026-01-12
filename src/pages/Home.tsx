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
import { FOMOBanner } from '@/components/shared/FOMOBanner';
import { CompactCountdownTimer } from '@/components/home/CompactCountdownTimer';

import { MasterNotificationCenter } from '@/components/home/MasterNotificationCenter';
import { WhatYouCanDoHere } from '@/components/home/WhatYouCanDoHere';
import { OnboardingChecklist } from '@/components/home/OnboardingChecklist';
import { Calendar, ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { mentorsData, Mentor } from '@/data/mentorsData';
// Alumni testimonial videos with enhanced data
const alumniTestimonials = [
  { 
    id: '1', 
    name: 'Anurag', 
    role: 'Director & Screenwriter',
    film: 'Short Film: "The Last Frame"',
    achievement: 'Selected at MAMI Film Festival 2024',
    videoUrl: '/videos/testimonials/anurag.mp4' 
  },
  { 
    id: '2', 
    name: 'Ashwin', 
    role: 'Cinematographer',
    film: 'Documentary: "Urban Stories"',
    achievement: 'Now at Prime Focus Studios',
    videoUrl: '/videos/testimonials/ashwin.mp4' 
  },
  { 
    id: '3', 
    name: 'Devansh', 
    role: 'Editor & Colorist',
    film: 'Music Video: "Echoes"',
    achievement: '1M+ views on YouTube',
    videoUrl: '/videos/testimonials/devansh.mp4' 
  },
  { 
    id: '4', 
    name: 'Aanchal', 
    role: 'Producer & Writer',
    film: 'Web Series: "City Lights"',
    achievement: 'Streaming on MX Player',
    videoUrl: '/videos/testimonials/aanchal.mp4' 
  },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [isMentorModalOpen, setIsMentorModalOpen] = useState(false);

  const handleMentorClick = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setIsMentorModalOpen(true);
  };

  // Fetch edition data for countdown
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
    <div className="min-h-screen p-4 md:p-6 space-y-6">
      {/* Compact Countdown Timer - Gold themed strip at top */}
      <CompactCountdownTimer edition={edition} />

      {/* Master Notification Center - Updates & Reminders */}
      <MasterNotificationCenter />

      {/* KY Form Reminder Banner */}
      <KYFormReminderBanner />

      {/* FOMO Banner for 15k paid users */}
      <FOMOBanner />

      {/* What You Can Do Here - Onboarding for new users */}
      <WhatYouCanDoHere />

      {/* Onboarding Checklist - Getting Started Tasks */}
      <OnboardingChecklist />

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 reveal-section" style={{ animationDelay: '0.15s' }}>
        {/* Roadmap Card */}
        <div className="bg-card border border-border rounded-xl p-5 hover-lift tap-scale card-shine">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Your Roadmap</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Track your progress and upcoming milestones
              </p>
            </div>
            <div className="p-2 rounded-lg bg-primary/10 transition-transform duration-300 group-hover:scale-110">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
          </div>
          <Button 
            onClick={() => navigate('/roadmap')}
            className="w-full rounded-lg bg-primary hover:bg-primary/90 btn-press transition-all duration-200"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Go to Roadmap
            <ArrowRight className="h-4 w-4 ml-auto transition-transform duration-200 group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Community Card */}
        <div className="bg-card border border-border rounded-xl p-5 hover-lift tap-scale card-shine">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Connect with Peers</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Join the conversation with fellow creators
              </p>
            </div>
          </div>
          <Button 
            onClick={() => navigate('/community')}
            variant="outline"
            className="w-full rounded-lg border-border hover:bg-muted btn-press transition-all duration-200"
          >
            View Community
            <ArrowRight className="h-4 w-4 ml-auto transition-transform duration-200 group-hover:translate-x-1" />
          </Button>
        </div>
      </div>

      {/* Alumni Testimonials - Enhanced with demographics */}
      <ContentCarousel title="Alumni Spotlight">
        {alumniTestimonials.map((alumni) => (
          <TestimonialVideoCard
            key={alumni.id}
            name={alumni.name}
            role={alumni.role}
            film={alumni.film}
            achievement={alumni.achievement}
            videoUrl={alumni.videoUrl}
          />
        ))}
      </ContentCarousel>

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
      <ContentCarousel title="Meet Your Mentors">
        {mentorsData.map((mentor) => (
          <FlipMentorCard
            key={mentor.id}
            mentor={mentor}
            onClick={() => handleMentorClick(mentor)}
          />
        ))}
      </ContentCarousel>

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
              instructorName={content.instructor_name}
              companyName={content.company_name}
              isPremium={content.is_premium}
            />
          ))}
        </ContentCarousel>
      )}

      {/* Empty State */}
      {(!alumniTestimonials.length && !mentorsData.length && !learnContent?.length && !events?.length) && (
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

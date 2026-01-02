import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ContentCarousel } from '@/components/shared/ContentCarousel';
import { EventCard } from '@/components/shared/EventCard';
import { TestimonialVideoCard } from '@/components/shared/TestimonialVideoCard';
import { MentorVideoCard } from '@/components/shared/MentorVideoCard';
import { LearnCourseCard } from '@/components/learn/LearnCourseCard';
import { KYFormReminderBanner } from '@/components/onboarding/KYFormReminderBanner';
import { FOMOBanner } from '@/components/shared/FOMOBanner';
import { Calendar, ArrowRight, Flame, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

// Alumni testimonial videos
const alumniTestimonials = [
  { id: '1', name: 'Anurag', videoUrl: '/videos/testimonials/anurag.mp4' },
  { id: '2', name: 'Ashwin', videoUrl: '/videos/testimonials/ashwin.mp4' },
  { id: '3', name: 'Devansh', videoUrl: '/videos/testimonials/devansh.mp4' },
  { id: '4', name: 'Aanchal', videoUrl: '/videos/testimonials/aanchal.mp4' },
];

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

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

  // Filter home cards by type (for mentors)
  const mentorCardsFromDb = homeCards?.filter(card => card.card_type === 'mentor') || [];

  // Mentor data with actual images
  const mentorData = [
    { id: '1', title: 'Leadership', subtitle: 'Mastering', name: 'Praveen', image_url: '/images/mentors/praveen.png', companyName: 'LevelUp' },
    { id: '2', title: 'Growth Strategy', subtitle: 'Building', name: 'Santhosh', image_url: '/images/mentors/santhosh.png', companyName: 'LevelUp' },
    { id: '3', title: 'Creative Vision', subtitle: 'Developing', name: 'Sharan', image_url: '/images/mentors/sharan.png', companyName: 'LevelUp' },
    { id: '4', title: 'Excellence', subtitle: 'Achieving', name: 'Sharanya', image_url: '/images/mentors/sharanya.png', companyName: 'LevelUp' },
  ];

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

  // Use database data if available, otherwise use local mentor data
  const mentorCards = mentorCardsFromDb.length > 0 ? mentorCardsFromDb : mentorData;
  const displayLearnContent = (learnContent && learnContent.length > 0) ? learnContent : dummyLearnContent;
  const displayEvents = (events && events.length > 0) ? events : dummyEvents;

  useEffect(() => {
    if (!edition?.forge_start_date) return;

    const targetDate = new Date(edition.forge_start_date);

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [edition?.forge_start_date]);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center countdown-number">
      <span className="text-2xl md:text-3xl font-bold text-white tabular-nums transition-all duration-300">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[10px] text-white/60 uppercase tracking-wider">{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8">
      {/* KY Form Reminder Banner */}
      <KYFormReminderBanner />

      {/* FOMO Banner for 15k paid users */}
      <FOMOBanner />

      {/* Hero Banner with Countdown */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-accent min-h-[180px] md:min-h-[200px] reveal-section hover-glow transition-all duration-500">
        {/* Animated decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 animate-pulse-soft" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white/10 rounded-full blur-2xl animate-float" />
        </div>
        
        {/* Decorative illustration placeholder */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block">
          <div className="w-32 h-32 bg-white/10 rounded-2xl backdrop-blur-sm flex items-center justify-center animate-float">
            <Flame className="w-16 h-16 text-white/40 animate-pulse-soft" />
          </div>
        </div>

        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Forge Begins In
            </h1>
            <p className="text-white/70 text-sm">
              Your creative journey starts soon
            </p>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center gap-3 md:gap-6 bg-black/20 backdrop-blur-sm rounded-xl px-6 py-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <TimeBlock value={timeLeft.days} label="Days" />
            <span className="text-white/40 text-xl animate-pulse-soft">:</span>
            <TimeBlock value={timeLeft.hours} label="Hours" />
            <span className="text-white/40 text-xl animate-pulse-soft">:</span>
            <TimeBlock value={timeLeft.minutes} label="Mins" />
            <span className="text-white/40 text-xl animate-pulse-soft">:</span>
            <TimeBlock value={timeLeft.seconds} label="Secs" />
          </div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 reveal-section" style={{ animationDelay: '0.1s' }}>
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

      {/* Listen to Our Alumni - Testimonials */}
      <ContentCarousel title="Listen to Our Alumni">
        {alumniTestimonials.map((alumni) => (
          <TestimonialVideoCard
            key={alumni.id}
            name={alumni.name}
            videoUrl={alumni.videoUrl}
          />
        ))}
      </ContentCarousel>

      {/* About Our Mentors */}
      {mentorCards.length > 0 && (
        <ContentCarousel title="About Our Mentors" onSeeAll={() => navigate('/community')}>
          {mentorCards.map((mentor: any) => (
            <MentorVideoCard
              key={mentor.id}
              name={mentor.name || mentor.title}
              title={mentor.title}
              subtitle={mentor.subtitle || mentor.description}
              imageUrl={mentor.image_url}
              companyName={mentor.companyName}
              onClick={() => navigate('/community')}
            />
          ))}
        </ContentCarousel>
      )}

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

      {/* Events Section */}
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

      {/* Empty State */}
      {(!alumniTestimonials.length && !mentorCards.length && !learnContent?.length && !events?.length) && (
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

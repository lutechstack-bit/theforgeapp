import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ContentCarousel } from '@/components/shared/ContentCarousel';
import { CarouselCard } from '@/components/shared/CarouselCard';
import { EventCard } from '@/components/shared/EventCard';
import { MentorCard } from '@/components/shared/MentorCard';
import { Calendar, ArrowRight, Flame, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

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

  // Filter home cards by type
  const studentCards = homeCards?.filter(card => card.card_type === 'student') || [];
  const mentorCards = homeCards?.filter(card => card.card_type === 'mentor') || [];

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
    <div className="flex flex-col items-center">
      <span className="text-2xl md:text-3xl font-bold text-white tabular-nums">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[10px] text-white/60 uppercase tracking-wider">{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8">
      {/* Hero Banner with Countdown */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-accent min-h-[180px] md:min-h-[200px]">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
        </div>
        
        {/* Decorative illustration placeholder */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block">
          <div className="w-32 h-32 bg-white/10 rounded-2xl backdrop-blur-sm flex items-center justify-center">
            <Flame className="w-16 h-16 text-white/40" />
          </div>
        </div>

        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Forge Begins In
            </h1>
            <p className="text-white/70 text-sm">
              Your creative journey starts soon
            </p>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center gap-3 md:gap-6 bg-black/20 backdrop-blur-sm rounded-xl px-6 py-4">
            <TimeBlock value={timeLeft.days} label="Days" />
            <span className="text-white/40 text-xl">:</span>
            <TimeBlock value={timeLeft.hours} label="Hours" />
            <span className="text-white/40 text-xl">:</span>
            <TimeBlock value={timeLeft.minutes} label="Mins" />
            <span className="text-white/40 text-xl">:</span>
            <TimeBlock value={timeLeft.seconds} label="Secs" />
          </div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Roadmap Card */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Your Roadmap</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Track your progress and upcoming milestones
              </p>
            </div>
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
          </div>
          <Button 
            onClick={() => navigate('/roadmap')}
            className="w-full rounded-lg bg-primary hover:bg-primary/90"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Go to Roadmap
            <ArrowRight className="h-4 w-4 ml-auto" />
          </Button>
        </div>

        {/* Community Card */}
        <div className="bg-card border border-border rounded-xl p-5">
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
            className="w-full rounded-lg border-border hover:bg-muted"
          >
            View Community
            <ArrowRight className="h-4 w-4 ml-auto" />
          </Button>
        </div>
      </div>

      {/* About Our Students */}
      {studentCards.length > 0 && (
        <ContentCarousel title="About Our Students" onSeeAll={() => navigate('/community')}>
          {studentCards.map((student) => (
            <MentorCard
              key={student.id}
              name={student.title}
              specialty={student.description || ''}
              avatarUrl={student.image_url || ''}
              onClick={() => student.link ? navigate(student.link) : navigate('/community')}
            />
          ))}
        </ContentCarousel>
      )}

      {/* About Our Mentors */}
      {mentorCards.length > 0 && (
        <ContentCarousel title="About Our Mentors" onSeeAll={() => navigate('/community')}>
          {mentorCards.map((mentor) => (
            <MentorCard
              key={mentor.id}
              name={mentor.title}
              specialty={mentor.description || ''}
              avatarUrl={mentor.image_url || ''}
              onClick={() => mentor.link ? navigate(mentor.link) : navigate('/community')}
            />
          ))}
        </ContentCarousel>
      )}

      {/* Learn Section */}
      {learnContent && learnContent.length > 0 && (
        <ContentCarousel title="Learn" onSeeAll={() => navigate('/learn')}>
          {learnContent.map((content) => (
            <CarouselCard
              key={content.id}
              title={content.title}
              subtitle={content.duration_minutes ? `${content.duration_minutes} min` : undefined}
              imageUrl={content.thumbnail_url || undefined}
              onClick={() => navigate('/learn')}
            />
          ))}
        </ContentCarousel>
      )}

      {/* Events Section */}
      {events && events.length > 0 && (
        <ContentCarousel title="Upcoming Events" onSeeAll={() => navigate('/events')}>
          {events.map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              date={format(new Date(event.event_date), 'EEE, MMM d')}
              location={event.location || undefined}
              imageUrl={event.image_url || undefined}
              isVirtual={event.is_virtual}
              onClick={() => navigate('/events')}
            />
          ))}
        </ContentCarousel>
      )}

      {/* Empty State */}
      {(!studentCards.length && !mentorCards.length && !learnContent?.length && !events?.length) && (
        <div className="glass-premium rounded-2xl p-8 text-center">
          <Users className="h-12 w-12 text-primary/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Content Coming Soon</h3>
          <p className="text-muted-foreground">
            Check back soon for students, mentors, courses, and events!
          </p>
        </div>
      )}
    </div>
  );
};

export default Home;

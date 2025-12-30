import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ContentCarousel } from '@/components/shared/ContentCarousel';
import { CarouselCard } from '@/components/shared/CarouselCard';
import { MentorCard } from '@/components/shared/MentorCard';
import { Calendar, ArrowRight, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock data - replace with actual data from database
const mockStudents = [
  { id: '1', name: 'Priya Sharma', specialty: 'Content Creator', imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' },
  { id: '2', name: 'Arjun Patel', specialty: 'Video Editor', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
  { id: '3', name: 'Neha Gupta', specialty: 'Graphic Designer', imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200' },
  { id: '4', name: 'Rahul Singh', specialty: 'Photographer', imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' },
];

const mockMentors = [
  { id: '1', name: 'Virat Kohli', specialty: 'Entrepreneur', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200' },
  { id: '2', name: 'Priyanka Chopra', specialty: 'Acting Coach', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200' },
  { id: '3', name: 'Sundar Pichai', specialty: 'Tech Leadership', avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200' },
  { id: '4', name: 'Deepika Padukone', specialty: 'Brand Building', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200' },
];

const mockLearnContent = [
  { id: '1', title: 'Introduction to Content Creation', duration: '15 min', thumbnail: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400' },
  { id: '2', title: 'Building Your Personal Brand', duration: '22 min', thumbnail: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400' },
  { id: '3', title: 'Video Editing Basics', duration: '18 min', thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400' },
];

const mockEvents = [
  { id: '1', title: 'Forge Kickoff Mumbai', date: 'Feb 15, 2025', imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400' },
  { id: '2', title: 'Creator Meetup Delhi', date: 'Feb 22, 2025', imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400' },
  { id: '3', title: 'Workshop: YouTube Growth', date: 'Mar 1, 2025', imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400' },
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
      <ContentCarousel title="About Our Students" onSeeAll={() => navigate('/community')}>
        {mockStudents.map((student) => (
          <MentorCard
            key={student.id}
            name={student.name}
            specialty={student.specialty}
            avatarUrl={student.imageUrl}
            onClick={() => navigate('/community')}
          />
        ))}
      </ContentCarousel>

      {/* About Our Mentors */}
      <ContentCarousel title="About Our Mentors" onSeeAll={() => navigate('/community')}>
        {mockMentors.map((mentor) => (
          <MentorCard
            key={mentor.id}
            name={mentor.name}
            specialty={mentor.specialty}
            avatarUrl={mentor.avatarUrl}
            onClick={() => navigate('/community')}
          />
        ))}
      </ContentCarousel>

      {/* Learn Section */}
      <ContentCarousel title="Learn" onSeeAll={() => navigate('/learn')}>
        {mockLearnContent.map((content) => (
          <CarouselCard
            key={content.id}
            title={content.title}
            subtitle={content.duration}
            imageUrl={content.thumbnail}
            onClick={() => navigate('/learn')}
          />
        ))}
      </ContentCarousel>

      {/* Events Section */}
      <ContentCarousel title="Events" onSeeAll={() => navigate('/events')}>
        {mockEvents.map((event) => (
          <CarouselCard
            key={event.id}
            title={event.title}
            subtitle={event.date}
            imageUrl={event.imageUrl}
            badge="Upcoming"
            onClick={() => navigate('/events')}
          />
        ))}
      </ContentCarousel>
    </div>
  );
};

export default Home;

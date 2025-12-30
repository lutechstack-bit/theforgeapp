import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ContentCarousel } from '@/components/shared/ContentCarousel';
import { CarouselCard } from '@/components/shared/CarouselCard';
import { MentorCard } from '@/components/shared/MentorCard';
import { MasterNotificationCenter } from '@/components/home/MasterNotificationCenter';
import { ArrowRight, Clock } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

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

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  // Mock countdown - replace with actual edition data
  const forgeDate = new Date('2025-02-15');
  const daysUntilForge = differenceInDays(forgeDate, new Date());

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="container py-6 space-y-8 max-w-5xl">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          {greeting()}, {profile?.full_name?.split(' ')[0] || 'Creator'}
        </h1>
        <p className="text-muted-foreground">
          Your Forge journey awaits
        </p>
      </div>

      {/* Master Notification Center - Hero Section */}
      <MasterNotificationCenter />

      {/* Countdown + Roadmap CTA */}
      <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 shadow-glow">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary-foreground/80 mb-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Countdown to Forge</span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl sm:text-5xl font-bold text-primary-foreground">{daysUntilForge}</span>
              <span className="text-lg sm:text-xl text-primary-foreground/80">days</span>
            </div>
            <p className="text-primary-foreground/70 text-sm">
              {format(forgeDate, 'MMMM d, yyyy')} • Mumbai
            </p>
          </div>
          <Button
            variant="glass"
            onClick={() => navigate('/roadmap')}
            className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 border-primary-foreground/20"
          >
            View Roadmap
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary-foreground/10 rounded-full blur-2xl" />
      </div>

      {/* Countdown + Roadmap CTA - Now below notification center */}

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

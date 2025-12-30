import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { FeatureCard } from '@/components/shared/FeatureCard';
import { Button } from '@/components/ui/button';
import { Bell, Users, BookOpen, Calendar, Map, Sparkles, ArrowRight, Clock } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

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
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">
          {greeting()}, {profile?.full_name?.split(' ')[0] || 'Creator'}
        </h1>
        <p className="text-muted-foreground">
          Your Forge journey awaits
        </p>
      </div>

      {/* Countdown Card */}
      <div className="relative overflow-hidden rounded-2xl gradient-primary p-6 shadow-glow">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-primary-foreground/80 mb-2">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">Countdown to Forge</span>
          </div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-5xl font-bold text-primary-foreground">{daysUntilForge}</span>
            <span className="text-xl text-primary-foreground/80">days</span>
          </div>
          <p className="text-primary-foreground/70 text-sm mb-4">
            {format(forgeDate, 'MMMM d, yyyy')} • Mumbai
          </p>
          <Button
            variant="glass"
            size="sm"
            onClick={() => navigate('/roadmap')}
            className="bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 border-primary-foreground/20"
          >
            View Roadmap
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary-foreground/10 rounded-full blur-2xl" />
      </div>

      {/* Master Notification CTA */}
      <div 
        onClick={() => navigate('/updates')}
        className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 cursor-pointer hover:border-primary/30 transition-all"
      >
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Bell className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">Notification Center</h3>
          <p className="text-sm text-muted-foreground">Stay updated with the latest</p>
        </div>
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <span className="text-xs font-bold text-primary-foreground">3</span>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Explore</h2>
        <div className="grid grid-cols-2 gap-3">
          <FeatureCard
            icon={Users}
            title="Community"
            description="Connect with fellow creators"
            onClick={() => navigate('/community')}
          />
          <FeatureCard
            icon={BookOpen}
            title="Learn"
            description="Access exclusive content"
            onClick={() => navigate('/learn')}
          />
          <FeatureCard
            icon={Calendar}
            title="Events"
            description="Upcoming sessions"
            onClick={() => navigate('/events')}
          />
          <FeatureCard
            icon={Map}
            title="Roadmap"
            description="Your Forge journey"
            onClick={() => navigate('/roadmap')}
          />
        </div>
      </div>

      {/* Featured Content */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Featured</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/learn')}>
            See all
          </Button>
        </div>
        
        <div className="space-y-3">
          <FeatureCard
            title="Welcome to LevelUp"
            description="Your orientation guide to making the most of this community"
            imageUrl="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format"
            badge="New"
            isPinned
            onClick={() => navigate('/learn')}
          />
          <FeatureCard
            title="Meet Your Cohort"
            description="Get to know the amazing creators joining you on this journey"
            imageUrl="https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&auto=format"
            onClick={() => navigate('/community')}
          />
        </div>
      </div>

      {/* Engagement CTA */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-secondary border border-border/50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-glow">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Ready to connect?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start a conversation in the community and introduce yourself to fellow creators.
            </p>
            <Button variant="premium" size="sm" onClick={() => navigate('/community')}>
              Join the Conversation
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

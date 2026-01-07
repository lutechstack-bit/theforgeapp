import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Map, GraduationCap, CalendarDays, Users, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FeatureCard {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  route: string;
  color: string;
}

const features: FeatureCard[] = [
  {
    id: 'roadmap',
    icon: <Map className="w-6 h-6" />,
    title: 'Roadmap',
    description: 'Track your journey through Forge with daily schedules and milestones',
    route: '/roadmap',
    color: 'from-blue-500/20 to-blue-600/10',
  },
  {
    id: 'learn',
    icon: <GraduationCap className="w-6 h-6" />,
    title: 'Learn',
    description: 'Access exclusive masterclasses and tutorials from industry experts',
    route: '/learn',
    color: 'from-purple-500/20 to-purple-600/10',
  },
  {
    id: 'events',
    icon: <CalendarDays className="w-6 h-6" />,
    title: 'Events',
    description: 'Join workshops, networking sessions, and live Q&As',
    route: '/events',
    color: 'from-green-500/20 to-green-600/10',
  },
  {
    id: 'community',
    icon: <Users className="w-6 h-6" />,
    title: 'Community',
    description: 'Connect with fellow creators and collaborate on projects',
    route: '/community',
    color: 'from-orange-500/20 to-orange-600/10',
  },
  {
    id: 'profile',
    icon: <User className="w-6 h-6" />,
    title: 'Profile',
    description: 'Build your filmmaker identity and showcase your work',
    route: '/profile',
    color: 'from-pink-500/20 to-pink-600/10',
  },
];

const STORAGE_KEY = 'forge-onboarding-dismissed';

export const WhatYouCanDoHere: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden until we check

  useEffect(() => {
    // Check if already dismissed
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed === 'true') {
      setIsDismissed(true);
    } else {
      // Show for users who haven't completed KYF form (likely new users)
      setIsDismissed(profile?.kyf_completed === true);
    }
  }, [profile?.kyf_completed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  if (isDismissed) return null;

  return (
    <div className="relative reveal-section" style={{ animationDelay: '0.1s' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">What You Can Do Here</h2>
          <p className="text-sm text-muted-foreground">Explore what Forge has to offer</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground gap-1"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Got it</span>
        </Button>
      </div>

      {/* Scrollable Cards */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {features.map((feature, index) => (
          <div
            key={feature.id}
            onClick={() => handleCardClick(feature.route)}
            className={cn(
              "flex-shrink-0 w-40 sm:w-48 p-4 rounded-xl cursor-pointer",
              "bg-gradient-to-br border border-border/50",
              "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
              "transition-all duration-300 hover:-translate-y-1",
              "tap-scale",
              feature.color
            )}
            style={{ 
              animationDelay: `${index * 0.1}s`,
              scrollSnapAlign: 'start'
            }}
          >
            {/* Icon */}
            <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center mb-3 text-primary">
              {feature.icon}
            </div>

            {/* Content */}
            <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

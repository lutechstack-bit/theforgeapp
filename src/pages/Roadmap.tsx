import React, { useRef, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Lock, MapPin, Clock, Calendar, ChevronRight, Loader2, Compass, Flag, Anchor } from 'lucide-react';
import { format } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';

type RoadmapDay = Database['public']['Tables']['roadmap_days']['Row'];

const Roadmap: React.FC = () => {
  const { isDuringForge, profile } = useAuth();
  const { cohortName } = useTheme();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Fetch roadmap days for user's edition
  const { data: roadmapDays, isLoading } = useQuery({
    queryKey: ['roadmap-days', profile?.edition_id],
    queryFn: async () => {
      if (!profile?.edition_id) return [];
      const { data, error } = await supabase
        .from('roadmap_days')
        .select('*')
        .eq('edition_id', profile.edition_id)
        .order('day_number', { ascending: true });
      if (error) throw error;
      return data as RoadmapDay[];
    },
    enabled: !!profile?.edition_id
  });

  const getDayStatus = (day: RoadmapDay): 'completed' | 'current' | 'upcoming' | 'locked' => {
    if (!day.is_active) return 'locked';
    
    if (!day.date) {
      // Pre-forge day without date - check if it's the first active day
      const activeDays = roadmapDays?.filter(d => d.is_active) || [];
      if (activeDays[0]?.id === day.id) return 'current';
      return 'upcoming';
    }

    const today = new Date();
    const dayDate = new Date(day.date);
    
    if (dayDate < today) return 'completed';
    if (dayDate.toDateString() === today.toDateString()) return 'current';
    return 'upcoming';
  };

  const getStatusIcon = (status: 'completed' | 'current' | 'upcoming' | 'locked') => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-6 w-6 text-primary" />;
      case 'current':
        return (
          <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center shadow-glow animate-pulse-soft">
            <div className="w-2 h-2 rounded-full bg-primary-foreground" />
          </div>
        );
      case 'upcoming':
        return <Circle className="h-6 w-6 text-muted-foreground" />;
      case 'locked':
        return <Lock className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const completedCount = roadmapDays?.filter(d => getDayStatus(d) === 'completed').length || 0;
  const totalCount = roadmapDays?.length || 0;

  // Scroll progress tracking for path animation
  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;
      
      const rect = timelineRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const elementTop = rect.top;
      const elementHeight = rect.height;
      
      // Calculate how much of the timeline is scrolled through
      const scrolled = viewportHeight - elementTop;
      const totalScrollable = elementHeight + viewportHeight;
      const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));
      
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [roadmapDays]);

  if (isLoading) {
    return (
      <div className="container py-6 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile?.edition_id) {
    return (
      <div className="container py-6">
        <div className="p-8 rounded-xl bg-card border border-border/50 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">No Edition Assigned</h2>
          <p className="text-muted-foreground">
            You haven't been assigned to a Forge edition yet. Please contact the team for assistance.
          </p>
        </div>
      </div>
    );
  }

  if (!roadmapDays || roadmapDays.length === 0) {
    return (
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Your {cohortName} Roadmap</h1>
          <p className="text-muted-foreground">Your journey is being prepared...</p>
        </div>
        <div className="p-8 rounded-xl bg-card border border-border/50 text-center">
          <p className="text-muted-foreground">
            The roadmap for your edition is coming soon. Check back later!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Your {cohortName} Roadmap</h1>
        <p className="text-muted-foreground">
          {isDuringForge 
            ? 'Your daily guide through the Forge experience'
            : 'Preview your journey to Forge and beyond'}
        </p>
      </div>

      {/* Progress Overview */}
      <div className="mb-8 p-5 rounded-xl bg-card border border-border/50">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">Your Progress</span>
          <span className="text-sm font-medium text-primary">{completedCount} of {totalCount}</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div 
            className="h-full gradient-primary transition-all duration-500"
            style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
          />
        </div>
      </div>

      {/* Timeline with Treasure Map Path */}
      <div ref={timelineRef} className="relative">
        {/* SVG Dotted Path - Treasure Map Style */}
        <svg
          className="absolute left-[14px] top-0 w-16 h-full pointer-events-none overflow-visible"
          style={{ zIndex: 0 }}
        >
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.7" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background dotted path (static) */}
          {roadmapDays.map((_, index) => {
            const yStart = index === 0 ? 20 : index * 140 - 10;
            const yEnd = (index + 1) * 140 - 30;
            const isEven = index % 2 === 0;
            
            // Create winding bezier curve
            const controlX1 = isEven ? 25 : -15;
            const controlX2 = isEven ? -10 : 20;
            
            return (
              <g key={index}>
                {/* Static background path */}
                <path
                  d={`M 0 ${yStart} 
                      C ${controlX1} ${yStart + 30}, ${controlX2} ${yEnd - 30}, 0 ${yEnd}`}
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeWidth="3"
                  strokeDasharray="6 10"
                  strokeLinecap="round"
                  opacity="0.4"
                />
                
                {/* Animated progress path */}
                <path
                  d={`M 0 ${yStart} 
                      C ${controlX1} ${yStart + 30}, ${controlX2} ${yEnd - 30}, 0 ${yEnd}`}
                  fill="none"
                  stroke="url(#pathGradient)"
                  strokeWidth="3"
                  strokeDasharray="6 10"
                  strokeLinecap="round"
                  filter="url(#glow)"
                  style={{
                    opacity: scrollProgress > (index / roadmapDays.length) ? 1 : 0.2,
                    transition: 'opacity 0.5s ease-out'
                  }}
                />
              </g>
            );
          })}
        </svg>

        <div className="space-y-6">
          {roadmapDays.map((day, index) => {
            const status = getDayStatus(day);
            const checklist = (day.checklist as string[]) || [];
            const isLast = index === roadmapDays.length - 1;

            return (
              <div
                key={day.id}
                className="relative pl-14 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Waypoint Marker */}
                <div className="absolute left-0 top-2 z-10">
                  <div className={`
                    relative w-8 h-8 rounded-full flex items-center justify-center
                    transition-all duration-300
                    ${status === 'completed' 
                      ? 'bg-primary/20 border-2 border-primary' 
                      : status === 'current'
                      ? 'bg-primary shadow-[0_0_20px_hsl(var(--primary)/0.5)] border-2 border-primary'
                      : 'bg-card border-2 border-border'
                    }
                  `}>
                    {status === 'completed' && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                    {status === 'current' && (
                      <div className="relative">
                        <Compass className="h-4 w-4 text-primary-foreground animate-pulse" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-ping" />
                      </div>
                    )}
                    {status === 'upcoming' && (
                      <Circle className="h-3 w-3 text-muted-foreground" />
                    )}
                    {status === 'locked' && (
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  
                  {/* Destination flag for last item */}
                  {isLast && (
                    <Flag className="absolute -top-2 -right-2 h-4 w-4 text-primary" />
                  )}
                </div>

                {/* Card */}
                <div className={`p-4 rounded-xl border transition-all ${
                  status === 'current'
                    ? 'bg-gradient-to-br from-card to-primary/5 border-primary/30 shadow-glow'
                    : status === 'completed'
                    ? 'bg-card border-primary/20'
                    : 'bg-card border-border/50 hover:border-border'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {day.day_number > 0 && (
                          <span className="text-xs font-medium text-primary">
                            Day {day.day_number}
                          </span>
                        )}
                        {day.day_number === 0 && (
                          <span className="text-xs font-medium text-primary">
                            Pre-Forge
                          </span>
                        )}
                        {status === 'current' && (
                          <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                            Current
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{day.title}</h3>
                      {day.description && (
                        <p className="text-sm text-muted-foreground mb-3">{day.description}</p>
                      )}

                      {/* Operational Details (only shown during Forge) */}
                      {isDuringForge && day.date && (
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(day.date), 'MMM d, yyyy')}
                          </span>
                          {day.call_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {day.call_time}
                            </span>
                          )}
                          {day.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {day.location}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Preview Mode - Show basic date */}
                      {!isDuringForge && day.date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(day.date), 'MMMM d, yyyy')}
                        </div>
                      )}

                      {/* Checklist (shown during Forge or for current) */}
                      {checklist.length > 0 && (status === 'current' || isDuringForge) && (
                        <div className="space-y-2">
                          {checklist.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded border border-border flex items-center justify-center">
                                {status === 'completed' && <CheckCircle2 className="h-3 w-3 text-primary" />}
                              </div>
                              <span className={`text-sm ${status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {status !== 'locked' && (
                      <Button variant="ghost" size="icon" className="shrink-0">
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Note for Pre-Forge */}
      {!isDuringForge && (
        <div className="mt-8 p-4 rounded-xl bg-secondary/50 border border-border/50">
          <p className="text-sm text-muted-foreground text-center">
            Detailed schedules, locations, and checklists will become available once Forge begins.
          </p>
        </div>
      )}
    </div>
  );
};

export default Roadmap;

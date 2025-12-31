import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, Flag, Anchor, Sparkles, Trophy, 
  Rocket, Gift, Users, ArrowRight, Star
} from 'lucide-react';
import { differenceInDays } from 'date-fns';
import type { Database } from '@/integrations/supabase/types';
import RoadmapNode from '@/components/roadmap/RoadmapNode';
import SmoothPath from '@/components/roadmap/SmoothPath';
import { Button } from '@/components/ui/button';

type RoadmapDay = Database['public']['Tables']['roadmap_days']['Row'];

const Roadmap: React.FC = () => {
  const { profile } = useAuth();
  const { cohortName } = useTheme();
  const timelineRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(400);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Determine forge mode from profile
  const forgeMode = profile?.forge_mode || 'PRE_FORGE';

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

  // Fetch edition for forge start date
  const { data: edition } = useQuery({
    queryKey: ['edition', profile?.edition_id],
    queryFn: async () => {
      if (!profile?.edition_id) return null;
      const { data, error } = await supabase
        .from('editions')
        .select('*')
        .eq('id', profile.edition_id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.edition_id
  });

  const forgeStartDate = edition?.forge_start_date ? new Date(edition.forge_start_date) : null;
  const daysUntilForge = forgeStartDate ? differenceInDays(forgeStartDate, new Date()) : null;

  const getDayStatus = (day: RoadmapDay): 'completed' | 'current' | 'upcoming' | 'locked' => {
    if (!day.is_active) return 'locked';
    
    if (!day.date) {
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

  const getNodePosition = (index: number): 'left' | 'center' | 'right' => {
    const row = index % 3;
    if (row === 0) return 'left';
    if (row === 1) return 'center';
    return 'right';
  };

  const completedCount = roadmapDays?.filter(d => getDayStatus(d) === 'completed').length || 0;
  const currentIndex = roadmapDays?.findIndex(d => getDayStatus(d) === 'current') ?? -1;
  const totalCount = roadmapDays?.length || 0;

  const nodeStatuses = useMemo(() => 
    roadmapDays?.map(getDayStatus) || [], 
    [roadmapDays]
  );

  // Track container width and scroll progress
  useEffect(() => {
    const updateWidth = () => {
      if (timelineRef.current) {
        setContainerWidth(timelineRef.current.offsetWidth);
      }
    };
    
    const handleScroll = () => {
      if (!timelineRef.current) return;
      
      const rect = timelineRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const containerTop = rect.top;
      const containerBottom = rect.bottom;
      
      // Progress: 0 when timeline top enters viewport, 1 when timeline bottom reaches viewport bottom
      const scrollableDistance = rect.height - windowHeight * 0.3;
      const scrolled = windowHeight * 0.7 - containerTop;
      
      const progress = scrolled / scrollableDistance;
      setScrollProgress(Math.max(0, Math.min(1, progress)));
    };
    
    updateWidth();
    handleScroll();
    
    window.addEventListener('resize', updateWidth);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('resize', updateWidth);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="container py-6 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-accent animate-pulse" />
          </div>
          <p className="text-muted-foreground text-sm">Loading your journey...</p>
        </div>
      </div>
    );
  }

  if (!profile?.edition_id) {
    return (
      <div className="container py-6">
        <div className="p-8 rounded-2xl glass-premium text-center">
          <Anchor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
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
          <h1 className="text-2xl font-bold text-foreground mb-2">Your {cohortName} Journey</h1>
          <p className="text-muted-foreground">Your adventure is being prepared...</p>
        </div>
        <div className="p-8 rounded-2xl glass-premium text-center">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">
            The roadmap for your edition is coming soon. Check back later!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 pb-24 max-w-2xl mx-auto">
      {/* Phase-Specific Header */}
      {forgeMode === 'PRE_FORGE' && (
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Rocket className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {daysUntilForge !== null && daysUntilForge > 0 
                ? `${daysUntilForge} days until Forge begins`
                : 'Forge is about to begin!'}
            </span>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Your {cohortName} Awaits</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Preview the incredible journey ahead. More details unlock as we get closer to launch.
          </p>
        </div>
      )}

      {forgeMode === 'DURING_FORGE' && (
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-4 animate-pulse-soft">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm font-bold text-primary">FORGE IS LIVE</span>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Your {cohortName} Journey</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Navigate through your transformative Forge experience
          </p>
        </div>
      )}

      {forgeMode === 'POST_FORGE' && (
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 mb-4">
            <Trophy className="w-4 h-4 text-accent" />
            <span className="text-sm font-bold text-accent">FORGE COMPLETE</span>
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Your {cohortName} Legacy</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            You've completed an incredible journey. Here's what you accomplished.
          </p>
        </div>
      )}

      {/* Progress Overview Card */}
      <div className="mb-10 p-6 rounded-2xl glass-premium">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-glow">
              {forgeMode === 'POST_FORGE' ? (
                <Trophy className="w-6 h-6 text-primary-foreground" />
              ) : (
                <Rocket className="w-6 h-6 text-primary-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {forgeMode === 'POST_FORGE' ? 'Journey Completed' : 'Journey Progress'}
              </p>
              <p className="text-2xl font-bold text-foreground">{completedCount} / {totalCount}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black gradient-text">
              {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
            </p>
          </div>
        </div>
        
        <div className="h-3 rounded-full bg-secondary overflow-hidden">
          <div 
            className="h-full gradient-primary rounded-full transition-all duration-700 ease-out relative"
            style={{ width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : '0%' }}
          >
            <div className="absolute inset-0 animate-shimmer" />
          </div>
        </div>
        
        {forgeMode === 'DURING_FORGE' && currentIndex >= 0 && roadmapDays[currentIndex] && (
          <div className="mt-4 pt-4 border-t border-border/30">
            <p className="text-xs text-muted-foreground mb-1">Currently on</p>
            <p className="text-sm font-semibold text-foreground">{roadmapDays[currentIndex].title}</p>
          </div>
        )}
      </div>

      {/* Serpentine Path Timeline */}
      <div ref={timelineRef} className="relative" style={{ minHeight: (totalCount - 1) * 160 + 200 }}>
        {/* SVG Smooth Path */}
        <SmoothPath
          nodeCount={totalCount}
          getNodePosition={getNodePosition}
          nodeStatuses={nodeStatuses}
          containerWidth={containerWidth}
          scrollProgress={scrollProgress}
        />

        {/* Nodes */}
        <div className="relative z-10 space-y-24 py-8">
          {roadmapDays.map((day, index) => {
            const status = getDayStatus(day);
            const position = getNodePosition(index);
            const checklist = (day.checklist as string[]) || [];
            const mentors = (day.mentors as string[]) || [];
            const keyLearnings = (day.key_learnings as string[]) || [];
            
            return (
              <div
                key={day.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <RoadmapNode
                  day={{
                    ...day,
                    checklist,
                    mentors,
                    key_learnings: keyLearnings,
                    activity_type: day.activity_type,
                    duration_hours: day.duration_hours ? Number(day.duration_hours) : null,
                    intensity_level: day.intensity_level,
                    teaser_text: day.teaser_text,
                    reveal_days_before: day.reveal_days_before,
                  }}
                  status={status}
                  position={position}
                  isFirst={index === 0}
                  isLast={index === roadmapDays.length - 1}
                  totalChecklist={checklist.length}
                  completedChecklist={status === 'completed' ? checklist.length : 0}
                  forgeMode={forgeMode}
                  forgeStartDate={forgeStartDate}
                />
              </div>
            );
          })}
        </div>

        {/* End destination marker */}
        <div className="relative flex justify-center mt-8 pt-8">
          <div className="glass-premium rounded-2xl p-5 flex items-center gap-4 shadow-glow">
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
              <Flag className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Destination</p>
              <p className="font-bold text-foreground">
                {forgeMode === 'POST_FORGE' ? 'Journey Complete!' : `${cohortName} Complete`}
              </p>
            </div>
            {forgeMode === 'POST_FORGE' && (
              <Trophy className="w-6 h-6 text-accent ml-2" />
            )}
          </div>
        </div>
      </div>

      {/* Post-Forge: What's Next Section */}
      {forgeMode === 'POST_FORGE' && (
        <div className="mt-16 space-y-6">
          <h2 className="text-xl font-bold text-foreground text-center mb-6">What's Next?</h2>
          
          <div className="grid gap-4">
            <div className="glass-card-hover rounded-xl p-5 flex items-center gap-4 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Join the Alumni Network</h3>
                <p className="text-sm text-muted-foreground">Connect with fellow Forge graduates</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="glass-card-hover rounded-xl p-5 flex items-center gap-4 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Gift className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Exclusive Alumni Perks</h3>
                <p className="text-sm text-muted-foreground">Unlock special benefits and discounts</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="glass-card-hover rounded-xl p-5 flex items-center gap-4 cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <Rocket className="w-6 h-6 text-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Upcoming Events</h3>
                <p className="text-sm text-muted-foreground">Stay connected with the community</p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        </div>
      )}

      {/* Pre-Forge Note */}
      {forgeMode === 'PRE_FORGE' && (
        <div className="mt-12">
          <div className="p-5 rounded-xl gradient-subtle border border-primary/20 text-center">
            <Sparkles className="w-6 h-6 text-primary mx-auto mb-3" />
            <p className="text-sm text-foreground font-medium mb-1">
              The countdown has begun
            </p>
            <p className="text-xs text-muted-foreground">
              More details will reveal as we approach launch. Stay tuned!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roadmap;
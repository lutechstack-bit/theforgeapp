import React, { useRef, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Flag, Anchor, Sparkles, Trophy } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';
import RoadmapNode from '@/components/roadmap/RoadmapNode';

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

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;
      
      const rect = timelineRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const scrolled = viewportHeight - rect.top;
      const totalScrollable = rect.height + viewportHeight;
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

  const nodeStatuses = roadmapDays.map(getDayStatus);

  return (
    <div className="container py-6 pb-24">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold gradient-text mb-2">Your {cohortName} Journey</h1>
        <p className="text-muted-foreground">
          {isDuringForge 
            ? 'Navigate through your Forge experience'
            : 'Preview your path to mastery'}
        </p>
      </div>

      {/* Progress Overview Card */}
      <div className="mb-10 p-6 rounded-2xl glass-premium max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-glow">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Journey Progress</p>
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
        
        {currentIndex >= 0 && roadmapDays[currentIndex] && (
          <div className="mt-4 pt-4 border-t border-border/30">
            <p className="text-xs text-muted-foreground mb-1">Currently on</p>
            <p className="text-sm font-semibold text-foreground">{roadmapDays[currentIndex].title}</p>
          </div>
        )}
      </div>

      {/* Serpentine Path Timeline */}
      <div ref={timelineRef} className="relative max-w-lg mx-auto">
        {/* SVG Path Connections */}
        <svg 
          className="absolute left-0 top-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <defs>
            <linearGradient id="pathGradientVertical" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
              <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.7" />
            </linearGradient>
            <filter id="glowPath">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {roadmapDays.map((_, index) => {
            if (index === roadmapDays.length - 1) return null;
            
            const currentPos = getNodePosition(index);
            const nextPos = getNodePosition(index + 1);
            const status = nodeStatuses[index];
            const nextStatus = nodeStatuses[index + 1];
            const isCompleted = status === 'completed' || (status === 'current' && nextStatus !== 'locked');
            
            // Calculate positions
            const getXPosition = (pos: string) => {
              if (pos === 'left') return '20%';
              if (pos === 'right') return '80%';
              return '50%';
            };
            
            const y1 = index * 140 + 70;
            const y2 = (index + 1) * 140 + 30;
            const x1 = getXPosition(currentPos);
            const x2 = getXPosition(nextPos);
            
            return (
              <g key={index}>
                {/* Background dotted line */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="hsl(var(--border))"
                  strokeWidth="3"
                  strokeDasharray="6 12"
                  strokeLinecap="round"
                  opacity="0.4"
                />
                
                {/* Active line */}
                {isCompleted && (
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="url(#pathGradientVertical)"
                    strokeWidth="3"
                    strokeDasharray="6 12"
                    strokeLinecap="round"
                    filter="url(#glowPath)"
                    className="animate-fade-in"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        <div className="relative z-10 space-y-20 py-8">
          {roadmapDays.map((day, index) => {
            const status = getDayStatus(day);
            const position = getNodePosition(index);
            const checklist = (day.checklist as string[]) || [];
            
            return (
              <div
                key={day.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <RoadmapNode
                  day={day}
                  status={status}
                  position={position}
                  isFirst={index === 0}
                  isLast={index === roadmapDays.length - 1}
                  totalChecklist={checklist.length}
                  completedChecklist={status === 'completed' ? checklist.length : 0}
                />
              </div>
            );
          })}
        </div>

        {/* End destination marker */}
        <div className="relative flex justify-center mt-8">
          <div className="glass-premium rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <Flag className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Destination</p>
              <p className="font-semibold text-foreground">Forge Complete</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pre-Forge Note */}
      {!isDuringForge && (
        <div className="mt-12 max-w-md mx-auto">
          <div className="p-4 rounded-xl bg-secondary/30 border border-border/30 text-center">
            <Sparkles className="w-5 h-5 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              More details will unlock as your journey progresses
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roadmap;
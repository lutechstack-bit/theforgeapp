import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map as MapIcon, ChevronRight, RefreshCw, AlertCircle } from 'lucide-react';
import { useRoadmapData } from '@/hooks/useRoadmapData';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import JourneyCard, { type JourneyCardDay } from '@/components/roadmap/JourneyCard';
import { TimelineNode } from '@/components/roadmap/TimelineSpine';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Maximum time to show skeleton before showing retry UI
const JOURNEY_LOADING_TIMEOUT_MS = 15000;

const HomeJourneySection: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile, userDataLoading, userDataTimedOut, userDataError, retryUserData } = useAuth();
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  
  const {
    roadmapDays,
    isLoadingDays,
    isErrorDays,
    daysError,
    getDayStatus,
    forgeMode,
    forgeStartDate,
    userCohortType,
  } = useRoadmapData();

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  // Timer to prevent infinite skeleton
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    // Only start timer if we're loading roadmap (not user data)
    if (isLoadingDays && !userDataLoading) {
      timer = setTimeout(() => {
        console.warn('[Journey] Loading timed out after', JOURNEY_LOADING_TIMEOUT_MS, 'ms');
        setLoadingTimedOut(true);
      }, JOURNEY_LOADING_TIMEOUT_MS);
    } else {
      // Reset timeout if loading completes
      setLoadingTimedOut(false);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoadingDays, userDataLoading]);

  const handleRetryJourney = () => {
    setLoadingTimedOut(false);
    queryClient.invalidateQueries({ queryKey: ['roadmap-days'] });
  };

  const getJourneyType = () => {
    switch (userCohortType) {
      case 'FORGE':
        return 'Filmmaking';
      case 'FORGE_CREATORS':
        return 'Creating';
      case 'FORGE_WRITING':
        return 'Writing';
      default:
        return 'Forge';
    }
  };

  const displayDays = useMemo(() => {
    if (!roadmapDays || roadmapDays.length === 0) return [];
    
    const currentIndex = roadmapDays.findIndex(d => {
      const status = getDayStatus(d);
      return status === 'current' || status === 'upcoming';
    });

    const startIndex = currentIndex >= 0 ? Math.max(0, currentIndex - 1) : 0;
    return roadmapDays.slice(startIndex, startIndex + 4);
  }, [roadmapDays, getDayStatus]);

  // Priority 1: Show skeleton while user data is loading
  if (userDataLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  // Priority 2: User data fetch timed out or errored - show actionable error
  if (userDataTimedOut || userDataError) {
    return (
      <section className="space-y-4">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-foreground">
            Hi {firstName}
          </h1>
          <p className="text-muted-foreground">Let's get you connected</p>
        </div>
        <div className="glass-premium rounded-xl p-6 text-center border border-destructive/20">
          <AlertCircle className="h-8 w-8 text-destructive/70 mx-auto mb-3" />
          <p className="text-sm text-foreground font-medium mb-2">
            Couldn't load your profile data
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            {userDataError?.message || 'The request timed out. Please check your connection.'}
          </p>
          <Button 
            onClick={retryUserData} 
            size="sm" 
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </section>
    );
  }

  // Priority 3: Journey loading timed out - show retry UI instead of infinite skeleton
  if (loadingTimedOut || (isLoadingDays && !userDataLoading && loadingTimedOut)) {
    return (
      <section className="space-y-4">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-foreground">
            Hi {firstName}
          </h1>
          <p className="text-muted-foreground">Your journey is loading</p>
        </div>
        <div className="glass-premium rounded-xl p-6 text-center border border-amber-500/20">
          <AlertCircle className="h-8 w-8 text-amber-500/70 mx-auto mb-3" />
          <p className="text-sm text-foreground font-medium mb-2">
            Taking longer than expected
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Your journey data is still loading. This could be due to a slow connection.
          </p>
          <Button 
            onClick={handleRetryJourney} 
            size="sm" 
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </section>
    );
  }

  // Priority 4: Still loading roadmap days - show skeleton (with timer active)
  if (isLoadingDays) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  // Priority 5: Roadmap query errored (not timeout from user data)
  if (isErrorDays) {
    return (
      <section className="space-y-4">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-foreground">
            Hi {firstName}
          </h1>
          <p className="text-muted-foreground">Your journey is being prepared</p>
        </div>
        <div className="glass-premium rounded-xl p-6 text-center border border-destructive/20">
          <AlertCircle className="h-8 w-8 text-destructive/70 mx-auto mb-3" />
          <p className="text-sm text-foreground font-medium mb-2">
            Couldn't load your journey
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            {daysError?.message || 'There was an error loading your roadmap. Please try again.'}
          </p>
          <Button 
            onClick={handleRetryJourney} 
            size="sm" 
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </section>
    );
  }

  // Priority 6: Profile loaded but no edition assigned
  if (profile && !profile.edition_id) {
    return (
      <section className="space-y-4">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-foreground">
            Hi {firstName}
          </h1>
          <p className="text-muted-foreground">Your journey is being prepared</p>
        </div>
        <div className="glass-premium rounded-xl p-6 text-center">
          <MapIcon className="h-8 w-8 text-primary/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Your journey will appear here once your cohort is assigned.
          </p>
        </div>
      </section>
    );
  }

  // Priority 7: Edition assigned but no roadmap days configured (admin issue)
  if (!roadmapDays || roadmapDays.length === 0) {
    return (
      <section className="space-y-4">
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-foreground">
            Hi {firstName}
          </h1>
          <p className="text-muted-foreground">Your journey is being prepared</p>
        </div>
        <div className="glass-premium rounded-xl p-6 text-center">
          <MapIcon className="h-8 w-8 text-primary/50 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Your journey is being configured. Check back soon!
          </p>
        </div>
      </section>
    );
  }

  // Success: Show the journey
  return (
    <section className="space-y-6">
      {/* Personalized Welcome */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">
          Hi {firstName}
        </h1>
        <p className="text-muted-foreground">
          Your {getJourneyType()} Journey Starts Here
        </p>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/15 border border-primary/20">
            <MapIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground border-l-3 border-primary pl-3">Your Journey</h2>
            <p className="text-xs text-muted-foreground pl-3">Day by day through the Forge</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/roadmap')}
          className="text-primary hover:text-primary hover:bg-primary/10"
        >
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Timeline Preview */}
      <div className="relative">
        <div className="space-y-0">
          {displayDays.map((day, index) => {
            const status = getDayStatus(day);
            const prevStatus = index > 0 ? getDayStatus(displayDays[index - 1]) : undefined;
            const isFirst = index === 0;
            const isLast = index === displayDays.length - 1;

            const cardDay: JourneyCardDay = {
              id: day.id,
              day_number: day.day_number,
              title: day.title,
              description: day.description,
              date: day.date,
              location: day.location,
              call_time: day.call_time,
              checklist: (day.checklist as string[]) || [],
              mentors: (day.mentors as string[]) || [],
              key_learnings: (day.key_learnings as string[]) || [],
              activity_type: day.activity_type,
              duration_hours: day.duration_hours ? Number(day.duration_hours) : undefined,
              intensity_level: day.intensity_level,
              teaser_text: day.teaser_text,
              reveal_days_before: day.reveal_days_before,
              theme_name: day.theme_name,
              objective: day.objective,
              schedule: Array.isArray(day.schedule) 
                ? (day.schedule as { time: string; activity: string; icon?: string }[]) 
                : [],
              location_image_url: day.location_image_url,
              milestone_type: day.milestone_type,
            };

            return (
              <div 
                key={day.id} 
                className="flex items-stretch animate-slide-up" 
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Timeline Node */}
                <div className="flex-shrink-0 flex flex-col items-center w-6 mr-3">
                  <TimelineNode 
                    status={status} 
                    isFirst={isFirst} 
                    isLast={isLast}
                    prevStatus={prevStatus}
                    forgeMode={forgeMode}
                    isHighlighted={status === 'current'}
                  />
                </div>

                {/* Card */}
                <div className="flex-1 pb-3">
                  <JourneyCard
                    day={cardDay}
                    status={status}
                    forgeMode={forgeMode}
                    forgeStartDate={forgeStartDate}
                    cohortType={userCohortType}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* View More Link */}
        {roadmapDays.length > 4 && (
          <div 
            className="flex items-center justify-center py-3 cursor-pointer group"
            onClick={() => navigate('/roadmap')}
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-primary transition-colors">
              <span>View all {roadmapDays.length} days</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HomeJourneySection;

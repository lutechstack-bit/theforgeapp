import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Map as MapIcon, ChevronRight } from 'lucide-react';
import { useRoadmapData } from '@/hooks/useRoadmapData';
import { useAuth } from '@/contexts/AuthContext';
import JourneyCard, { type JourneyCardDay } from '@/components/roadmap/JourneyCard';
import { TimelineNode } from '@/components/roadmap/TimelineSpine';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const HomeJourneySection: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const {
    roadmapDays,
    isLoadingDays,
    getDayStatus,
    forgeMode,
    forgeStartDate,
    userCohortType,
  } = useRoadmapData();

  // Get user's first name
  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  // Get cohort-specific journey type
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

  // Get first 4 days to show (prioritize current/upcoming)
  const displayDays = useMemo(() => {
    if (!roadmapDays || roadmapDays.length === 0) return [];
    
    // Find index of first upcoming or current day
    const currentIndex = roadmapDays.findIndex(d => {
      const status = getDayStatus(d);
      return status === 'current' || status === 'upcoming';
    });

    // Show 3-4 days starting from current, or first days if pre-forge
    const startIndex = currentIndex >= 0 ? Math.max(0, currentIndex - 1) : 0;
    return roadmapDays.slice(startIndex, startIndex + 4);
  }, [roadmapDays, getDayStatus]);

  // Show skeleton only during actual loading
  if (isLoadingDays) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  // Show empty state if no roadmap data (either missing edition or no days configured)
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
            Your journey will appear here once your cohort is assigned.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {/* Personalized Welcome */}
      <div className="mb-2">
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
          <div className="p-2 rounded-lg bg-primary/10">
            <MapIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Your Journey</h2>
            <p className="text-xs text-muted-foreground">Day by day through the Forge</p>
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

            // Transform day data to match JourneyCard interface
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

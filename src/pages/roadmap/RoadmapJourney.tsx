import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Map as MapIcon, Flag, Trophy } from 'lucide-react';
import { useRoadmapData } from '@/hooks/useRoadmapData';
import JourneyCard, { type JourneyCardDay } from '@/components/roadmap/JourneyCard';
import JourneyStats from '@/components/roadmap/JourneyStats';
import { TimelineNode } from '@/components/roadmap/TimelineSpine';

const RoadmapJourney: React.FC = () => {
  const [hoveredDayId, setHoveredDayId] = useState<string | null>(null);
  const [scrollActiveDayId, setScrollActiveDayId] = useState<string | null>(null);
  const cardRefs = useRef<globalThis.Map<string, HTMLDivElement>>(new globalThis.Map());
  
  const {
    roadmapDays,
    getDayStatus,
    nodeStatuses,
    totalCount,
    completedCount,
    currentDayNumber,
    forgeMode,
    forgeStartDate,
    userCohortType,
    cohortName,
    edition,
  } = useRoadmapData();

  // Get next day date for countdown
  const nextDayDate = useMemo(() => {
    if (!roadmapDays) return null;
    const upcomingDay = roadmapDays.find(d => getDayStatus(d) === 'upcoming');
    return upcomingDay?.date ? new Date(upcomingDay.date) : null;
  }, [roadmapDays, getDayStatus]);

  const forgeEndDate = edition?.forge_end_date ? new Date(edition.forge_end_date) : null;

  // Intersection Observer for scroll-based highlighting
  useEffect(() => {
    if (!roadmapDays) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const dayId = entry.target.getAttribute('data-day-id');
            if (dayId) {
              setScrollActiveDayId(dayId);
            }
          }
        });
      },
      { threshold: 0.5, rootMargin: '-20% 0px -20% 0px' }
    );

    cardRefs.current.forEach((element) => {
      observer.observe(element);
    });

    return () => observer.disconnect();
  }, [roadmapDays]);

  // Early return if no data - parent RoadmapLayout handles the empty state message
  if (!roadmapDays || roadmapDays.length === 0) return null;

  // Determine which day is currently highlighted (hover takes priority)
  const getHighlightedId = () => hoveredDayId || scrollActiveDayId;

  return (
    <section className="py-4">
      {/* Stats Bar */}
      <JourneyStats
        cohortName={cohortName}
        cohortType={userCohortType}
        forgeMode={forgeMode}
        forgeStartDate={forgeStartDate}
        forgeEndDate={forgeEndDate}
        completedCount={completedCount}
        totalCount={totalCount}
        currentDayNumber={currentDayNumber}
        nextDayDate={nextDayDate}
      />

      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <MapIcon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Your Journey</h2>
          <p className="text-sm text-muted-foreground">Day by day through the Forge</p>
        </div>
      </div>

      {/* Timeline with Cards */}
      <div className="relative">
        <div className="space-y-0">
          {roadmapDays.map((day, index) => {
            const status = getDayStatus(day);
            const prevStatus = index > 0 ? getDayStatus(roadmapDays[index - 1]) : undefined;
            const isFirst = index === 0;
            const isLast = index === roadmapDays.length - 1;

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

              const isHighlighted = getHighlightedId() === day.id;

              return (
                <div 
                  key={day.id} 
                  ref={(el) => {
                    if (el) cardRefs.current.set(day.id, el);
                  }}
                  data-day-id={day.id}
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
                      isHighlighted={isHighlighted}
                    />
                  </div>

                  {/* Card */}
                  <div className="flex-1 pb-4">
                    <JourneyCard
                      day={cardDay}
                      status={status}
                      forgeMode={forgeMode}
                      forgeStartDate={forgeStartDate}
                      cohortType={userCohortType}
                      onHover={(isHovered) => setHoveredDayId(isHovered ? day.id : null)}
                    />
                  </div>
                </div>
              );
          })}
        </div>

        {/* End Flag */}
        <div className="flex items-center gap-3 mt-4 ml-9">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center
            ${forgeMode === 'POST_FORGE' 
              ? 'gradient-primary shadow-glow' 
              : forgeMode === 'DURING_FORGE'
              ? 'bg-card border-2 border-primary/30'
              : 'bg-card/50 border-2 border-muted/30'
            }
          `}>
            {forgeMode === 'POST_FORGE' ? (
              <Trophy className="w-5 h-5 text-primary-foreground" />
            ) : (
              <Flag className={`w-5 h-5 ${forgeMode === 'PRE_FORGE' ? 'text-muted-foreground' : 'text-primary/50'}`} />
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              {forgeMode === 'POST_FORGE' ? 'Achievement' : 'Destination'}
            </p>
            <p className={`font-bold text-sm ${forgeMode === 'PRE_FORGE' ? 'text-muted-foreground' : 'text-foreground'}`}>
              {forgeMode === 'POST_FORGE' ? 'Journey Complete! 🎉' : `${cohortName} Complete`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoadmapJourney;

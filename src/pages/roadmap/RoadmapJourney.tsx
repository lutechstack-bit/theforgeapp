import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Map, Flag } from 'lucide-react';
import { useRoadmapData } from '@/hooks/useRoadmapData';
import EnhancedRoadmapNode from '@/components/roadmap/EnhancedRoadmapNode';
import EnhancedSmoothPath from '@/components/roadmap/EnhancedSmoothPath';

const RoadmapJourney: React.FC = () => {
  const {
    roadmapDays,
    getDayStatus,
    getNodePosition,
    nodeStatuses,
    totalCount,
    forgeMode,
    forgeStartDate,
    userCohortType,
    cohortName,
  } = useRoadmapData();

  const timelineRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(400);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      if (timelineRef.current) setContainerWidth(timelineRef.current.offsetWidth);
    };
    const handleScroll = () => {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const startThreshold = windowHeight * 0.8;
      const endThreshold = windowHeight * 0.2;
      const totalScrollableDistance = rect.height + (startThreshold - endThreshold);
      const scrolled = startThreshold - rect.top;
      setScrollProgress(Math.max(0, Math.min(1, scrolled / totalScrollableDistance)));
    };
    updateWidth();
    setTimeout(handleScroll, 100);
    window.addEventListener('resize', updateWidth);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('resize', updateWidth);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [roadmapDays]);

  if (!roadmapDays) return null;

  return (
    <section className="py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Map className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Your Journey</h2>
          <p className="text-sm text-muted-foreground">Day by day through the Forge</p>
        </div>
      </div>

      <div ref={timelineRef} className="relative" style={{ minHeight: (totalCount - 1) * 160 + 140 }}>
        <EnhancedSmoothPath
          nodeCount={totalCount}
          getNodePosition={getNodePosition}
          nodeStatuses={nodeStatuses}
          containerWidth={containerWidth}
          scrollProgress={scrollProgress}
        />
        <div className="relative z-10 space-y-16 py-8 px-2">
          {roadmapDays.map((day, index) => (
            <div key={day.id} className="animate-slide-up" style={{ animationDelay: `${index * 0.08}s` }}>
              <EnhancedRoadmapNode
                day={{
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
                  schedule: Array.isArray(day.schedule) ? day.schedule as { time: string; activity: string; icon?: string }[] : [],
                  location_image_url: (day as any).location_image_url,
                  milestone_type: (day as any).milestone_type,
                }}
                status={getDayStatus(day)}
                position={getNodePosition(index)}
                isFirst={index === 0}
                isLast={index === roadmapDays.length - 1}
                forgeMode={forgeMode}
                forgeStartDate={forgeStartDate}
                cohortType={userCohortType}
              />
            </div>
          ))}
        </div>
        <div className="relative flex justify-center mt-6 pt-6">
          <div className="glass-premium rounded-2xl p-4 flex items-center gap-3 shadow-glow">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <Flag className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Destination</p>
              <p className="font-bold text-foreground text-sm">{cohortName} Complete</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoadmapJourney;

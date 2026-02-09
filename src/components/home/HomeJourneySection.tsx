import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { useRoadmapData } from '@/hooks/useRoadmapData';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import DatePillSelector from './DatePillSelector';
import SessionDetailCard from './SessionDetailCard';
import DayDetailModal from '@/components/roadmap/DayDetailModal';
import type { JourneyCardDay } from '@/components/roadmap/JourneyCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const JOURNEY_LOADING_TIMEOUT_MS = 15000;

interface HomeJourneySectionProps {
  title?: string;
  subtitle?: string;
}

const HomeJourneySection: React.FC<HomeJourneySectionProps> = ({
  title = 'Your Forge Journey',
  subtitle,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile, userDataLoading, userDataTimedOut, userDataError, retryUserData } = useAuth();
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const {
    roadmapDays,
    isLoadingDays,
    isErrorDays,
    getDayStatus,
    forgeMode,
    userCohortType,
  } = useRoadmapData();

  // Timer to prevent infinite skeleton
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isLoadingDays && !userDataLoading) {
      timer = setTimeout(() => setLoadingTimedOut(true), JOURNEY_LOADING_TIMEOUT_MS);
    } else {
      setLoadingTimedOut(false);
    }
    return () => { if (timer) clearTimeout(timer); };
  }, [isLoadingDays, userDataLoading]);

  const handleRetryJourney = () => {
    setLoadingTimedOut(false);
    queryClient.invalidateQueries({ queryKey: ['roadmap-days'] });
  };

  // Split days into online sessions and bootcamp
  const { onlineSessions, bootcampDays, onlineCount, bootcampCount } = useMemo(() => {
    if (!roadmapDays || roadmapDays.length === 0) {
      return { onlineSessions: [], bootcampDays: [], onlineCount: 0, bootcampCount: 0 };
    }
    const online = roadmapDays.filter(d => d.day_number < 0 || (d as any).is_virtual);
    const bootcamp = roadmapDays.filter(d => d.day_number > 0 && !(d as any).is_virtual);
    return { onlineSessions: online, bootcampDays: bootcamp, onlineCount: online.length, bootcampCount: bootcamp.length };
  }, [roadmapDays]);

  // Auto-select current day
  useEffect(() => {
    if (!roadmapDays || selectedDayId) return;
    const currentDay = roadmapDays.find(d => getDayStatus(d) === 'current');
    if (currentDay) setSelectedDayId(currentDay.id);
    else if (roadmapDays.length > 0) setSelectedDayId(roadmapDays[0].id);
  }, [roadmapDays, getDayStatus, selectedDayId]);

  const selectedDay = useMemo(() => {
    if (!roadmapDays || !selectedDayId) return null;
    return roadmapDays.find(d => d.id === selectedDayId) || null;
  }, [roadmapDays, selectedDayId]);

  // Build pill data
  const onlinePills = useMemo(() => {
    return onlineSessions.map(day => {
      const date = day.date ? new Date(day.date) : null;
      return {
        id: day.id, date, dayNumber: day.day_number,
        label: date ? format(date, 'd') : `S${Math.abs(day.day_number)}`,
        subLabel: date ? format(date, 'EEE') : undefined,
        status: getDayStatus(day),
      };
    });
  }, [onlineSessions, getDayStatus]);

  const bootcampPills = useMemo(() => {
    return bootcampDays.map(day => {
      const date = day.date ? new Date(day.date) : null;
      return {
        id: day.id, date, dayNumber: day.day_number,
        label: date ? format(date, 'd') : String(day.day_number),
        subLabel: `Day ${day.day_number}`,
        status: getDayStatus(day),
      };
    });
  }, [bootcampDays, getDayStatus]);

  // Date ranges
  const getDateRange = (days: typeof roadmapDays) => {
    if (!days || days.length === 0) return '';
    const first = days[0].date ? new Date(days[0].date) : null;
    const last = days[days.length - 1].date ? new Date(days[days.length - 1].date!) : null;
    if (first && last) return `${format(first, 'MMM d')} - ${format(last, 'MMM d')}`;
    return '';
  };
  const onlineDateRange = useMemo(() => getDateRange(onlineSessions), [onlineSessions]);
  const bootcampDateRange = useMemo(() => getDateRange(bootcampDays), [bootcampDays]);

  // Convert selected day for detail card
  const selectedCardDay: JourneyCardDay | null = useMemo(() => {
    if (!selectedDay) return null;
    return {
      id: selectedDay.id, day_number: selectedDay.day_number, title: selectedDay.title,
      description: selectedDay.description, date: selectedDay.date, location: selectedDay.location,
      call_time: selectedDay.call_time, checklist: (selectedDay.checklist as string[]) || [],
      mentors: (selectedDay.mentors as string[]) || [], key_learnings: (selectedDay.key_learnings as string[]) || [],
      activity_type: selectedDay.activity_type,
      duration_hours: selectedDay.duration_hours ? Number(selectedDay.duration_hours) : undefined,
      intensity_level: selectedDay.intensity_level, teaser_text: selectedDay.teaser_text,
      reveal_days_before: selectedDay.reveal_days_before, theme_name: selectedDay.theme_name,
      objective: selectedDay.objective,
      schedule: Array.isArray(selectedDay.schedule)
        ? (selectedDay.schedule as { time: string; activity: string; icon?: string }[])
        : [],
      location_image_url: selectedDay.location_image_url, milestone_type: selectedDay.milestone_type,
      is_virtual: (selectedDay as any).is_virtual, meeting_url: (selectedDay as any).meeting_url,
      meeting_id: (selectedDay as any).meeting_id, meeting_passcode: (selectedDay as any).meeting_passcode,
      session_start_time: (selectedDay as any).session_start_time,
      session_duration_hours: (selectedDay as any).session_duration_hours,
    };
  }, [selectedDay]);

  // Loading / error states
  if (userDataLoading || isLoadingDays) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-5 w-48" />
        <div className="flex gap-2">
          {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-16 w-14 rounded-lg" />)}
        </div>
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (userDataTimedOut || userDataError) {
    return (
      <div className="rounded-2xl p-6 text-center border border-destructive/20 bg-card/50">
        <AlertCircle className="h-8 w-8 text-destructive/70 mx-auto mb-3" />
        <p className="text-sm text-foreground font-medium mb-2">Couldn't load your profile data</p>
        <p className="text-xs text-muted-foreground mb-4">{userDataError?.message || 'The request timed out.'}</p>
        <Button onClick={retryUserData} size="sm" className="gap-2"><RefreshCw className="h-4 w-4" /> Try Again</Button>
      </div>
    );
  }

  if (loadingTimedOut || isErrorDays) {
    return (
      <div className="rounded-2xl p-6 text-center border border-border/30 bg-card/50">
        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm text-foreground font-medium mb-2">{loadingTimedOut ? 'Taking longer than expected' : "Couldn't load your journey"}</p>
        <Button onClick={handleRetryJourney} size="sm" variant="outline" className="gap-2"><RefreshCw className="h-4 w-4" /> Retry</Button>
      </div>
    );
  }

  if ((profile && !profile.edition_id) || !roadmapDays || roadmapDays.length === 0) {
    return (
      <div className="rounded-2xl p-8 text-center bg-card/50 border border-border/20">
        <Camera className="h-8 w-8 text-primary/50 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          {profile && !profile.edition_id
            ? 'Your journey will appear here once your cohort is assigned.'
            : 'Your journey is being configured. Check back soon!'}
        </p>
      </div>
    );
  }

  // Dynamic subtitle
  const journeySubtitle = subtitle || (() => {
    const parts: string[] = [];
    if (onlineCount > 0) parts.push(`${onlineCount} online session${onlineCount > 1 ? 's' : ''}`);
    if (bootcampCount > 0) parts.push(`${bootcampCount} days in Goa`);
    return parts.join(' + ');
  })();

  return (
    <section className="space-y-6">
      {/* Header — clean, no icon box, no left border */}
      <div>
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
        {journeySubtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{journeySubtitle}</p>
        )}
      </div>

      {/* Online Sessions */}
      {onlineSessions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Online Sessions</span>
            {onlineDateRange && (
              <span className="text-xs text-muted-foreground ml-auto">{onlineDateRange}</span>
            )}
          </div>
          <DatePillSelector pills={onlinePills} selectedId={selectedDayId} onSelect={setSelectedDayId} />
        </div>
      )}

      {/* Goa Bootcamp */}
      {bootcampDays.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Goa Bootcamp</span>
            {bootcampDateRange && (
              <span className="text-xs text-muted-foreground ml-auto">{bootcampDateRange}</span>
            )}
          </div>
          <DatePillSelector pills={bootcampPills} selectedId={selectedDayId} onSelect={setSelectedDayId} />
        </div>
      )}

      {/* Selected Day Detail */}
      {selectedCardDay && selectedDay && (
        <SessionDetailCard
          day={selectedCardDay}
          status={getDayStatus(selectedDay)}
          onViewDetail={() => setIsDetailModalOpen(true)}
        />
      )}

      {/* Day Detail Modal */}
      {selectedCardDay && selectedDay && (
        <DayDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          day={selectedCardDay}
          status={getDayStatus(selectedDay)}
          cohortType={userCohortType as any}
          forgeMode={forgeMode}
        />
      )}
    </section>
  );
};

export default HomeJourneySection;

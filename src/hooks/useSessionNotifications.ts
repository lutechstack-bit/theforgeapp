import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminTestingSafe } from '@/contexts/AdminTestingContext';
import { useRoadmapData } from '@/hooks/useRoadmapData';
import { differenceInMinutes, parse, isToday, addMinutes } from 'date-fns';

export interface SessionNotification {
  id: string;
  dayNumber: number;
  title: string;
  sessionDate: Date;
  sessionStartTime: string | null;
  sessionDurationHours: number | null;
  meetingUrl: string;
  meetingId: string | null;
  meetingPasscode: string | null;
  minutesUntilStart: number;
  status: 'upcoming' | 'starting_soon' | 'live' | 'ended';
}

export const useSessionNotifications = () => {
  const { forgeMode, edition } = useAuth();
  const { isTestingMode, simulatedForgeMode, simulatedDayNumber } = useAdminTestingSafe();
  const { roadmapDays, getDayStatus } = useRoadmapData();

  const effectiveForgeMode = isTestingMode && simulatedForgeMode ? simulatedForgeMode : forgeMode;
  const cohortType = edition?.cohort_type;

  const sessionNotifications = useMemo(() => {
    // Only show notifications during DURING_FORGE mode
    if (effectiveForgeMode !== 'DURING_FORGE') {
      return [];
    }

    // FORGE_WRITING cohort has no online sessions - skip virtual session tracking
    if (cohortType === 'FORGE_WRITING') {
      return [];
    }

    if (!roadmapDays?.length) return [];

    const notifications: SessionNotification[] = [];
    const now = new Date();

    // Find virtual sessions that are current or upcoming
    const virtualDays = roadmapDays.filter(day => {
      // Check if day has virtual meeting info
      const dayData = day as any;
      if (!dayData.is_virtual || !dayData.meeting_url) return false;

      const status = getDayStatus(day);
      return status === 'current' || status === 'upcoming';
    });

    virtualDays.forEach(day => {
      const dayData = day as any;
      if (!dayData.date) return;

      const sessionDate = new Date(dayData.date);
      
      // Skip if session date is not today or in the future
      if (sessionDate < now && !isToday(sessionDate)) return;

      // Calculate minutes until session
      let minutesUntilStart = 0;
      let sessionStartDateTime = sessionDate;

      if (dayData.session_start_time) {
        // Parse the time and combine with date
        const [hours, minutes] = dayData.session_start_time.split(':').map(Number);
        sessionStartDateTime = new Date(sessionDate);
        sessionStartDateTime.setHours(hours, minutes, 0, 0);
        minutesUntilStart = differenceInMinutes(sessionStartDateTime, now);
      } else {
        // Default to 10 AM if no time specified
        sessionStartDateTime = new Date(sessionDate);
        sessionStartDateTime.setHours(10, 0, 0, 0);
        minutesUntilStart = differenceInMinutes(sessionStartDateTime, now);
      }

      // Calculate session end time
      const durationHours = dayData.session_duration_hours || 2;
      const sessionEndDateTime = addMinutes(sessionStartDateTime, durationHours * 60);
      const minutesSinceEnd = differenceInMinutes(now, sessionEndDateTime);

      // Determine status
      let status: SessionNotification['status'] = 'upcoming';
      if (minutesSinceEnd > 0) {
        status = 'ended';
      } else if (minutesUntilStart <= 0) {
        status = 'live';
      } else if (minutesUntilStart <= 30) {
        status = 'starting_soon';
      }

      // Only include if session hasn't ended
      if (status !== 'ended') {
        notifications.push({
          id: day.id,
          dayNumber: day.day_number,
          title: day.title,
          sessionDate: sessionStartDateTime,
          sessionStartTime: dayData.session_start_time,
          sessionDurationHours: dayData.session_duration_hours,
          meetingUrl: dayData.meeting_url,
          meetingId: dayData.meeting_id,
          meetingPasscode: dayData.meeting_passcode,
          minutesUntilStart,
          status,
        });
      }
    });

    // Sort by session start time
    return notifications.sort((a, b) => a.sessionDate.getTime() - b.sessionDate.getTime());
  }, [roadmapDays, effectiveForgeMode, getDayStatus, cohortType]);

  // Get the most urgent notification (live or starting soon)
  const urgentNotification = useMemo(() => {
    const liveSession = sessionNotifications.find(n => n.status === 'live');
    if (liveSession) return liveSession;

    const startingSoon = sessionNotifications.find(n => n.status === 'starting_soon');
    return startingSoon || null;
  }, [sessionNotifications]);

  // Get today's sessions
  const todaysSessions = useMemo(() => {
    return sessionNotifications.filter(n => isToday(n.sessionDate));
  }, [sessionNotifications]);

  return {
    sessionNotifications,
    urgentNotification,
    todaysSessions,
    hasActiveSessions: sessionNotifications.length > 0,
  };
};

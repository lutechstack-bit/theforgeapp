import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { differenceInCalendarDays, startOfDay, subDays, isSameDay } from 'date-fns';

interface StreakData {
  streak: number;
  lastActivityDate: Date | null;
  isActiveToday: boolean;
}

export const useStreak = (): StreakData & { isLoading: boolean } => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['user_streak', user?.id],
    queryFn: async () => {
      if (!user?.id) return { streak: 0, lastActivityDate: null, isActiveToday: false };

      const { data, error } = await supabase
        .from('user_journey_progress')
        .select('completed_at')
        .eq('user_id', user.id)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return { streak: 0, lastActivityDate: null, isActiveToday: false };
      }

      // Group completions by date
      const completionDates = new Set<string>();
      data.forEach(item => {
        if (item.completed_at) {
          const date = startOfDay(new Date(item.completed_at));
          completionDates.add(date.toISOString());
        }
      });

      // Sort dates descending
      const sortedDates = Array.from(completionDates)
        .map(d => new Date(d))
        .sort((a, b) => b.getTime() - a.getTime());

      if (sortedDates.length === 0) {
        return { streak: 0, lastActivityDate: null, isActiveToday: false };
      }

      const today = startOfDay(new Date());
      const mostRecentActivity = sortedDates[0];
      const daysSinceLastActivity = differenceInCalendarDays(today, mostRecentActivity);

      // If last activity was more than 1 day ago, streak is broken
      if (daysSinceLastActivity > 1) {
        return { 
          streak: 0, 
          lastActivityDate: mostRecentActivity, 
          isActiveToday: false 
        };
      }

      // Calculate streak by counting consecutive days backwards
      let streak = 0;
      let currentDate = daysSinceLastActivity === 0 ? today : subDays(today, 1);

      for (const date of sortedDates) {
        if (isSameDay(date, currentDate)) {
          streak++;
          currentDate = subDays(currentDate, 1);
        } else if (date < currentDate) {
          // Gap found - streak ends here
          break;
        }
      }

      const isActiveToday = isSameDay(mostRecentActivity, today);

      return { 
        streak, 
        lastActivityDate: mostRecentActivity, 
        isActiveToday 
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    streak: data?.streak ?? 0,
    lastActivityDate: data?.lastActivityDate ?? null,
    isActiveToday: data?.isActiveToday ?? false,
    isLoading,
  };
};

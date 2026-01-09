import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

interface NightlyRitualItem {
  id: string;
  cohort_type: string;
  day_number: number;
  category: 'reflect' | 'prepare' | 'wellness';
  title: string;
  description: string | null;
  icon: string | null;
  order_index: number;
  is_required: boolean;
}

interface UserProgress {
  id: string;
  user_id: string;
  ritual_item_id: string;
  completed_at: string;
}

export const useNightlyRitual = (dayNumber: number) => {
  const { user, edition } = useAuth();
  const queryClient = useQueryClient();

  // Determine cohort type from edition
  const cohortType = edition?.cohort_type || 'FORGE';

  // Fetch ritual items for current day and cohort
  const { data: ritualItems = [], isLoading: isLoadingItems } = useQuery({
    queryKey: ['nightly_ritual_items', cohortType, dayNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nightly_ritual_items')
        .select('*')
        .eq('cohort_type', cohortType)
        .eq('day_number', dayNumber)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return (data || []) as NightlyRitualItem[];
    },
    enabled: dayNumber > 0,
  });

  // Fetch user's progress for these items
  const { data: userProgress = [], isLoading: isLoadingProgress } = useQuery({
    queryKey: ['user_nightly_progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_nightly_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return (data || []) as UserProgress[];
    },
    enabled: !!user?.id,
  });

  // Create a set of completed item IDs for quick lookup
  const completedIds = useMemo(() => {
    return new Set(userProgress.map(p => p.ritual_item_id));
  }, [userProgress]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, NightlyRitualItem[]> = {
      reflect: [],
      prepare: [],
      wellness: [],
    };

    ritualItems.forEach(item => {
      if (groups[item.category]) {
        groups[item.category].push(item);
      }
    });

    return groups;
  }, [ritualItems]);

  // Calculate progress
  const progress = useMemo(() => {
    const total = ritualItems.length;
    const completed = ritualItems.filter(item => completedIds.has(item.id)).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, percent };
  }, [ritualItems, completedIds]);

  // Toggle completion mutation
  const toggleMutation = useMutation({
    mutationFn: async (itemId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const isCompleted = completedIds.has(itemId);

      if (isCompleted) {
        // Remove progress
        const { error } = await supabase
          .from('user_nightly_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('ritual_item_id', itemId);

        if (error) throw error;
      } else {
        // Add progress
        const { error } = await supabase
          .from('user_nightly_progress')
          .insert({
            user_id: user.id,
            ritual_item_id: itemId,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_nightly_progress', user?.id] });
    },
  });

  // Calculate streak (consecutive days with 100% completion)
  const { data: streak = 0 } = useQuery({
    queryKey: ['nightly_ritual_streak', user?.id, cohortType],
    queryFn: async () => {
      if (!user?.id) return 0;

      // Get all ritual items for this cohort
      const { data: allItems, error: itemsError } = await supabase
        .from('nightly_ritual_items')
        .select('id, day_number')
        .eq('cohort_type', cohortType);

      if (itemsError) throw itemsError;

      // Get user's progress
      const { data: allProgress, error: progressError } = await supabase
        .from('user_nightly_progress')
        .select('ritual_item_id')
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      const progressSet = new Set(allProgress?.map(p => p.ritual_item_id) || []);

      // Group items by day
      const itemsByDay: Record<number, string[]> = {};
      allItems?.forEach(item => {
        if (!itemsByDay[item.day_number]) {
          itemsByDay[item.day_number] = [];
        }
        itemsByDay[item.day_number].push(item.id);
      });

      // Count consecutive days completed from current day backwards
      let streakCount = 0;
      for (let day = dayNumber; day >= 1; day--) {
        const dayItems = itemsByDay[day] || [];
        if (dayItems.length === 0) continue;

        const allCompleted = dayItems.every(id => progressSet.has(id));
        if (allCompleted) {
          streakCount++;
        } else {
          break;
        }
      }

      return streakCount;
    },
    enabled: !!user?.id && dayNumber > 0,
  });

  return {
    ritualItems,
    groupedItems,
    completedIds,
    progress,
    streak,
    isLoading: isLoadingItems || isLoadingProgress,
    toggleItem: (itemId: string) => toggleMutation.mutate(itemId),
    isToggling: toggleMutation.isPending,
  };
};

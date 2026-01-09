import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';
import type { Database } from '@/integrations/supabase/types';
import { CohortType } from '@/contexts/ThemeContext';

export type RoadmapDay = Database['public']['Tables']['roadmap_days']['Row'];

export const cohortDisplayNames: Record<CohortType, string> = {
  FORGE: 'The Forge',
  FORGE_WRITING: 'Forge Writing',
  FORGE_CREATORS: 'Forge Creators',
};

export const useRoadmapData = () => {
  const { profile, edition, forgeMode, user } = useAuth();
  const queryClient = useQueryClient();
  const userCohortType = (edition?.cohort_type as CohortType) || 'FORGE';
  const cohortName = cohortDisplayNames[userCohortType];
  const forgeStartDate = edition?.forge_start_date ? new Date(edition.forge_start_date) : null;

  // Fetch roadmap days
  const { data: roadmapDays, isLoading: isLoadingDays } = useQuery({
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

  // Fetch galleries
  const { data: galleries } = useQuery({
    queryKey: ['roadmap-galleries', profile?.edition_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roadmap_galleries')
        .select('*')
        .eq('edition_id', profile?.edition_id || '')
        .order('order_index');
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.edition_id
  });

  // Fetch student films
  const { data: studentFilms } = useQuery({
    queryKey: ['student-films', profile?.edition_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('student_films')
        .select('*')
        .order('order_index');
      if (error) throw error;
      return data;
    }
  });

  // Fetch prep checklist items
  const { data: prepItems } = useQuery({
    queryKey: ['prep-checklist-items', profile?.edition_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prep_checklist_items')
        .select('*')
        .order('order_index');
      if (error) throw error;
      return data;
    }
  });

  // Fetch user's prep progress
  const { data: userProgress } = useQuery({
    queryKey: ['user-prep-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_prep_progress')
        .select('checklist_item_id')
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const completedIds = useMemo(() => 
    new Set(userProgress?.map(p => p.checklist_item_id) || []),
    [userProgress]
  );

  // Toggle prep item completion
  const togglePrepMutation = useMutation({
    mutationFn: async ({ itemId, completed }: { itemId: string; completed: boolean }) => {
      if (!user?.id) throw new Error('Not authenticated');
      if (completed) {
        await supabase.from('user_prep_progress').insert({
          user_id: user.id,
          checklist_item_id: itemId
        });
      } else {
        await supabase.from('user_prep_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('checklist_item_id', itemId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-prep-progress'] });
    }
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

  // Calculate current day number (for nightly ritual)
  const currentDayNumber = useMemo(() => {
    const currentDay = roadmapDays?.find(d => getDayStatus(d) === 'current');
    return currentDay?.day_number || 1;
  }, [roadmapDays]);

  const completedCount = roadmapDays?.filter(d => getDayStatus(d) === 'completed').length || 0;
  const totalCount = roadmapDays?.length || 0;
  const nodeStatuses = useMemo(() => roadmapDays?.map(getDayStatus) || [], [roadmapDays]);

  // Separate galleries by type
  const stayGallery = galleries?.filter(g => g.gallery_type === 'stay_location') || [];
  const momentsGallery = galleries?.filter(g => g.gallery_type === 'forge_moment') || [];

  return {
    profile,
    edition,
    forgeMode,
    user,
    userCohortType,
    cohortName,
    forgeStartDate,
    roadmapDays,
    isLoadingDays,
    galleries,
    stayGallery,
    momentsGallery,
    studentFilms,
    prepItems,
    completedIds,
    togglePrepMutation,
    getDayStatus,
    getNodePosition,
    currentDayNumber,
    completedCount,
    totalCount,
    nodeStatuses,
  };
};

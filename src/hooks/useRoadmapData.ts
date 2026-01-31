import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminTestingSafe } from '@/contexts/AdminTestingContext';
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
  const { isTestingMode, simulatedDayNumber, simulatedForgeMode } = useAdminTestingSafe();
  const queryClient = useQueryClient();
  const userCohortType = (edition?.cohort_type as CohortType) || 'FORGE';
  const cohortName = cohortDisplayNames[userCohortType];
  const forgeStartDate = edition?.forge_start_date ? new Date(edition.forge_start_date) : null;

  // Fetch roadmap days - prioritize edition-specific, fallback to shared template
  const { data: templateDays, isLoading: isLoadingDays } = useQuery({
    queryKey: ['roadmap-days', profile?.edition_id],
    queryFn: async () => {
      // First, try to get edition-specific days
      if (profile?.edition_id) {
        const { data: editionDays, error: editionError } = await supabase
          .from('roadmap_days')
          .select('*')
          .eq('edition_id', profile.edition_id)
          .order('day_number', { ascending: true });
        
        if (!editionError && editionDays && editionDays.length > 0) {
          return editionDays as RoadmapDay[];
        }
      }
      
      // Fallback to shared template if no edition-specific days
      const { data, error } = await supabase
        .from('roadmap_days')
        .select('*')
        .is('edition_id', null)
        .order('day_number', { ascending: true });
      
      if (error) throw error;
      return data as RoadmapDay[];
    },
    enabled: !!profile?.edition_id
  });

  // Calculate dates dynamically based on forge_start_date + day_number
  const roadmapDays = useMemo(() => {
    if (!templateDays) return [];
    return templateDays.map(day => {
      let calculatedDate: string | null = null;
      if (forgeStartDate && day.day_number > 0) {
        const dayDate = new Date(forgeStartDate);
        dayDate.setDate(dayDate.getDate() + (day.day_number - 1));
        calculatedDate = dayDate.toISOString().split('T')[0];
      }
      return {
        ...day,
        date: calculatedDate
      };
    });
  }, [templateDays, forgeStartDate]);

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

  // Fetch prep checklist items filtered by cohort type
  const { data: prepItems } = useQuery({
    queryKey: ['prep-checklist-items', userCohortType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prep_checklist_items')
        .select('*')
        .eq('cohort_type', userCohortType)
        .order('order_index');
      if (error) throw error;
      return data;
    },
    enabled: !!userCohortType
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
      // Invalidate prep progress
      queryClient.invalidateQueries({ queryKey: ['user-prep-progress'] });
      // Bidirectional sync: Also invalidate journey progress so sticky notes refresh
      queryClient.invalidateQueries({ queryKey: ['user_journey_progress'] });
      queryClient.invalidateQueries({ queryKey: ['prep-checklist-items'] });
    }
  });

  const getDayStatus = (day: RoadmapDay): 'completed' | 'current' | 'upcoming' | 'locked' => {
    if (!day.is_active) return 'locked';
    
    // Admin testing mode: use simulated day number for status calculation
    if (isTestingMode && simulatedDayNumber !== null && simulatedForgeMode === 'DURING_FORGE') {
      if (day.day_number < simulatedDayNumber) return 'completed';
      if (day.day_number === simulatedDayNumber) return 'current';
      return 'upcoming';
    }
    
    // Admin testing: PRE_FORGE means all days are upcoming
    if (isTestingMode && simulatedForgeMode === 'PRE_FORGE') {
      return 'upcoming';
    }
    
    // Admin testing: POST_FORGE means all days are completed
    if (isTestingMode && simulatedForgeMode === 'POST_FORGE') {
      return 'completed';
    }
    
    // Normal calculation based on dates
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

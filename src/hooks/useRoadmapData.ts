import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminTestingSafe } from '@/contexts/AdminTestingContext';
import { useEffectiveCohort } from '@/hooks/useEffectiveCohort';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';
import type { Database } from '@/integrations/supabase/types';

 // Categories to exclude from Prep display (per plan)
 const EXCLUDED_PREP_CATEGORIES = ['mindset', 'script_prep'];

import { CohortType } from '@/contexts/ThemeContext';
import { promiseWithTimeout, isTimeoutError } from '@/lib/promiseTimeout';

export type RoadmapDay = Database['public']['Tables']['roadmap_days']['Row'];

export const cohortDisplayNames: Record<CohortType, string> = {
  FORGE: 'The Forge',
  FORGE_WRITING: 'Forge Writing',
  FORGE_CREATORS: 'Forge Creators',
};

// Timeout for roadmap queries (12 seconds)
const ROADMAP_QUERY_TIMEOUT = 12000;

export const useRoadmapData = () => {
  const { profile, edition, forgeMode, user, userDataLoading, userDataTimedOut } = useAuth();
  const { isTestingMode, simulatedDayNumber, simulatedForgeMode } = useAdminTestingSafe();
  const { effectiveCohortType, effectiveEdition, isSimulating } = useEffectiveCohort();
  const queryClient = useQueryClient();
  
  const userCohortType = effectiveCohortType;
  // Use effective edition for queries when simulating
  const editionIdForQuery = isSimulating && effectiveEdition ? effectiveEdition.id : profile?.edition_id;
  
  const cohortName = userCohortType ? cohortDisplayNames[userCohortType] : 'The Forge';
  const effectiveEd = isSimulating && effectiveEdition ? effectiveEdition : edition;
  const forgeStartDate = effectiveEd?.forge_start_date ? new Date(effectiveEd.forge_start_date) : null;
  const onlineStartDate = effectiveEd?.online_start_date ? new Date(effectiveEd.online_start_date) : null;

  // Determine if we should enable the query:
  // 1. NOT while user data is still loading (prevents caching empty results)
  // 2. NOT if user data fetch timed out (we don't know the real state)
  const profileLoaded = !userDataLoading && !userDataTimedOut;
  
  // Query is enabled only when profile loading is complete
  const queryEnabled = profileLoaded;

  // Fetch roadmap days - prioritize edition-specific, then cohort-specific, then shared template
  const { data: templateDays, isLoading: isLoadingDays, isError: isErrorDays, error: daysError } = useQuery({
    queryKey: ['roadmap-days', editionIdForQuery, userCohortType, profileLoaded],
    queryFn: async () => {
      // If profile is loaded but has no edition (and not simulating), return empty
      if (!editionIdForQuery) {
        console.log('[Roadmap] No edition_id available, returning empty days');
        return [];
      }

      // Step 1: Fetch edition-specific rows (online sessions stored per-edition)
      const editionResult = await promiseWithTimeout(
        supabase
          .from('roadmap_days')
          .select('*')
          .eq('edition_id', editionIdForQuery!)
          .order('day_number', { ascending: true })
          .then(res => res),
        ROADMAP_QUERY_TIMEOUT,
        'roadmap_days_edition'
      );
      const editionRows: RoadmapDay[] = (!editionResult.error && editionResult.data)
        ? editionResult.data as RoadmapDay[] : [];

      // If edition has bootcamp days (day_number > 0), it's fully self-contained (E14/E15 style).
      // Return edition rows exclusively — preserves old behaviour.
      if (editionRows.some(d => d.day_number > 0)) {
        console.log(`[Roadmap] Self-contained edition: ${editionRows.length} days`);
        return editionRows;
      }

      // Step 2: Fetch shared template (bootcamp days + template online sessions)
      const templateResult = userCohortType ? await promiseWithTimeout(
        supabase
          .from('roadmap_days')
          .select('*')
          .eq('cohort_type', userCohortType)
          .eq('is_template', true)
          .order('day_number', { ascending: true })
          .then(res => res),
        ROADMAP_QUERY_TIMEOUT,
        'roadmap_days_template'
      ) : null;
      const templateRows: RoadmapDay[] = (templateResult && !templateResult.error && templateResult.data)
        ? templateResult.data as RoadmapDay[] : [];

      if (templateRows.length === 0) {
        // No template exists — return whatever edition rows we have (or empty)
        console.log('[Roadmap] No template found, returning edition rows only');
        return editionRows;
      }

      if (editionRows.length > 0) {
        // Step 3: Merge — edition-specific online sessions override template online sessions
        // Bootcamp template days (day_number > 0) pass through unchanged.
        const editionDayNumbers = new Set(editionRows.map(d => d.day_number));
        const merged = [
          ...templateRows.filter(d => !editionDayNumbers.has(d.day_number)),
          ...editionRows,
        ].sort((a, b) => a.day_number - b.day_number);
        console.log(`[Roadmap] Merged ${templateRows.length} template + ${editionRows.length} edition-specific → ${merged.length} total`);
        return merged;
      }

      // No edition rows at all — return template only
      console.log(`[Roadmap] Template-only: ${templateRows.length} days for ${userCohortType}`);
      return templateRows;
    },
    // CRITICAL: Only enable when profile loading is complete
    enabled: queryEnabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    // IMPORTANT: Don't retry on timeout errors to prevent long skeleton delays
    retry: (failureCount, error) => {
      if (isTimeoutError(error)) {
        console.warn('[Roadmap] Not retrying after timeout error');
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
  });

  // Calculate dates: bootcamp days use formula, online sessions use stored dates only
  const roadmapDays = useMemo(() => {
    if (!templateDays) return [];

    return templateDays.map(day => {
      // Online sessions (day_number < 0): NEVER calculate dates from formula.
      // Online session dates are non-consecutive and depend on mentor availability,
      // so they must be stored explicitly per-edition in the database.
      // If the date is set in the DB, use it. If null, leave it null (UI shows "TBA").
      if (day.day_number < 0) {
        return day; // Keep whatever date is stored (or null)
      }

      // Bootcamp days (day_number > 0): Calculate from forge_start_date.
      // Bootcamp days are always consecutive, so the formula works.
      let calculatedDate: string | null = null;
      if (day.day_number > 0 && forgeStartDate) {
        const dayDate = new Date(forgeStartDate);
        dayDate.setDate(dayDate.getDate() + (day.day_number - 1));
        calculatedDate = dayDate.toISOString().split('T')[0];
      }

      // day_number === 0 (prep day): keep stored date or null
      if (day.day_number === 0) {
        return day;
      }

      return {
        ...day,
        date: calculatedDate
      };
    });
  }, [templateDays, forgeStartDate, editionIdForQuery]);

  // Fetch galleries with timeout
  const { data: galleries } = useQuery({
    queryKey: ['roadmap-galleries', editionIdForQuery],
    queryFn: async () => {
      const result = await promiseWithTimeout(
        supabase
          .from('roadmap_galleries')
          .select('*')
          .eq('edition_id', editionIdForQuery || '')
          .order('order_index')
          .then(res => res),
        ROADMAP_QUERY_TIMEOUT,
        'galleries'
      );
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!editionIdForQuery,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => !isTimeoutError(error) && failureCount < 2,
  });

  // Fetch student films with timeout
  const { data: studentFilms } = useQuery({
    queryKey: ['student-films', profile?.edition_id],
    queryFn: async () => {
      const result = await promiseWithTimeout(
        supabase
          .from('student_films')
          .select('*')
          .order('order_index')
          .then(res => res),
        ROADMAP_QUERY_TIMEOUT,
        'student_films'
      );
      if (result.error) throw result.error;
      return result.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => !isTimeoutError(error) && failureCount < 2,
  });

  // Fetch prep checklist items filtered by cohort type with timeout
  const { data: prepItems } = useQuery({
    queryKey: ['prep-checklist-items', userCohortType],
    queryFn: async () => {
      const result = await promiseWithTimeout(
        supabase
          .from('prep_checklist_items')
          .select('*')
          .eq('cohort_type', userCohortType!)
          .order('order_index')
          .then(res => res),
        ROADMAP_QUERY_TIMEOUT,
        'prep_items'
      );
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!userCohortType,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => !isTimeoutError(error) && failureCount < 2,
  });

  // Fetch user's prep progress with timeout
  const { data: userProgress } = useQuery({
    queryKey: ['user-prep-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const result = await promiseWithTimeout(
        supabase
          .from('user_prep_progress')
          .select('checklist_item_id')
          .eq('user_id', user.id)
          .then(res => res),
        ROADMAP_QUERY_TIMEOUT,
        'user_prep_progress'
      );
      if (result.error) throw result.error;
      return result.data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => !isTimeoutError(error) && failureCount < 2,
  });

  const completedIds = useMemo(() => 
    new Set((userProgress || []).map(p => p.checklist_item_id)),
    [userProgress]
  );

   // Compute visible prep items (filtered by excluded categories)
   const visiblePrepItems = useMemo(() => {
     if (!prepItems) return [];
     return prepItems.filter(item => !EXCLUDED_PREP_CATEGORIES.includes(item.category));
   }, [prepItems]);

   // Compute prep progress summary for Homepage
   const prepProgress = useMemo(() => {
     const total = visiblePrepItems.length;
     const completed = visiblePrepItems.filter(item => completedIds.has(item.id)).length;
     return {
       totalItems: total,
       completedItems: completed,
       progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
       hasData: total > 0,
     };
   }, [visiblePrepItems, completedIds]);

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
      queryClient.invalidateQueries({ queryKey: ['user_journey_progress'] });
      queryClient.invalidateQueries({ queryKey: ['prep-checklist-items'] });
    }
  });

  const getDayStatus = (day: RoadmapDay): 'completed' | 'current' | 'upcoming' | 'locked' => {
    if (!day.is_active) return 'locked';
    
    if (isTestingMode && simulatedDayNumber !== null && simulatedForgeMode === 'DURING_FORGE') {
      if (day.day_number < simulatedDayNumber) return 'completed';
      if (day.day_number === simulatedDayNumber) return 'current';
      return 'upcoming';
    }
    
    if (isTestingMode && simulatedForgeMode === 'PRE_FORGE') {
      if (day.day_number === 0) return 'current';
      return 'upcoming';
    }
    
    if (isTestingMode && simulatedForgeMode === 'POST_FORGE') {
      return 'completed';
    }
    
    if (forgeMode === 'PRE_FORGE') {
      if (day.day_number === 0) return 'current';
      return 'upcoming';
    }
    
    if (forgeMode === 'POST_FORGE') {
      return 'completed';
    }
    
    if (!day.date) {
      return 'current';
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayDate = new Date(day.date);
    dayDate.setHours(0, 0, 0, 0);
    
    if (dayDate < today) return 'completed';
    if (dayDate.getTime() === today.getTime()) return 'current';
    return 'upcoming';
  };

  const getNodePosition = (index: number): 'left' | 'center' | 'right' => {
    const row = index % 3;
    if (row === 0) return 'left';
    if (row === 1) return 'center';
    return 'right';
  };

  const currentDayNumber = useMemo(() => {
    const currentDay = roadmapDays?.find(d => getDayStatus(d) === 'current');
    return currentDay?.day_number || 1;
  }, [roadmapDays]);

  const completedCount = roadmapDays?.filter(d => getDayStatus(d) === 'completed').length || 0;
  const totalCount = roadmapDays?.length || 0;
  const nodeStatuses = useMemo(() => roadmapDays?.map(getDayStatus) || [], [roadmapDays]);

  const stayGallery = galleries?.filter(g => g.gallery_type === 'stay_location') || [];
  const momentsGallery = galleries?.filter(g => g.gallery_type === 'forge_moment') || [];

  return {
    profile,
    edition: effectiveEd,
    forgeMode,
    user,
    userCohortType,
    cohortName,
    forgeStartDate,
    roadmapDays,
    isLoadingDays: userDataLoading || isLoadingDays,
    isErrorDays,
    daysError,
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
     prepProgress,
  };
};

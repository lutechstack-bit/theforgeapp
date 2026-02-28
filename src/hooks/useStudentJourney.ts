import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useEffectiveCohort } from '@/hooks/useEffectiveCohort';
import { differenceInDays } from 'date-fns';

export interface JourneyStage {
  id: string;
  stage_key: string;
  title: string;
  description: string | null;
  order_index: number;
  icon: string | null;
  color: string | null;
  days_before_start: number | null;
  days_after_start: number | null;
  is_active: boolean;
}

export interface JourneyTask {
  id: string;
  stage_id: string;
  title: string;
  description: string | null;
  cohort_types: string[];
  auto_complete_field: string | null;
  deep_link: string | null;
  order_index: number;
  is_required: boolean;
  is_active: boolean;
  due_days_offset: number | null;
  linked_prep_category: string | null;
}

export interface UserJourneyProgress {
  id: string;
  user_id: string;
  task_id: string;
  status: 'pending' | 'completed';
  completed_at: string | null;
}

interface PrepChecklistItem {
  id: string;
  category: string;
  cohort_type: string;
  title: string;
}

export const useStudentJourney = () => {
  const { user, profile, edition } = useAuth();
  const { effectiveCohortType, effectiveEdition } = useEffectiveCohort();
  const queryClient = useQueryClient();

  // Get effective cohort type (respects admin simulation)
  const cohortType = effectiveCohortType || 'FORGE';

  // Fetch all journey stages
  const { data: allStages, isLoading: stagesLoading } = useQuery({
    queryKey: ['journey_stages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journey_stages')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data as JourneyStage[];
    },
  });

  // Filter out online_forge stage for FORGE_WRITING cohort
  const stages = allStages?.filter(stage => {
    if (cohortType === 'FORGE_WRITING' && stage.stage_key === 'online_forge') {
      return false;
    }
    return true;
  }) || [];

  // Fetch tasks filtered by cohort type
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['journey_tasks', cohortType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('journey_tasks')
        .select('*')
        .eq('is_active', true)
        .contains('cohort_types', [cohortType])
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data as JourneyTask[];
    },
  });

  // Fetch user's progress
  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ['user_journey_progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_journey_progress')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      return data as UserJourneyProgress[];
    },
    enabled: !!user?.id,
  });

  // Fetch community message count for auto-complete
  const { data: communityMessageCount } = useQuery({
    queryKey: ['community_message_count', user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count, error } = await supabase
        .from('community_messages')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (error) return 0;
      return count || 0;
    },
    enabled: !!user?.id,
  });

  // Fetch prep checklist items for category progress
  const { data: prepItems } = useQuery({
    queryKey: ['prep-checklist-items', cohortType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prep_checklist_items')
        .select('id, category, cohort_type, title')
        .eq('cohort_type', cohortType);
      if (error) throw error;
      return data as PrepChecklistItem[];
    },
  });

  // Fetch user's prep progress
  const { data: prepProgress } = useQuery({
    queryKey: ['user-prep-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_prep_progress')
        .select('checklist_item_id')
        .eq('user_id', user.id);
      if (error) throw error;
      return data.map(p => p.checklist_item_id);
    },
    enabled: !!user?.id,
  });

  // Get prep category progress
  const getPrepCategoryProgress = (category: string): { completed: number; total: number } => {
    const categoryItems = prepItems?.filter(item => item.category === category) || [];
    const completedCount = categoryItems.filter(item => 
      prepProgress?.includes(item.id)
    ).length;
    return { completed: completedCount, total: categoryItems.length };
  };

  // Check if prep category is complete
  const isPrepCategoryComplete = (category: string): boolean => {
    const progress = getPrepCategoryProgress(category);
    return progress.total > 0 && progress.completed === progress.total;
  };

  // Determine current stage based on forge dates (cohort-aware)
  const getCurrentStage = (): string => {
    const editionToUse = effectiveEdition || edition;
    if (!editionToUse?.forge_start_date || !editionToUse?.forge_end_date) {
      return 'pre_registration';
    }

    const now = new Date();
    const forgeStart = new Date(editionToUse.forge_start_date);
    const forgeEnd = new Date(editionToUse.forge_end_date);
    const daysUntilStart = differenceInDays(forgeStart, now);
    const daysSinceStart = differenceInDays(now, forgeStart);

    if (now > forgeEnd) return 'post_forge';
    
    // Writers go directly to physical_forge (no online stage)
    if (cohortType === 'FORGE_WRITING') {
      if (daysSinceStart >= 0) return 'physical_forge';
    } else {
      // FORGE and FORGE_CREATORS have online forge for first 3 days
      if (daysSinceStart >= 3) return 'physical_forge';
      if (daysSinceStart >= 0) return 'online_forge';
    }
    
    if (daysUntilStart <= 15) return 'final_prep';
    if (daysUntilStart <= 30) return 'pre_travel';
    return 'pre_registration';
  };

  // Check if a task is auto-completed based on profile/database data
  const isTaskAutoCompleted = (task: JourneyTask): boolean => {
    // Check linked prep category first
    if (task.linked_prep_category) {
      return isPrepCategoryComplete(task.linked_prep_category);
    }

    if (!task.auto_complete_field) return false;

    switch (task.auto_complete_field) {
      case 'ky_form_completed':
        return profile?.ky_form_completed === true;
      case 'profile_setup_completed':
        return profile?.profile_setup_completed === true;
      case 'payment_status':
        return profile?.payment_status === 'BALANCE_PAID';
      case 'instagram_handle':
        return !!profile?.instagram_handle;
      case 'community_intro':
        return (communityMessageCount || 0) > 0;
      default:
        return false;
    }
  };

  // Check if a task is completed (either manually or auto)
  const isTaskCompleted = (taskId: string): boolean => {
    const task = tasks?.find(t => t.id === taskId);
    if (task && isTaskAutoCompleted(task)) return true;
    
    const progressItem = progress?.find(p => p.task_id === taskId);
    return progressItem?.status === 'completed';
  };

  // Toggle task completion with bidirectional prep sync and optimistic updates
  const toggleTask = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const task = tasks?.find(t => t.id === taskId);

      // Save to user_journey_progress
      if (completed) {
        const { error } = await supabase
          .from('user_journey_progress')
          .upsert({
            user_id: user.id,
            task_id: taskId,
            status: 'completed',
            completed_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id,task_id',
          });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_journey_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('task_id', taskId);
        if (error) throw error;
      }

      // Bidirectional sync: If task has linked_prep_category, sync to prep progress
      if (task?.linked_prep_category && prepItems) {
        const categoryItems = prepItems.filter(
          item => item.category === task.linked_prep_category
        );

        if (completed) {
          // Mark ALL items in this category as complete
          for (const item of categoryItems) {
            await supabase.from('user_prep_progress').upsert({
              user_id: user.id,
              checklist_item_id: item.id
            }, {
              onConflict: 'user_id,checklist_item_id'
            });
          }
        } else {
          // Remove ALL items in this category
          const itemIds = categoryItems.map(i => i.id);
          if (itemIds.length > 0) {
            await supabase.from('user_prep_progress')
              .delete()
              .eq('user_id', user.id)
              .in('checklist_item_id', itemIds);
          }
        }
      }
    },
    // Optimistic update for instant UI feedback
    onMutate: async ({ taskId, completed }) => {
      // Cancel any in-flight queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['user_journey_progress', user?.id] });
      
      // Snapshot previous value for rollback
      const previousProgress = queryClient.getQueryData<UserJourneyProgress[]>(['user_journey_progress', user?.id]);
      
      // Optimistically update the cache
      queryClient.setQueryData<UserJourneyProgress[]>(['user_journey_progress', user?.id], (old) => {
        if (completed) {
          // Add completion record
          const newRecord: UserJourneyProgress = {
            id: `temp-${taskId}`,
            user_id: user?.id || '',
            task_id: taskId,
            status: 'completed',
            completed_at: new Date().toISOString(),
          };
          return [...(old || []), newRecord];
        } else {
          // Remove completion record
          return (old || []).filter((p) => p.task_id !== taskId);
        }
      });
      
      return { previousProgress };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousProgress) {
        queryClient.setQueryData(['user_journey_progress', user?.id], context.previousProgress);
      }
    },
    onSettled: () => {
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['user_journey_progress'] });
      queryClient.invalidateQueries({ queryKey: ['user-prep-progress'] });
    },
  });

  // Get tasks for a specific stage
  const getTasksForStage = (stageId: string): JourneyTask[] => {
    return tasks?.filter(t => t.stage_id === stageId) || [];
  };

  // Get completion stats for a stage
  const getStageStats = (stageId: string): { completed: number; total: number } => {
    const stageTasks = getTasksForStage(stageId);
    const completed = stageTasks.filter(t => isTaskCompleted(t.id)).length;
    return { completed, total: stageTasks.length };
  };

  // Get current stage object
  const currentStageKey = getCurrentStage();
  const currentStage = stages?.find(s => s.stage_key === currentStageKey);

  // Get completed stages (stages before current)
  const completedStages = stages?.filter(s => s.order_index < (currentStage?.order_index || 0)) || [];

  // Get upcoming stages (stages after current)
  const upcomingStages = stages?.filter(s => s.order_index > (currentStage?.order_index || 0)) || [];

  return {
    stages,
    tasks,
    progress,
    currentStage,
    currentStageKey,
    completedStages,
    upcomingStages,
    isLoading: stagesLoading || tasksLoading || progressLoading,
    getTasksForStage,
    getStageStats,
    isTaskCompleted,
    isTaskAutoCompleted,
    toggleTask,
    cohortType,
    getPrepCategoryProgress,
    isPrepCategoryComplete,
  };
};

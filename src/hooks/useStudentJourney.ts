import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
}

export interface UserJourneyProgress {
  id: string;
  user_id: string;
  task_id: string;
  status: 'pending' | 'completed';
  completed_at: string | null;
}

export const useStudentJourney = () => {
  const { user, profile, edition } = useAuth();
  const queryClient = useQueryClient();

  // Get user's cohort type
  const cohortType = edition?.cohort_type || 'FORGE';

  // Fetch all journey stages
  const { data: stages, isLoading: stagesLoading } = useQuery({
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

  // Determine current stage based on forge dates
  const getCurrentStage = (): string => {
    if (!edition?.forge_start_date || !edition?.forge_end_date) {
      return 'pre_registration';
    }

    const now = new Date();
    const forgeStart = new Date(edition.forge_start_date);
    const forgeEnd = new Date(edition.forge_end_date);
    const daysUntilStart = differenceInDays(forgeStart, now);
    const daysSinceStart = differenceInDays(now, forgeStart);

    if (now > forgeEnd) return 'post_forge';
    if (daysSinceStart >= 3) return 'physical_forge';
    if (daysSinceStart >= 0) return 'online_forge';
    if (daysUntilStart <= 15) return 'final_prep';
    if (daysUntilStart <= 30) return 'pre_travel';
    return 'pre_registration';
  };

  // Check if a task is auto-completed based on profile/database data
  const isTaskAutoCompleted = (task: JourneyTask): boolean => {
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

  // Toggle task completion
  const toggleTask = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: string; completed: boolean }) => {
      if (!user?.id) throw new Error('Not authenticated');

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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_journey_progress'] });
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
  };
};

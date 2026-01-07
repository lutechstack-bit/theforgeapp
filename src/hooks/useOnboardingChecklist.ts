import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface OnboardingTask {
  key: string;
  title: string;
  description: string;
  icon: string;
  route?: string;
  autoDetect?: () => boolean;
}

// Define the 6 onboarding tasks
export const ONBOARDING_TASKS: OnboardingTask[] = [
  {
    key: 'complete_profile',
    title: 'Complete your full profile',
    description: 'Add your bio, photo, and social handles',
    icon: 'user',
    route: '/profile',
  },
  {
    key: 'finish_kyf',
    title: 'Finish your Forge records',
    description: 'Complete the Know Your Forger form',
    icon: 'clipboard-check',
    route: '/kyf',
  },
  {
    key: 'introduce_community',
    title: 'Introduce yourself to the community',
    description: 'Say hello in the community chat',
    icon: 'message-circle',
    route: '/community',
  },
  {
    key: 'check_packing_list',
    title: 'Check your packing list',
    description: 'Review what to bring for Forge',
    icon: 'luggage',
    route: '/roadmap',
  },
  {
    key: 'block_calendar',
    title: 'Block your calendar using the roadmap',
    description: 'Plan your schedule around Forge dates',
    icon: 'calendar',
    route: '/roadmap',
  },
  {
    key: 'attend_event',
    title: 'Attend at least 1 community event',
    description: 'Join an upcoming workshop or meetup',
    icon: 'users',
    route: '/events',
  },
];

export const useOnboardingChecklist = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch completed tasks from database
  const { data: completedTasks, isLoading } = useQuery({
    queryKey: ['onboarding-checklist', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('onboarding_checklist')
        .select('task_key, completed_at')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Auto-detect completion status for certain tasks
  const getTaskCompletionStatus = (taskKey: string): boolean => {
    // Check if manually marked complete in DB
    const dbComplete = completedTasks?.some(t => t.task_key === taskKey);
    if (dbComplete) return true;

    // Auto-detect based on profile data
    switch (taskKey) {
      case 'complete_profile':
        return !!(profile?.bio && profile?.avatar_url && profile?.full_name);
      case 'finish_kyf':
        return !!profile?.kyf_completed || !!profile?.ky_form_completed;
      default:
        return false;
    }
  };

  // Mark task as complete
  const markComplete = useMutation({
    mutationFn: async (taskKey: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('onboarding_checklist')
        .upsert({
          user_id: user.id,
          task_key: taskKey,
          completed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,task_key',
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-checklist', user?.id] });
    },
  });

  // Get tasks with their completion status
  const tasksWithStatus = ONBOARDING_TASKS.map(task => ({
    ...task,
    isCompleted: getTaskCompletionStatus(task.key),
  }));

  const completedCount = tasksWithStatus.filter(t => t.isCompleted).length;
  const totalCount = ONBOARDING_TASKS.length;
  const allCompleted = completedCount === totalCount;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return {
    tasks: tasksWithStatus,
    completedCount,
    totalCount,
    allCompleted,
    progress,
    isLoading,
    markComplete: markComplete.mutate,
    isMarkingComplete: markComplete.isPending,
  };
};

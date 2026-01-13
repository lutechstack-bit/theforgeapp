import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserWork {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  type: string;
  media_type: string;
  thumbnail_url: string | null;
  media_url: string | null;
  award_tags: string[];
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkInput {
  title: string;
  description?: string;
  type: string;
  media_type: string;
  thumbnail_url?: string;
  media_url?: string;
  award_tags?: string[];
}

export interface UpdateWorkInput extends Partial<CreateWorkInput> {
  id: string;
}

export const useUserWorks = (userId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const targetUserId = userId || user?.id;

  const { data: works, isLoading, error, refetch } = useQuery({
    queryKey: ['user-works', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from('user_works')
        .select('*')
        .eq('user_id', targetUserId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return (data || []) as UserWork[];
    },
    enabled: !!targetUserId,
  });

  const createWork = useMutation({
    mutationFn: async (input: CreateWorkInput) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_works')
        .insert({
          user_id: user.id,
          title: input.title,
          description: input.description || null,
          type: input.type,
          media_type: input.media_type,
          thumbnail_url: input.thumbnail_url || null,
          media_url: input.media_url || null,
          award_tags: input.award_tags || [],
          order_index: (works?.length || 0) + 1,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-works', targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['profile-data', targetUserId] });
      toast({
        title: 'Work Added',
        description: 'Your project has been added to your portfolio.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add work. Please try again.',
        variant: 'destructive',
      });
      console.error('Create work error:', error);
    },
  });

  const updateWork = useMutation({
    mutationFn: async (input: UpdateWorkInput) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from('user_works')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-works', targetUserId] });
      toast({
        title: 'Work Updated',
        description: 'Your project has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update work. Please try again.',
        variant: 'destructive',
      });
      console.error('Update work error:', error);
    },
  });

  const deleteWork = useMutation({
    mutationFn: async (workId: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_works')
        .delete()
        .eq('id', workId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-works', targetUserId] });
      queryClient.invalidateQueries({ queryKey: ['profile-data', targetUserId] });
      toast({
        title: 'Work Deleted',
        description: 'Your project has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete work. Please try again.',
        variant: 'destructive',
      });
      console.error('Delete work error:', error);
    },
  });

  return {
    works: works || [],
    isLoading,
    error,
    refetch,
    createWork,
    updateWork,
    deleteWork,
  };
};

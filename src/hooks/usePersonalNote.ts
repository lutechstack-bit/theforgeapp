import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UserNote {
  id: string;
  user_id: string;
  content: string;
  updated_at: string;
}

export const usePersonalNote = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [localContent, setLocalContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user's note
  const { data: note, isLoading, refetch } = useQuery({
    queryKey: ['user_note', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_notes')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user note:', error);
        return null;
      }
      
      return data as UserNote | null;
    },
    enabled: !!user?.id,
  });

  // Sync local content when note changes
  useEffect(() => {
    if (note) {
      setLocalContent(note.content || '');
    }
  }, [note]);

  // Save note mutation (upsert)
  const saveNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_notes')
        .upsert(
          { 
            user_id: user.id, 
            content,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_note', user?.id] });
      toast.success('Note saved');
    },
    onError: (error) => {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    },
  });

  // Debounced save function
  const saveNote = useCallback(async (content: string) => {
    setIsSaving(true);
    try {
      await saveNoteMutation.mutateAsync(content);
    } finally {
      setIsSaving(false);
    }
  }, [saveNoteMutation]);

  // Update local content (for controlled input)
  const updateLocalContent = useCallback((content: string) => {
    // Enforce character limit of 500
    const trimmedContent = content.slice(0, 500);
    setLocalContent(trimmedContent);
  }, []);

  return {
    note,
    localContent,
    updateLocalContent,
    saveNote,
    isLoading,
    isSaving,
    refetch,
  };
};

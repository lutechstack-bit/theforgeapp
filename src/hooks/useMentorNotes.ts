import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

export type MentorNoteRow = {
  id: string;
  mentor_user_id: string;
  student_user_id: string;
  body: string;
  created_at: string;
  updated_at: string;
  author?: { id: string; full_name: string | null; avatar_url: string | null } | null;
};

export const useMentorNotes = (studentId: string | null | undefined) =>
  useQuery<MentorNoteRow[]>({
    queryKey: ['mentor-notes', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const { data, error } = await sb
        .from('mentor_notes')
        .select(`
          id, mentor_user_id, student_user_id, body, created_at, updated_at,
          author:profiles!mentor_notes_mentor_user_id_fkey (
            id, full_name, avatar_url
          )
        `)
        .eq('student_user_id', studentId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as MentorNoteRow[];
    },
    enabled: !!studentId,
    staleTime: 30 * 1000,
  });

export const useAddMentorNote = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (args: { studentId: string; body: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const trimmed = args.body.trim();
      if (!trimmed) throw new Error('Note is empty');
      if (trimmed.length > 2000) throw new Error('Note is too long (max 2000)');
      const { data, error } = await sb
        .from('mentor_notes')
        .insert({
          mentor_user_id: user.id,
          student_user_id: args.studentId,
          body: trimmed,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['mentor-notes', vars.studentId] });
    },
  });
};

export const useDeleteMentorNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { noteId: string; studentId: string }) => {
      const { error } = await sb.from('mentor_notes').delete().eq('id', args.noteId);
      if (error) throw error;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['mentor-notes', vars.studentId] });
    },
  });
};

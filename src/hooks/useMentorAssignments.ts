import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * mentor_assignments and mentor_profiles are introduced in migration
 * 20260424100100. Until `supabase gen types` is re-run, TypeScript doesn't
 * know about them, so we cast the client at call sites. Remove these casts
 * once types are regenerated.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

export type MentorAssignmentRow = {
  id: string;
  mentor_user_id: string;
  student_user_id: string;
  edition_id: string | null;
  assigned_at: string;
  assigned_by: string | null;
  profiles?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    cohort_type?: string | null;
  } | null;
};

/**
 * Assignments the current mentor has (for use on the mentor workspace).
 *
 * RLS on mentor_assignments restricts SELECT to rows where the viewer is
 * the mentor, so the explicit mentor_user_id filter is defensive — it also
 * lets admins pre-scope when we open the workspace as an admin later.
 */
export const useMyMentorStudents = () => {
  const { user, loading: authLoading } = useAuth();

  return useQuery<MentorAssignmentRow[]>({
    queryKey: ['mentor-assignments', 'mine', user?.id],
    queryFn: async () => {
      const { data, error } = await sb
        .from('mentor_assignments')
        .select(`
          id,
          mentor_user_id,
          student_user_id,
          edition_id,
          assigned_at,
          assigned_by,
          profiles:profiles!mentor_assignments_student_user_id_fkey (
            id,
            full_name,
            avatar_url,
            cohort_type
          )
        `)
        .eq('mentor_user_id', user!.id)
        .order('assigned_at', { ascending: true });

      if (error) throw error;
      return (data ?? []) as MentorAssignmentRow[];
    },
    enabled: !!user?.id && !authLoading,
    staleTime: 60 * 1000,
  });
};

/**
 * The current student's assigned mentor (usually one row per edition).
 * Used on the student side to show the "Your mentor" block.
 */
export const useMyMentor = (editionId?: string | null) => {
  const { user, loading: authLoading } = useAuth();

  return useQuery<MentorAssignmentRow | null>({
    queryKey: ['mentor-assignments', 'my-mentor', user?.id, editionId ?? null],
    queryFn: async () => {
      let query = sb
        .from('mentor_assignments')
        .select(`
          id,
          mentor_user_id,
          student_user_id,
          edition_id,
          assigned_at,
          assigned_by,
          profiles:profiles!mentor_assignments_mentor_user_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('student_user_id', user!.id);

      if (editionId) query = query.eq('edition_id', editionId);

      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return (data ?? null) as MentorAssignmentRow | null;
    },
    enabled: !!user?.id && !authLoading,
    staleTime: 5 * 60 * 1000,
  });
};

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

export type StudentDetailRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  email: string | null;
  edition_id: string | null;
  specialty: string | null;
  tagline: string | null;
  instagram_handle: string | null;
  twitter_handle: string | null;
  edition?: {
    id: string;
    name: string;
    city: string;
    cohort_type: string;
    forge_start_date: string | null;
    forge_end_date: string | null;
  } | null;
};

/**
 * Full profile for a student the current mentor has access to.
 * RLS on profiles already allows self-reads; for mentors reading their
 * students, relies on broader profile visibility rules the app uses today.
 */
export const useStudentDetail = (studentId: string | null | undefined) =>
  useQuery<StudentDetailRow | null>({
    queryKey: ['mentor', 'student-detail', studentId],
    queryFn: async () => {
      if (!studentId) return null;
      const { data, error } = await sb
        .from('profiles')
        .select(`
          id, full_name, avatar_url, bio, city, email, edition_id,
          specialty, tagline, instagram_handle, twitter_handle,
          edition:editions (
            id, name, city, cohort_type, forge_start_date, forge_end_date
          )
        `)
        .eq('id', studentId)
        .maybeSingle();
      if (error) throw error;
      return data as StudentDetailRow | null;
    },
    enabled: !!studentId,
    staleTime: 60 * 1000,
  });

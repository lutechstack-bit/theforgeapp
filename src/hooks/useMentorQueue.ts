import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { SubmissionFormKey } from '@/hooks/useSubmissions';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

type ProfileLite = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

export type QueueItem =
  | {
      kind: 'submission';
      id: string;
      created_at: string;
      student: ProfileLite | null;
      student_user_id: string;
      form_key: SubmissionFormKey;
      title: string | null;
      tally_form_id: string | null;
      tally_response_id: string | null;
    }
  | {
      kind: 'doubt';
      id: string;
      created_at: string;
      student: ProfileLite | null;
      student_user_id: string;
      question: string;
    };

/**
 * The mentor's cross-student queue: pending submissions + open doubts where
 * they are the current owner. Sorted by oldest-waiting first so the most
 * urgent items surface to the top.
 */
export const useMentorQueue = () => {
  const { user } = useAuth();
  return useQuery<QueueItem[]>({
    queryKey: ['mentor-queue', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const [{ data: subs, error: subErr }, { data: doubts, error: doErr }] =
        await Promise.all([
          sb
            .from('submissions')
            .select(`
              id, created_at, student_user_id, form_key, title, tally_form_id, tally_response_id,
              student:profiles!submissions_student_user_id_fkey (
                id, full_name, avatar_url
              )
            `)
            .eq('mentor_user_id', user.id)
            .eq('status', 'pending')
            .order('created_at', { ascending: true }),
          sb
            .from('doubts')
            .select(`
              id, created_at, student_user_id, question,
              student:profiles!doubts_student_user_id_fkey (
                id, full_name, avatar_url
              )
            `)
            .eq('current_mentor_user_id', user.id)
            .eq('status', 'open')
            .order('created_at', { ascending: true }),
        ]);
      if (subErr) throw subErr;
      if (doErr) throw doErr;

      const items: QueueItem[] = [
        ...((subs ?? []) as Array<{
          id: string;
          created_at: string;
          student_user_id: string;
          form_key: SubmissionFormKey;
          title: string | null;
          tally_form_id: string | null;
          tally_response_id: string | null;
          student: ProfileLite | null;
        }>).map((s) => ({
          kind: 'submission' as const,
          id: s.id,
          created_at: s.created_at,
          student: s.student,
          student_user_id: s.student_user_id,
          form_key: s.form_key,
          title: s.title,
          tally_form_id: s.tally_form_id,
          tally_response_id: s.tally_response_id,
        })),
        ...((doubts ?? []) as Array<{
          id: string;
          created_at: string;
          student_user_id: string;
          question: string;
          student: ProfileLite | null;
        }>).map((d) => ({
          kind: 'doubt' as const,
          id: d.id,
          created_at: d.created_at,
          student: d.student,
          student_user_id: d.student_user_id,
          question: d.question,
        })),
      ];

      // Sort by oldest first across both kinds.
      items.sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      );
      return items;
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000,
  });
};

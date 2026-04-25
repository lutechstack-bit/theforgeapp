import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

export type DoubtStatus =
  | 'open'
  | 'replied'
  | 'closed'
  | 'escalated'
  | 'cancelled'
  | 'reassigned';

export type DoubtRow = {
  id: string;
  student_user_id: string;
  original_mentor_user_id: string;
  current_mentor_user_id: string;
  edition_id: string | null;
  question: string;
  status: DoubtStatus;
  escalated_to_admin: boolean;
  escalation_note: string | null;
  escalated_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  student?: { id: string; full_name: string | null; avatar_url: string | null } | null;
  current_mentor?: { id: string; full_name: string | null; avatar_url: string | null } | null;
};

export type DoubtReplyRow = {
  id: string;
  doubt_id: string;
  author_user_id: string;
  author_role: 'student' | 'mentor' | 'admin' | 'system';
  body: string;
  cc_mentor: boolean;
  created_at: string;
  author?: { id: string; full_name: string | null; avatar_url: string | null } | null;
};

// ────────────────────────────────────────────────────────────────────────
// Student side
// ────────────────────────────────────────────────────────────────────────

/**
 * Doubts the current user has raised as a student, newest first.
 */
export const useMyDoubts = () => {
  const { user } = useAuth();
  return useQuery<DoubtRow[]>({
    queryKey: ['doubts', 'mine', user?.id],
    queryFn: async () => {
      const { data, error } = await sb
        .from('doubts')
        .select(`
          *,
          current_mentor:profiles!doubts_current_mentor_user_id_fkey (
            id, full_name, avatar_url
          )
        `)
        .eq('student_user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as DoubtRow[];
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000,
  });
};

/**
 * Student creates a new doubt. Mentor is auto-picked from the student's
 * active mentor_assignments row (by edition). Throws if the student has no
 * assigned mentor for their edition.
 */
export const useCreateDoubt = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (args: { question: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const trimmed = args.question.trim();
      if (!trimmed) throw new Error('Question cannot be empty');
      if (trimmed.length > 200) throw new Error('Question too long (max 200)');

      // Resolve the student's assigned mentor from mentor_assignments. Prefer
      // the row for the student's current edition (profiles.edition_id) if any.
      const { data: profile, error: profErr } = await sb
        .from('profiles')
        .select('edition_id')
        .eq('id', user.id)
        .maybeSingle();
      if (profErr) throw profErr;

      let query = sb
        .from('mentor_assignments')
        .select('mentor_user_id, edition_id')
        .eq('student_user_id', user.id);
      if (profile?.edition_id) query = query.eq('edition_id', profile.edition_id);

      const { data: assignment, error: assignErr } = await query.maybeSingle();
      if (assignErr) throw assignErr;
      if (!assignment) {
        throw new Error(
          "You don't have a mentor assigned yet. Ask an admin to assign one before sending doubts.",
        );
      }

      const { data, error } = await sb
        .from('doubts')
        .insert({
          student_user_id: user.id,
          original_mentor_user_id: assignment.mentor_user_id,
          current_mentor_user_id: assignment.mentor_user_id,
          edition_id: assignment.edition_id ?? profile?.edition_id ?? null,
          question: trimmed,
          status: 'open',
        })
        .select()
        .single();
      if (error) throw error;
      return data as DoubtRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doubts'] });
    },
  });
};

/**
 * Student cancels their own doubt.
 */
export const useCancelDoubt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { doubtId: string }) => {
      const { error } = await sb
        .from('doubts')
        .update({ status: 'cancelled' })
        .eq('id', args.doubtId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doubts'] });
    },
  });
};

// ────────────────────────────────────────────────────────────────────────
// Mentor side
// ────────────────────────────────────────────────────────────────────────

/**
 * Doubts the current mentor owns. Optionally filter by one student.
 */
export const useMentorDoubts = (studentId?: string | null) => {
  const { user } = useAuth();
  return useQuery<DoubtRow[]>({
    queryKey: ['doubts', 'mentor', user?.id, studentId ?? null],
    queryFn: async () => {
      let q = sb
        .from('doubts')
        .select(`
          *,
          student:profiles!doubts_student_user_id_fkey (
            id, full_name, avatar_url
          )
        `)
        .eq('current_mentor_user_id', user!.id);
      if (studentId) q = q.eq('student_user_id', studentId);
      const { data, error } = await q.order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as DoubtRow[];
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000,
  });
};

/**
 * Mentor sends a reply on a doubt they own (flips status to 'replied').
 */
export const useMentorReply = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (args: { doubtId: string; body: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const trimmed = args.body.trim();
      if (!trimmed) throw new Error('Reply is empty');
      if (trimmed.length > 500) throw new Error('Reply too long (max 500)');

      const { error: replyErr } = await sb.from('doubt_replies').insert({
        doubt_id: args.doubtId,
        author_user_id: user.id,
        author_role: 'mentor',
        body: trimmed,
      });
      if (replyErr) throw replyErr;

      const { error: statusErr } = await sb
        .from('doubts')
        .update({ status: 'replied' })
        .eq('id', args.doubtId);
      if (statusErr) throw statusErr;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doubts'] });
      qc.invalidateQueries({ queryKey: ['doubt-replies'] });
    },
  });
};

/**
 * Mentor closes a doubt (resolved).
 */
export const useCloseDoubt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { doubtId: string }) => {
      const { error } = await sb
        .from('doubts')
        .update({ status: 'closed', closed_at: new Date().toISOString() })
        .eq('id', args.doubtId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doubts'] });
    },
  });
};

/**
 * Mentor escalates a doubt to admin with a short "why" note (≤500 chars).
 */
export const useEscalateDoubt = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (args: { doubtId: string; note: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const note = args.note.trim();
      if (!note) throw new Error('Escalation note is required');
      if (note.length > 500) throw new Error('Escalation note too long (max 500)');

      const { error: updErr } = await sb
        .from('doubts')
        .update({
          status: 'escalated',
          escalated_to_admin: true,
          escalated_at: new Date().toISOString(),
          escalation_note: note,
        })
        .eq('id', args.doubtId);
      if (updErr) throw updErr;

      // Leave a system breadcrumb in the thread.
      const { error: replyErr } = await sb.from('doubt_replies').insert({
        doubt_id: args.doubtId,
        author_user_id: user.id,
        author_role: 'mentor',
        body: `Escalated to admin: "${note}"`,
      });
      if (replyErr) throw replyErr;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doubts'] });
      qc.invalidateQueries({ queryKey: ['doubt-replies'] });
    },
  });
};

/**
 * Mentor cancels a doubt (from the mentor side — e.g., noise).
 * Students use useCancelDoubt instead.
 */
export const useMentorCancelDoubt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { doubtId: string }) => {
      const { error } = await sb
        .from('doubts')
        .update({ status: 'cancelled' })
        .eq('id', args.doubtId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doubts'] });
    },
  });
};

// ────────────────────────────────────────────────────────────────────────
// Replies (shared)
// ────────────────────────────────────────────────────────────────────────
export const useDoubtReplies = (doubtId: string | null | undefined) =>
  useQuery<DoubtReplyRow[]>({
    queryKey: ['doubt-replies', doubtId],
    queryFn: async () => {
      if (!doubtId) return [];
      const { data, error } = await sb
        .from('doubt_replies')
        .select(`
          *,
          author:profiles!doubt_replies_author_user_id_fkey (
            id, full_name, avatar_url
          )
        `)
        .eq('doubt_id', doubtId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as DoubtReplyRow[];
    },
    enabled: !!doubtId,
    staleTime: 15 * 1000,
  });

// ────────────────────────────────────────────────────────────────────────
// Admin side
// ────────────────────────────────────────────────────────────────────────

/**
 * All escalated doubts — admin inbox. Optionally filter by status bucket.
 */
export const useEscalatedDoubts = () =>
  useQuery<DoubtRow[]>({
    queryKey: ['doubts', 'admin', 'escalated'],
    queryFn: async () => {
      const { data, error } = await sb
        .from('doubts')
        .select(`
          *,
          student:profiles!doubts_student_user_id_fkey (
            id, full_name, avatar_url
          ),
          current_mentor:profiles!doubts_current_mentor_user_id_fkey (
            id, full_name, avatar_url
          )
        `)
        .eq('escalated_to_admin', true)
        .order('escalated_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as DoubtRow[];
    },
    staleTime: 30 * 1000,
  });

/**
 * Admin sends a reply. Flips status to 'replied' unless the doubt is closed.
 * cc_mentor controls whether the mentor is notified (UI concern; the flag
 * is persisted so mentors can filter their inbox).
 */
export const useAdminReply = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (args: {
      doubtId: string;
      body: string;
      ccMentor: boolean;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const trimmed = args.body.trim();
      if (!trimmed) throw new Error('Reply is empty');
      if (trimmed.length > 500) throw new Error('Reply too long (max 500)');

      const { error: replyErr } = await sb.from('doubt_replies').insert({
        doubt_id: args.doubtId,
        author_user_id: user.id,
        author_role: 'admin',
        body: trimmed,
        cc_mentor: args.ccMentor,
      });
      if (replyErr) throw replyErr;

      const { error: statusErr } = await sb
        .from('doubts')
        .update({ status: 'replied' })
        .eq('id', args.doubtId);
      if (statusErr) throw statusErr;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doubts'] });
      qc.invalidateQueries({ queryKey: ['doubt-replies'] });
    },
  });
};

/**
 * Admin reassigns a doubt to a different mentor. Inserts a system reply
 * noting the handoff.
 */
export const useReassignDoubt = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (args: {
      doubtId: string;
      newMentorUserId: string;
      fromMentorName: string;
      toMentorName: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { error: updErr } = await sb
        .from('doubts')
        .update({
          status: 'reassigned',
          current_mentor_user_id: args.newMentorUserId,
        })
        .eq('id', args.doubtId);
      if (updErr) throw updErr;

      const { error: replyErr } = await sb.from('doubt_replies').insert({
        doubt_id: args.doubtId,
        author_user_id: user.id,
        author_role: 'admin',
        body: `Reassigned from ${args.fromMentorName} to ${args.toMentorName}.`,
      });
      if (replyErr) throw replyErr;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['doubts'] });
      qc.invalidateQueries({ queryKey: ['doubt-replies'] });
    },
  });
};

/**
 * Admin closes a doubt.
 */
export const useAdminCloseDoubt = useCloseDoubt; // same UPDATE, different caller role

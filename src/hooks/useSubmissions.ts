import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

export type SubmissionFormKey = 'premise' | 'script' | 'production';
export type SubmissionStatus = 'pending' | 'approved' | 'revisions' | 'withdrawn';

export type SubmissionRow = {
  id: string;
  student_user_id: string;
  mentor_user_id: string | null;
  edition_id: string | null;
  form_key: SubmissionFormKey;
  status: SubmissionStatus;
  title: string | null;
  tally_form_id: string | null;
  tally_response_id: string | null;
  tally_submitted_at: string | null;
  revision_of: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  latest_feedback?: SubmissionFeedbackRow | null;
};

export type SubmissionFeedbackRow = {
  id: string;
  submission_id: string;
  mentor_user_id: string;
  decision: 'approved' | 'revisions';
  body: string | null;
  created_at: string;
  mentor?: { id: string; full_name: string | null; avatar_url: string | null } | null;
};

/**
 * Human labels for each form key. Kept here so mentor UI, student UI, and
 * admin UI all use the same wording.
 */
export const FORM_LABELS: Record<SubmissionFormKey, { short: string; long: string; icon: string }> = {
  premise:    { short: 'Premise',    long: 'Premise Submission',      icon: '💡' },
  script:     { short: 'Script',     long: 'First Draft Script',      icon: '✍️' },
  production: { short: 'Production', long: 'Production Schedule',     icon: '🎥' },
};

export const STAGE_ORDER: SubmissionFormKey[] = ['premise', 'script', 'production'];

/**
 * The next stage in the pipeline after each form. Used by the review-event
 * fan-out to point the student at what's now available.
 */
export const NEXT_STAGE: Record<SubmissionFormKey, SubmissionFormKey | null> = {
  premise: 'script',
  script: 'production',
  production: null,
};

/**
 * Tally form base URLs. Hardcoded here to match the existing `MENTOR_CARD_TEMPLATES`
 * pattern; if these change, update them in lockstep with the
 * TALLY_FORM_PREMISE / SCRIPT / PRODUCTION secrets used by the webhook.
 */
export const TALLY_FORM_URLS: Record<SubmissionFormKey, string> = {
  premise:    'https://tally.so/r/mRE0p9',
  script:     'https://tally.so/r/wMobBA',
  production: 'https://tally.so/r/q45QEO',
};

/**
 * Latest submission per (student, form_key). This is what the mentor's
 * submissions tab and the stage pipeline render from.
 */
export const useStudentSubmissions = (studentId: string | null | undefined) =>
  useQuery<SubmissionRow[]>({
    queryKey: ['submissions', 'student', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const { data, error } = await sb
        .from('submissions')
        .select('*')
        .eq('student_user_id', studentId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as SubmissionRow[];
    },
    enabled: !!studentId,
    staleTime: 30 * 1000,
  });

/**
 * All feedback entries for a submission, newest-last (chronological).
 */
export const useSubmissionFeedback = (submissionId: string | null | undefined) =>
  useQuery<SubmissionFeedbackRow[]>({
    queryKey: ['submission-feedback', submissionId],
    queryFn: async () => {
      if (!submissionId) return [];
      const { data, error } = await sb
        .from('submission_feedback')
        .select(`
          *,
          mentor:profiles!submission_feedback_mentor_user_id_fkey (
            id, full_name, avatar_url
          )
        `)
        .eq('submission_id', submissionId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as SubmissionFeedbackRow[];
    },
    enabled: !!submissionId,
    staleTime: 30 * 1000,
  });

/**
 * Mentor reviews a submission. Writes the feedback row + flips status, then
 * fans out to notifications and (where appropriate) targeted_cards so the
 * student sees the result on their home stack and inbox.
 *
 * Side-effects (notification + card) failures are logged but don't roll back
 * the review — the feedback row is the source of truth, the rest is delivery.
 */
export const useReviewSubmission = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (args: {
      submissionId: string;
      formKey: SubmissionFormKey;
      studentUserId: string;
      decision: 'approved' | 'revisions';
      body: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const body = args.body.trim();
      if (args.decision === 'revisions' && !body) {
        throw new Error('Revisions need a note for the student');
      }
      if (body.length > 500) throw new Error('Feedback too long (max 500)');

      // ─ 1. Feedback row ─
      const { error: fbErr } = await sb.from('submission_feedback').insert({
        submission_id: args.submissionId,
        mentor_user_id: user.id,
        decision: args.decision,
        body: body || null,
      });
      if (fbErr) throw fbErr;

      // ─ 2. Status update ─
      const { error: updErr } = await sb
        .from('submissions')
        .update({
          status: args.decision,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', args.submissionId);
      if (updErr) throw updErr;

      // ─ 3. Fan-out (best effort: log on failure, don't roll back) ─
      try {
        // Resolve mentor's display name for the notification copy.
        const { data: mentorProfile } = await sb
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();
        const fullMentorName = mentorProfile?.full_name ?? 'Your mentor';
        const mentorFirst = fullMentorName.split(' ')[0];
        const formLabel = FORM_LABELS[args.formKey].short;

        const notifTitle =
          args.decision === 'approved'
            ? `${mentorFirst} approved your ${formLabel}`
            : `${mentorFirst} sent revisions on your ${formLabel}`;
        const notifMessage =
          body ||
          (args.decision === 'approved'
            ? 'Open your roadmap to see what unlocks next.'
            : 'Open the feedback to see what to revise.');

        // 3a — In-app notification (always)
        const { error: notifErr } = await sb.from('notifications').insert({
          user_id: args.studentUserId,
          type: 'ROADMAP',
          title: notifTitle,
          message: notifMessage,
          link: '/profile',
          is_global: false,
        });
        if (notifErr) console.warn('Notification write failed', notifErr);

        // 3b — Targeted card (situational)
        const next = NEXT_STAGE[args.formKey];
        if (args.decision === 'approved' && next) {
          // Approved + next stage exists → point them at the next form.
          const nextLong = FORM_LABELS[next].long;
          const cardCtaUrl = buildTallyFormUrl(
            TALLY_FORM_URLS[next],
            args.studentUserId,
          );
          const { error: cardErr } = await sb.from('targeted_cards').insert({
            target_user_id: args.studentUserId,
            source: 'mentor',
            source_user_id: user.id,
            title: `${formLabel} approved — start your ${nextLong}`,
            body:
              body ||
              `${mentorFirst} approved your ${formLabel}. Submit your ${nextLong} when ready.`,
            cta_label: `Submit ${FORM_LABELS[next].short} →`,
            cta_url: cardCtaUrl,
            icon: '✓',
            template_key: 'review-approved',
            linked_form_key: next,
            delivered_as_card: true,
            delivered_as_push: false,
          });
          if (cardErr) console.warn('Approval card write failed', cardErr);
        } else if (args.decision === 'revisions') {
          // Revisions → point them back at the same form to resubmit.
          const url = buildTallyFormUrl(
            TALLY_FORM_URLS[args.formKey],
            args.studentUserId,
          );
          const { error: cardErr } = await sb.from('targeted_cards').insert({
            target_user_id: args.studentUserId,
            source: 'mentor',
            source_user_id: user.id,
            title: `${mentorFirst} sent feedback on your ${formLabel}`,
            body,
            cta_label: 'Open form & resubmit →',
            cta_url: url,
            icon: '✎',
            template_key: 'review-revisions',
            linked_form_key: args.formKey,
            delivered_as_card: true,
            delivered_as_push: false,
          });
          if (cardErr) console.warn('Revisions card write failed', cardErr);
        }
        // Final-stage approval (production) intentionally has no card —
        // the notification carries the news.
      } catch (e) {
        // Catch-all so a fan-out hiccup never blocks the review itself.
        console.warn('Review fan-out partially failed', e);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['submissions'] });
      qc.invalidateQueries({ queryKey: ['submission-feedback'] });
      qc.invalidateQueries({ queryKey: ['targeted-cards'] });
    },
  });
};

/**
 * Helper for the stage pipeline (Premise → Script → Production).
 * Returns the latest submission per form_key and the derived "next" stage.
 */
export const computePipeline = (submissions: SubmissionRow[]) => {
  const latest: Partial<Record<SubmissionFormKey, SubmissionRow>> = {};
  for (const s of submissions) {
    const existing = latest[s.form_key];
    if (!existing || new Date(s.created_at) > new Date(existing.created_at)) {
      latest[s.form_key] = s;
    }
  }
  // Compute unlocked/locked: a stage is unlocked only if the previous one
  // is approved. Premise is always available.
  const gated: Record<SubmissionFormKey, 'locked' | 'available' | SubmissionStatus> = {
    premise: 'available',
    script: 'locked',
    production: 'locked',
  };
  if (latest.premise) gated.premise = latest.premise.status;
  if (latest.premise?.status === 'approved') {
    gated.script = latest.script ? latest.script.status : 'available';
  }
  if (latest.script?.status === 'approved') {
    gated.production = latest.production ? latest.production.status : 'available';
  }

  // Find the next actionable stage for the mentor (first pending), or null
  // if everything's approved.
  let nextForMentor: SubmissionFormKey | null = null;
  for (const key of STAGE_ORDER) {
    if (latest[key]?.status === 'pending') { nextForMentor = key; break; }
    if (latest[key]?.status === 'revisions') { nextForMentor = null; break; }
  }
  return { latest, gated, nextForMentor };
};

/**
 * Build the Tally form URL with the student_id hidden field prepopulated.
 * Use this on the student side so the webhook can identify the submitter.
 */
export const buildTallyFormUrl = (
  base: string,          // e.g. 'https://tally.so/r/mRE0p9'
  studentId: string,
  extras?: Record<string, string>,
) => {
  const url = new URL(base);
  url.searchParams.set('student_id', studentId);
  if (extras) {
    for (const [k, v] of Object.entries(extras)) url.searchParams.set(k, v);
  }
  return url.toString();
};

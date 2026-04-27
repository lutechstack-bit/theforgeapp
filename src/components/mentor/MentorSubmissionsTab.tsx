import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  RefreshCw,
  Lock,
  ExternalLink,
  Loader2,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

import {
  useStudentSubmissions,
  useSubmissionFeedback,
  useReviewSubmission,
  computePipeline,
  FORM_LABELS,
  STAGE_ORDER,
  type SubmissionFormKey,
  type SubmissionRow,
  type SubmissionStatus,
} from '@/hooks/useSubmissions';

// ────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────
const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—';

const initials = (name: string | null | undefined) =>
  (name ?? '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

type PipelineState = 'locked' | 'available' | SubmissionStatus;

const stageMeta: Record<
  PipelineState,
  { label: string; dot: React.ReactNode; stripe: string; bg: string }
> = {
  locked:    { label: 'Locked',       dot: <Lock className="h-3 w-3" />,          stripe: 'border-l-transparent', bg: 'bg-muted/20 opacity-60' },
  available: { label: 'Not sent',     dot: <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />, stripe: 'border-l-border', bg: '' },
  pending:   { label: 'In review',    dot: <Clock className="h-3 w-3 text-primary" />, stripe: 'border-l-primary', bg: 'bg-primary/5' },
  approved:  { label: 'Approved',     dot: <CheckCircle2 className="h-3 w-3 text-green-500" />, stripe: 'border-l-green-500', bg: 'bg-green-500/5' },
  revisions: { label: 'Revisions',    dot: <RefreshCw className="h-3 w-3 text-orange-500" />, stripe: 'border-l-orange-500', bg: 'bg-orange-500/5' },
  withdrawn: { label: 'Withdrawn',    dot: null, stripe: 'border-l-muted', bg: 'bg-muted/20 opacity-50' },
};

// ────────────────────────────────────────────────────────────────────────
// Stage pipeline (Premise → Script → Production)
// ────────────────────────────────────────────────────────────────────────
const StagePipeline: React.FC<{
  gated: Record<SubmissionFormKey, PipelineState>;
  latest: Partial<Record<SubmissionFormKey, SubmissionRow>>;
}> = ({ gated, latest }) => (
  <Card className="p-4">
    <div className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      Form pipeline
    </div>
    <div className="grid gap-2 sm:grid-cols-3">
      {STAGE_ORDER.map((k, i) => {
        const state = gated[k];
        const meta = stageMeta[state];
        const sub = latest[k];
        return (
          <div
            key={k}
            className={`rounded-md border border-border border-l-2 p-3 ${meta.stripe} ${meta.bg}`}
          >
            <div className="flex items-center gap-2">
              <div className="grid h-5 w-5 shrink-0 place-items-center">{meta.dot}</div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {i + 1}. {FORM_LABELS[k].short}
              </div>
            </div>
            <div className="mt-1.5 text-sm font-medium">{meta.label}</div>
            {sub && (
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {formatDate(sub.tally_submitted_at ?? sub.created_at)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  </Card>
);

// ────────────────────────────────────────────────────────────────────────
// Inline feedback composer on a submission
// ────────────────────────────────────────────────────────────────────────
const ReviewComposer: React.FC<{
  submissionId: string;
  formKey: SubmissionFormKey;
  studentUserId: string;
  decision: 'approved' | 'revisions';
  studentFirstName: string;
  onClose: () => void;
}> = ({ submissionId, formKey, studentUserId, decision, studentFirstName, onClose }) => {
  const [draft, setDraft] = useState('');
  const review = useReviewSubmission();
  const required = decision === 'revisions';
  const canSubmit = draft.length <= 500 && (!required || draft.trim().length > 0);

  const onSubmit = async () => {
    try {
      await review.mutateAsync({
        submissionId,
        formKey,
        studentUserId,
        decision,
        body: draft,
      });
      setDraft('');
      onClose();
      toast.success(
        decision === 'approved'
          ? `Approved · ${studentFirstName} notified${draft.trim() ? ' with a note' : ''}`
          : `Revisions sent to ${studentFirstName}`,
      );
    } catch (e) {
      toast.error(String((e as Error)?.message ?? e));
    }
  };

  const tone =
    decision === 'approved'
      ? 'border-green-500/30 bg-green-500/5'
      : 'border-orange-500/30 bg-orange-500/5';
  const labelColor = decision === 'approved' ? 'text-green-500' : 'text-orange-500';

  return (
    <div className={`mt-3 rounded-md border p-3 ${tone}`}>
      <div className="mb-2 flex items-center justify-between">
        <span className={`text-[11px] font-semibold uppercase tracking-wider ${labelColor}`}>
          {decision === 'approved'
            ? '✓ Approval note (optional)'
            : '✎ Revision notes (required)'}
        </span>
        <span className="text-[10px] text-muted-foreground">
          Max 500 chars · {studentFirstName} will see this
        </span>
      </div>
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value.slice(0, 500))}
        placeholder={
          decision === 'approved'
            ? 'Optional — what worked, what to carry forward.'
            : `Tell ${studentFirstName} exactly what to revise — scenes, character, pacing, etc.`
        }
        rows={3}
        className="resize-none"
        autoFocus
      />
      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span
          className={
            draft.length >= 500
              ? 'text-destructive'
              : draft.length >= 440
              ? 'text-orange-500'
              : ''
          }
        >
          {draft.length} / 500
        </span>
        <div className="ml-auto flex gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onSubmit}
            disabled={!canSubmit || review.isPending}
            className={
              decision === 'approved'
                ? 'bg-green-500 text-black hover:bg-green-400'
                : 'bg-orange-500 text-white hover:bg-orange-400'
            }
          >
            {review.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : decision === 'approved' ? (
              '✓ Confirm approval'
            ) : (
              'Send revisions →'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────
// Feedback thread (chronological)
// ────────────────────────────────────────────────────────────────────────
const FeedbackThread: React.FC<{ submissionId: string }> = ({ submissionId }) => {
  const { data: items = [], isLoading } = useSubmissionFeedback(submissionId);
  if (isLoading) return <Skeleton className="mt-2 h-10 w-full" />;
  if (items.length === 0) return null;
  return (
    <div className="mt-3 space-y-2">
      {items.map((f) => {
        const tone =
          f.decision === 'approved'
            ? 'border-green-500/25 bg-green-500/5'
            : 'border-orange-500/30 bg-orange-500/5';
        return (
          <div
            key={f.id}
            className={`flex gap-3 rounded-md border p-3 text-sm ${tone}`}
          >
            <Avatar className="h-6 w-6 shrink-0">
              <AvatarImage src={f.mentor?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-gradient-to-br from-amber-800/30 to-transparent text-[10px] font-semibold text-primary">
                {initials(f.mentor?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="text-xs">
                <span className="font-medium">{f.mentor?.full_name ?? 'Mentor'}</span>{' '}
                {f.decision === 'approved' ? 'approved this submission' : 'sent it back for revisions'}.
              </div>
              {f.body && (
                <div className="mt-1 italic text-foreground/90">"{f.body}"</div>
              )}
              <div className="mt-1 text-[11px] text-muted-foreground">
                {new Date(f.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────
// Submission row
// ────────────────────────────────────────────────────────────────────────
const SubmissionCard: React.FC<{
  sub: SubmissionRow;
  studentFirstName: string;
}> = ({ sub, studentFirstName }) => {
  const [composer, setComposer] = useState<'approved' | 'revisions' | null>(null);
  const meta = stageMeta[sub.status];
  const form = FORM_LABELS[sub.form_key];
  const canReview = sub.status === 'pending';

  const tallyUrl =
    sub.tally_form_id && sub.tally_response_id
      ? `https://tally.so/forms/${sub.tally_form_id}/submissions/${sub.tally_response_id}`
      : null;

  return (
    <Card className={`border-l-2 p-4 ${meta.stripe}`}>
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted text-base">
          {form.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
              {form.short}
            </span>
            {sub.revision_of && (
              <span className="rounded-full bg-orange-500/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-orange-500">
                Revision
              </span>
            )}
          </div>
          <div className="mt-0.5 text-sm font-medium">
            {sub.title || form.long}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span>Submitted {formatDate(sub.tally_submitted_at ?? sub.created_at)}</span>
            {sub.reviewed_at && <span>Reviewed {formatDate(sub.reviewed_at)}</span>}
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
            sub.status === 'approved'
              ? 'bg-green-500/10 text-green-500 border border-green-500/30'
              : sub.status === 'pending'
              ? 'bg-primary/10 text-primary border border-primary/30'
              : sub.status === 'revisions'
              ? 'bg-orange-500/10 text-orange-500 border border-orange-500/30'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {sub.status === 'pending'
            ? 'Awaiting review'
            : sub.status === 'approved'
            ? 'Approved'
            : sub.status === 'revisions'
            ? 'Revisions sent'
            : 'Withdrawn'}
        </span>
      </div>

      <FeedbackThread submissionId={sub.id} />

      {composer && (
        <ReviewComposer
          submissionId={sub.id}
          formKey={sub.form_key}
          studentUserId={sub.student_user_id}
          decision={composer}
          studentFirstName={studentFirstName}
          onClose={() => setComposer(null)}
        />
      )}

      {canReview && !composer && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tallyUrl && (
            <Button variant="outline" size="sm" asChild>
              <a href={tallyUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                Open in Tally
              </a>
            </Button>
          )}
          <Button
            size="sm"
            className="bg-green-500 text-black hover:bg-green-400"
            onClick={() => setComposer('approved')}
          >
            ✓ Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-orange-500/30 text-orange-500 hover:bg-orange-500/10 hover:text-orange-500"
            onClick={() => setComposer('revisions')}
          >
            ✎ Send revisions
          </Button>
        </div>
      )}
    </Card>
  );
};

// ────────────────────────────────────────────────────────────────────────
// Main tab
// ────────────────────────────────────────────────────────────────────────
export const MentorSubmissionsTab: React.FC<{
  studentId: string;
  studentFirstName: string;
}> = ({ studentId, studentFirstName }) => {
  const { data: submissions = [], isLoading } = useStudentSubmissions(studentId);
  const { latest, gated } = computePipeline(submissions);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  const pending = submissions.filter((s) => s.status === 'pending');
  const history = submissions.filter((s) => s.status !== 'pending');

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <StagePipeline gated={gated} latest={latest} />

      {pending.length > 0 && (
        <section>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Awaiting your review ({pending.length})
          </div>
          <div className="space-y-2">
            {pending.map((s) => (
              <SubmissionCard
                key={s.id}
                sub={s}
                studentFirstName={studentFirstName}
              />
            ))}
          </div>
        </section>
      )}

      {submissions.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No submissions yet from {studentFirstName}. They'll appear here the moment a Tally form
            is submitted.
          </p>
        </Card>
      )}

      {history.length > 0 && (
        <section>
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            History
          </div>
          <div className="space-y-2">
            {history.map((s) => (
              <SubmissionCard
                key={s.id}
                sub={s}
                studentFirstName={studentFirstName}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

import React from 'react';
import {
  CheckCircle2,
  Clock,
  RefreshCw,
  Lock,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { useAuth } from '@/contexts/AuthContext';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useMyMentor } from '@/hooks/useMentorAssignments';
import {
  useStudentSubmissions,
  computePipeline,
  buildTallyFormUrl,
  FORM_LABELS,
  STAGE_ORDER,
  TALLY_FORM_URLS,
  type SubmissionFormKey,
  type SubmissionRow,
  type SubmissionStatus,
} from '@/hooks/useSubmissions';

const initials = (name: string | null | undefined) =>
  (name ?? '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—';

type StageState = 'locked' | 'available' | SubmissionStatus;

const stateMeta: Record<
  StageState,
  { label: string; tone: string; icon: React.ReactNode }
> = {
  locked: {
    label: 'Locked',
    tone: 'border-l-transparent opacity-60',
    icon: <Lock className="h-3 w-3" />,
  },
  available: {
    label: 'Ready to submit',
    tone: 'border-l-primary',
    icon: <span className="h-1.5 w-1.5 rounded-full bg-primary" />,
  },
  pending: {
    label: 'In review',
    tone: 'border-l-primary bg-primary/5',
    icon: <Clock className="h-3 w-3 text-primary" />,
  },
  approved: {
    label: 'Approved',
    tone: 'border-l-green-500 bg-green-500/5',
    icon: <CheckCircle2 className="h-3 w-3 text-green-500" />,
  },
  revisions: {
    label: 'Needs revisions',
    tone: 'border-l-orange-500 bg-orange-500/5',
    icon: <RefreshCw className="h-3 w-3 text-orange-500" />,
  },
  withdrawn: {
    label: 'Withdrawn',
    tone: 'border-l-muted opacity-50',
    icon: null,
  },
};

const PipelineStep: React.FC<{
  index: number;
  formKey: SubmissionFormKey;
  state: StageState;
  latest?: SubmissionRow;
  studentId: string;
  mentorFirst: string;
}> = ({ index, formKey, state, latest, studentId, mentorFirst }) => {
  const meta = stateMeta[state];
  const form = FORM_LABELS[formKey];
  const tallyHref = buildTallyFormUrl(TALLY_FORM_URLS[formKey], studentId);

  // Pick the right CTA per state.
  const cta = (() => {
    if (state === 'available') {
      return (
        <Button size="sm" className="mt-2" asChild>
          <a href={tallyHref} target="_blank" rel="noreferrer">
            Submit {form.short} <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </Button>
      );
    }
    if (state === 'revisions') {
      return (
        <Button
          size="sm"
          variant="outline"
          className="mt-2 border-orange-500/40 text-orange-500 hover:bg-orange-500/10 hover:text-orange-500"
          asChild
        >
          <a href={tallyHref} target="_blank" rel="noreferrer">
            Open form & resubmit <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </Button>
      );
    }
    return null;
  })();

  // Sub-line — what happened most recently for this stage.
  const subLine = (() => {
    if (state === 'locked') {
      return index === 1
        ? 'Unlocks once your premise is approved.'
        : 'Unlocks once your script is approved.';
    }
    if (state === 'available') {
      return index === 0
        ? `Send your premise to ${mentorFirst}.`
        : index === 1
        ? `Send your first draft to ${mentorFirst}.`
        : `Send your production schedule to the team.`;
    }
    if (state === 'pending' && latest) {
      return `Submitted ${formatDate(latest.tally_submitted_at ?? latest.created_at)} · ${mentorFirst} is reviewing.`;
    }
    if (state === 'approved' && latest) {
      return `Approved ${formatDate(latest.reviewed_at)} by ${mentorFirst}.`;
    }
    if (state === 'revisions' && latest) {
      return `${mentorFirst} sent revisions ${formatDate(latest.reviewed_at)}.`;
    }
    return '';
  })();

  return (
    <div className={`rounded-md border border-border border-l-2 p-3 ${meta.tone}`}>
      <div className="flex items-center gap-2">
        <div className="grid h-5 w-5 shrink-0 place-items-center">{meta.icon}</div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {index + 1}. {form.short}
        </div>
      </div>
      <div className="mt-1.5 text-sm font-semibold">{meta.label}</div>
      {subLine && (
        <div className="mt-0.5 text-[12px] leading-snug text-muted-foreground">{subLine}</div>
      )}
      {cta}
    </div>
  );
};

/**
 * Student-facing "Your submission progress" card.
 *
 * Self-gates on:
 *   1. `mentors_enabled` feature flag — if off, renders nothing.
 *   2. Active mentor assignment — if the student has no mentor yet,
 *      shows a soft empty state instead of a broken pipeline.
 *
 * Use on Home (next to LiveSessionCard / PaymentFocusCard).
 */
const MyMentorPipeline: React.FC = () => {
  const { user } = useAuth();
  const { isFeatureEnabled, isLoading: flagsLoading } = useFeatureFlags();
  const { data: assignment, isLoading: assignmentLoading } = useMyMentor();
  const { data: submissions = [], isLoading: subsLoading } = useStudentSubmissions(user?.id);

  if (flagsLoading) return null;
  if (!isFeatureEnabled('mentors_enabled')) return null;

  // Skeleton while we're still fetching either piece.
  if (assignmentLoading || subsLoading) {
    return <Skeleton className="h-44 w-full rounded-xl" />;
  }

  // No assignment yet — friendly empty state.
  if (!assignment) {
    return (
      <Card className="p-5">
        <div className="text-sm font-semibold">Your submission progress</div>
        <p className="mt-1 text-sm text-muted-foreground">
          You don't have a mentor assigned yet. Once an admin assigns one, your submission pipeline
          (Premise → Script → Production) will show up here.
        </p>
      </Card>
    );
  }

  const mentor = assignment.profiles;
  const mentorFirst = (mentor?.full_name ?? 'your mentor').split(' ')[0];
  const { latest, gated } = computePipeline(submissions);
  const allDone = STAGE_ORDER.every((k) => gated[k] === 'approved');

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">Your submission progress</div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Avatar className="h-5 w-5">
              <AvatarImage src={mentor?.avatar_url ?? undefined} />
              <AvatarFallback className="bg-gradient-to-br from-amber-800/30 to-transparent text-[9px] font-semibold text-primary">
                {initials(mentor?.full_name)}
              </AvatarFallback>
            </Avatar>
            <span>
              <span className="font-medium text-foreground">
                {mentor?.full_name ?? 'Your mentor'}
              </span>{' '}
              is your mentor
            </span>
          </div>
        </div>
        {allDone && (
          <span className="rounded-full border border-green-500/30 bg-green-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-green-500">
            ✓ All done
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {STAGE_ORDER.map((key, i) => (
          <PipelineStep
            key={key}
            index={i}
            formKey={key}
            state={gated[key] as StageState}
            latest={latest[key]}
            studentId={user!.id}
            mentorFirst={mentorFirst}
          />
        ))}
      </div>

      {!allDone && (
        <div className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <ArrowRight className="h-3 w-3" />
          <span>Stages unlock as your previous work gets approved.</span>
        </div>
      )}
    </Card>
  );
};

export default MyMentorPipeline;

import React, { useMemo, useState } from 'react';
import { Loader2, AlertCircle, UserCog } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

import {
  useEscalatedDoubts,
  useDoubtReplies,
  useAdminReply,
  useAdminCloseDoubt,
  useReassignDoubt,
  type DoubtRow,
  type DoubtStatus,
} from '@/hooks/useDoubts';
import { useMentors, type MentorRow } from '@/hooks/useMentorAdminData';

// ────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────
const formatRelative = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
};

const initials = (name: string | null | undefined) =>
  (name ?? '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const statusMeta: Record<
  DoubtStatus,
  { label: string; stripe: string; badge: string }
> = {
  open: {
    label: 'Awaiting mentor',
    stripe: 'border-l-primary',
    badge: 'bg-primary/10 text-primary border border-primary/30',
  },
  replied: {
    label: 'Admin replied',
    stripe: 'border-l-blue-400',
    badge: 'bg-blue-400/10 text-blue-400 border border-blue-400/30',
  },
  closed: {
    label: 'Closed',
    stripe: 'border-l-green-500',
    badge: 'bg-green-500/10 text-green-500 border border-green-500/30',
  },
  escalated: {
    label: 'Awaiting admin',
    stripe: 'border-l-purple-400',
    badge: 'bg-purple-400/10 text-purple-400 border border-purple-400/30',
  },
  cancelled: {
    label: 'Cancelled',
    stripe: 'border-l-muted',
    badge: 'bg-muted/40 text-muted-foreground border border-border',
  },
  reassigned: {
    label: 'Reassigned',
    stripe: 'border-l-orange-500',
    badge: 'bg-orange-500/10 text-orange-500 border border-orange-500/30',
  },
};

// ────────────────────────────────────────────────────────────────────────
// Reply thread view
// ────────────────────────────────────────────────────────────────────────
const Replies: React.FC<{ doubtId: string }> = ({ doubtId }) => {
  const { data: replies = [], isLoading } = useDoubtReplies(doubtId);
  if (isLoading) return <Skeleton className="mt-3 h-14 w-full" />;
  if (replies.length === 0) return null;
  return (
    <div className="mt-3 border-l-2 border-purple-400/30 pl-4">
      {replies.map((r) => (
        <div key={r.id} className="py-2 text-sm">
          <span className="font-medium text-foreground">
            {r.author?.full_name ?? r.author_role}
          </span>{' '}
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            ({r.author_role})
          </span>
          {r.author_role === 'admin' && r.cc_mentor && (
            <span className="ml-2 rounded-full bg-purple-400/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-purple-400">
              cc mentor
            </span>
          )}
          : <em className="italic text-foreground/90">"{r.body}"</em>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {formatRelative(r.created_at)}
          </div>
        </div>
      ))}
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────
// Reassign dialog
// ────────────────────────────────────────────────────────────────────────
const ReassignDialog: React.FC<{
  doubt: DoubtRow;
  mentors: MentorRow[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}> = ({ doubt, mentors, open, onOpenChange }) => {
  const reassign = useReassignDoubt();

  const onPick = async (m: MentorRow) => {
    if (m.user_id === doubt.current_mentor_user_id) return;
    try {
      await reassign.mutateAsync({
        doubtId: doubt.id,
        newMentorUserId: m.user_id,
        fromMentorName: doubt.current_mentor?.full_name ?? 'previous mentor',
        toMentorName: m.full_name ?? 'new mentor',
      });
      onOpenChange(false);
      toast.success(`Reassigned to ${m.full_name}`);
    } catch (e) {
      toast.error(`Could not reassign: ${String(e)}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reassign to a different mentor</DialogTitle>
          <DialogDescription>
            The doubt stays open and the new mentor takes it over. A system note is added to the
            thread.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {mentors.map((m) => {
            const isCurrent = m.user_id === doubt.current_mentor_user_id;
            return (
              <button
                key={m.user_id}
                onClick={() => onPick(m)}
                disabled={isCurrent || reassign.isPending}
                className={[
                  'flex w-full items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-left text-sm transition-colors',
                  isCurrent
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:border-primary/40 hover:bg-primary/5',
                ].join(' ')}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={m.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-amber-800/30 to-transparent text-[10px] font-semibold text-primary">
                      {initials(m.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {m.full_name}
                      {isCurrent && (
                        <span className="ml-2 text-[11px] font-normal text-muted-foreground">
                          (current)
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Capacity {m.capacity}
                      {!m.is_accepting_students && ' · not accepting'}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ────────────────────────────────────────────────────────────────────────
// One doubt card
// ────────────────────────────────────────────────────────────────────────
const EscalatedCard: React.FC<{
  doubt: DoubtRow;
  mentors: MentorRow[];
}> = ({ doubt, mentors }) => {
  const [replying, setReplying] = useState(false);
  const [draft, setDraft] = useState('');
  const [ccMentor, setCcMentor] = useState(true);
  const [reassignOpen, setReassignOpen] = useState(false);

  const reply = useAdminReply();
  const close = useAdminCloseDoubt();
  const meta = statusMeta[doubt.status];
  const canAct = doubt.status !== 'closed' && doubt.status !== 'cancelled';

  const onSendReply = async () => {
    try {
      await reply.mutateAsync({
        doubtId: doubt.id,
        body: draft,
        ccMentor,
      });
      setDraft('');
      setReplying(false);
      toast.success(
        `Reply sent to ${doubt.student?.full_name?.split(' ')[0] ?? 'student'}${
          ccMentor ? ` · ${doubt.current_mentor?.full_name?.split(' ')[0] ?? 'mentor'} cc'd` : ''
        }`,
      );
    } catch (e) {
      toast.error(`Could not send: ${String(e)}`);
    }
  };

  const onClose = async () => {
    try {
      await close.mutateAsync({ doubtId: doubt.id });
      toast.success('Doubt marked resolved');
    } catch (e) {
      toast.error(`Could not close: ${String(e)}`);
    }
  };

  return (
    <Card className={`border-l-2 p-4 ${meta.stripe}`}>
      <div className="grid grid-cols-[auto_1fr_auto] items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={doubt.student?.avatar_url ?? undefined} />
          <AvatarFallback className="bg-gradient-to-br from-amber-800/30 to-transparent text-xs font-semibold text-primary">
            {initials(doubt.student?.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="text-sm font-semibold">
            {doubt.student?.full_name ?? 'Student'}
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5">
              <UserCog className="h-3 w-3" />
              {doubt.current_mentor?.full_name ?? 'Mentor'}
            </span>
            <span>Escalated {formatRelative(doubt.escalated_at ?? doubt.created_at)}</span>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${meta.badge}`}
        >
          {meta.label}
        </span>
      </div>

      <div className="mt-3 rounded-md border border-border bg-muted/20 p-3 text-sm leading-relaxed">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {doubt.student?.full_name?.split(' ')[0] ?? 'Student'} asked
        </div>
        <div className="mt-1">{doubt.question}</div>
        <div className="mt-1.5 text-[11px] text-muted-foreground">
          {formatRelative(doubt.created_at)}
        </div>
      </div>

      {doubt.escalation_note && (
        <div className="mt-3 rounded-md border border-primary/25 bg-primary/5 p-3 text-sm">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            {doubt.current_mentor?.full_name ?? 'Mentor'} escalated:
          </div>
          <div className="mt-1 italic text-foreground/90">"{doubt.escalation_note}"</div>
        </div>
      )}

      <Replies doubtId={doubt.id} />

      {replying && (
        <div className="mt-3 rounded-md border border-purple-400/30 bg-purple-400/5 p-3">
          <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-purple-400">
            <span>Your reply to {doubt.student?.full_name?.split(' ')[0] ?? 'student'}</span>
            <span className="font-medium normal-case tracking-normal text-muted-foreground">
              Logged as admin
            </span>
          </div>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, 500))}
            placeholder="Reply directly — goes to the student's notifications."
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
            <div className="ml-3 flex items-center gap-2">
              <Switch checked={ccMentor} onCheckedChange={setCcMentor} />
              <span>cc {doubt.current_mentor?.full_name?.split(' ')[0] ?? 'mentor'}</span>
            </div>
            <div className="ml-auto flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setReplying(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={onSendReply}
                disabled={!draft.trim() || reply.isPending}
              >
                {reply.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Send reply'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {canAct && !replying && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setReplying(true)}>
            {doubt.status === 'replied' ? 'Reply again' : 'Reply directly'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-orange-500/30 text-orange-500 hover:bg-orange-500/10 hover:text-orange-500"
            onClick={() => setReassignOpen(true)}
          >
            Reassign mentor
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-green-500/30 text-green-500 hover:bg-green-500/10 hover:text-green-500"
            onClick={onClose}
            disabled={close.isPending}
          >
            ✓ Mark resolved
          </Button>
        </div>
      )}

      <ReassignDialog
        doubt={doubt}
        mentors={mentors}
        open={reassignOpen}
        onOpenChange={setReassignOpen}
      />
    </Card>
  );
};

// ────────────────────────────────────────────────────────────────────────
// Main page
// ────────────────────────────────────────────────────────────────────────
const AdminEscalatedDoubts: React.FC = () => {
  const { data: doubts = [], isLoading } = useEscalatedDoubts();
  const { data: mentors = [] } = useMentors();
  const [filter, setFilter] = useState<'all' | DoubtStatus>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return doubts.filter((d) => {
      if (filter !== 'all' && d.status !== filter) return false;
      if (!q) return true;
      return (
        d.student?.full_name?.toLowerCase().includes(q) ||
        d.current_mentor?.full_name?.toLowerCase().includes(q) ||
        d.question.toLowerCase().includes(q)
      );
    });
  }, [doubts, filter, search]);

  const count = (s: DoubtStatus) => doubts.filter((d) => d.status === s).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">
            Escalated <em className="text-primary not-italic">doubts</em>
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Questions that mentors have pushed up. You see the student, the original question, the
            mentor's note on why it was escalated, and can reply, close, or reassign to another
            mentor.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat
          label="Awaiting you"
          value={count('escalated')}
          accent="primary"
          sub={
            count('escalated') > 0 ? (
              <span className="inline-flex items-center gap-1 text-orange-500">
                <AlertCircle className="h-3 w-3" />
                Oldest needs attention
              </span>
            ) : (
              'All caught up'
            )
          }
        />
        <Stat label="Admin replied" value={count('replied')} sub="Awaiting close" />
        <Stat label="Reassigned" value={count('reassigned')} sub="Handed to another mentor" />
        <Stat label="Closed" value={count('closed')} sub="This queue (lifetime)" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
        <FilterChip value="all" current={filter} onClick={setFilter}>
          All
        </FilterChip>
        <FilterChip value="escalated" current={filter} onClick={setFilter}>
          Awaiting ({count('escalated')})
        </FilterChip>
        <FilterChip value="replied" current={filter} onClick={setFilter}>
          Replied
        </FilterChip>
        <FilterChip value="reassigned" current={filter} onClick={setFilter}>
          Reassigned
        </FilterChip>
        <FilterChip value="closed" current={filter} onClick={setFilter}>
          Closed
        </FilterChip>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search student, mentor, question…"
          className="ml-auto w-full sm:w-64"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {doubts.length === 0
            ? 'No escalated doubts yet. Mentors can escalate from their workspace.'
            : 'No doubts match this filter.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((d) => (
            <EscalatedCard key={d.id} doubt={d} mentors={mentors} />
          ))}
        </div>
      )}
    </div>
  );
};

const Stat: React.FC<{
  label: string;
  value: number;
  accent?: 'primary';
  sub?: React.ReactNode;
}> = ({ label, value, accent, sub }) => (
  <Card className="p-4">
    <div
      className={[
        'font-serif text-2xl font-semibold',
        accent === 'primary' && 'text-primary',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {value}
    </div>
    <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {label}
    </div>
    {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
  </Card>
);

const FilterChip: React.FC<{
  value: 'all' | DoubtStatus;
  current: 'all' | DoubtStatus;
  onClick: (v: 'all' | DoubtStatus) => void;
  children: React.ReactNode;
}> = ({ value, current, onClick, children }) => (
  <button
    onClick={() => onClick(value)}
    className={[
      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
      value === current
        ? 'border-primary/40 bg-primary/10 text-primary'
        : 'border-border text-muted-foreground hover:text-foreground',
    ].join(' ')}
  >
    {children}
  </button>
);

export default AdminEscalatedDoubts;

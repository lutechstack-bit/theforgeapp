import React, { useState } from 'react';
import { Loader2, Lock } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
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
  useMentorDoubts,
  useDoubtReplies,
  useMentorReply,
  useCloseDoubt,
  useEscalateDoubt,
  useMentorCancelDoubt,
  type DoubtRow,
  type DoubtStatus,
} from '@/hooks/useDoubts';

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

const statusMeta: Record<
  DoubtStatus,
  { label: string; stripe: string; badge: string }
> = {
  open: {
    label: 'Open',
    stripe: 'border-l-primary',
    badge: 'bg-primary/10 text-primary border border-primary/30',
  },
  replied: {
    label: 'Replied · awaiting close',
    stripe: 'border-l-blue-400',
    badge: 'bg-blue-400/10 text-blue-400 border border-blue-400/30',
  },
  closed: {
    label: 'Closed',
    stripe: 'border-l-green-500',
    badge: 'bg-green-500/10 text-green-500 border border-green-500/30',
  },
  escalated: {
    label: 'With admin',
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

const initials = (name: string | null | undefined) =>
  (name ?? '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

// ────────────────────────────────────────────────────────────────────────
// Replies thread (inline on each doubt card)
// ────────────────────────────────────────────────────────────────────────
const Replies: React.FC<{ doubtId: string }> = ({ doubtId }) => {
  const { data: replies = [], isLoading } = useDoubtReplies(doubtId);
  if (isLoading)
    return <Skeleton className="mt-3 h-12 w-full" />;
  if (replies.length === 0) return null;
  return (
    <div className="mt-3 border-l-2 border-border/60 pl-4">
      {replies.map((r) => (
        <div key={r.id} className="py-2 text-sm">
          <span className="font-medium text-foreground">
            {r.author?.full_name ?? r.author_role}
          </span>{' '}
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            ({r.author_role})
          </span>
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
// Inline reply composer
// ────────────────────────────────────────────────────────────────────────
const ReplyComposer: React.FC<{
  doubtId: string;
  onDone: () => void;
  studentFirstName: string;
}> = ({ doubtId, onDone, studentFirstName }) => {
  const [draft, setDraft] = useState('');
  const reply = useMentorReply();

  const onSend = async () => {
    try {
      await reply.mutateAsync({ doubtId, body: draft });
      setDraft('');
      onDone();
      toast.success(`Reply sent to ${studentFirstName}`);
    } catch (e) {
      toast.error(`Could not send: ${String(e)}`);
    }
  };

  return (
    <div className="mt-3 rounded-md border border-blue-400/30 bg-blue-400/5 p-3">
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value.slice(0, 500))}
        placeholder={`Type your reply to ${studentFirstName}… (max 500 chars)`}
        rows={3}
        className="resize-none"
        autoFocus
      />
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
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
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onDone}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onSend}
            disabled={!draft.trim() || reply.isPending}
          >
            {reply.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              'Send reply'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────
// Escalate dialog
// ────────────────────────────────────────────────────────────────────────
const EscalateDialog: React.FC<{
  doubt: DoubtRow;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}> = ({ doubt, open, onOpenChange }) => {
  const [note, setNote] = useState('');
  const escalate = useEscalateDoubt();

  const reset = () => setNote('');

  const onSubmit = async () => {
    try {
      await escalate.mutateAsync({ doubtId: doubt.id, note });
      reset();
      onOpenChange(false);
      toast.success('Escalated to admin');
    } catch (e) {
      toast.error(`Could not escalate: ${String(e)}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Escalate to admin</DialogTitle>
          <DialogDescription>
            Push this doubt up to an admin. They'll see it in the Escalated Doubts queue with your
            note explaining why.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Question
            </div>
            <div className="mt-1">{doubt.question}</div>
          </div>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 500))}
            placeholder="Why are you escalating this? Give admin context (max 500 chars)"
            rows={3}
          />
          <div className="text-right text-xs text-muted-foreground">
            {note.length} / 500
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!note.trim() || escalate.isPending}
          >
            {escalate.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              'Escalate'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ────────────────────────────────────────────────────────────────────────
// Single doubt card
// ────────────────────────────────────────────────────────────────────────
const DoubtCard: React.FC<{
  doubt: DoubtRow;
  studentFirstName: string;
}> = ({ doubt, studentFirstName }) => {
  const [replyOpen, setReplyOpen] = useState(false);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const closeMut = useCloseDoubt();
  const cancelMut = useMentorCancelDoubt();

  const meta = statusMeta[doubt.status];
  const canAct = doubt.status !== 'closed' && doubt.status !== 'cancelled';

  const onClose = async () => {
    try {
      await closeMut.mutateAsync({ doubtId: doubt.id });
      toast.success('Doubt marked resolved');
    } catch (e) {
      toast.error(`Could not close: ${String(e)}`);
    }
  };

  const onCancel = async () => {
    try {
      await cancelMut.mutateAsync({ doubtId: doubt.id });
      toast.success('Doubt cancelled');
    } catch (e) {
      toast.error(`Could not cancel: ${String(e)}`);
    }
  };

  return (
    <Card className={`border-l-2 p-4 ${meta.stripe}`}>
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={doubt.student?.avatar_url ?? undefined} />
          <AvatarFallback className="bg-gradient-to-br from-amber-800/30 to-transparent text-xs font-semibold text-primary">
            {initials(doubt.student?.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium">
              {doubt.student?.full_name ?? 'Student'}
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${meta.badge}`}
            >
              {meta.label}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground">
            Asked {formatRelative(doubt.created_at)}
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-md border border-border bg-muted/20 p-3 text-sm leading-relaxed">
        {doubt.question}
      </div>

      <Replies doubtId={doubt.id} />

      {replyOpen && (
        <ReplyComposer
          doubtId={doubt.id}
          studentFirstName={studentFirstName}
          onDone={() => setReplyOpen(false)}
        />
      )}

      {canAct && !replyOpen && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setReplyOpen(true)}>
            {doubt.status === 'replied' ? 'Reply again' : 'Reply'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-green-500/30 text-green-500 hover:bg-green-500/10 hover:text-green-500"
            onClick={onClose}
            disabled={closeMut.isPending}
          >
            ✓ Close
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-purple-400/30 text-purple-400 hover:bg-purple-400/10 hover:text-purple-400"
            onClick={() => setEscalateOpen(true)}
          >
            Escalate to admin
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={onCancel}
            disabled={cancelMut.isPending}
          >
            Cancel
          </Button>
        </div>
      )}

      <EscalateDialog
        doubt={doubt}
        open={escalateOpen}
        onOpenChange={setEscalateOpen}
      />
    </Card>
  );
};

// ────────────────────────────────────────────────────────────────────────
// Main tab
// ────────────────────────────────────────────────────────────────────────
export const MentorDoubtsTab: React.FC<{
  studentId: string;
  studentFirstName: string;
}> = ({ studentId, studentFirstName }) => {
  const { data: doubts = [], isLoading } = useMentorDoubts(studentId);

  const openCount = doubts.filter((d) => d.status === 'open').length;
  const repliedCount = doubts.filter((d) => d.status === 'replied').length;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center gap-3 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        <span>
          Short questions from {studentFirstName}. Reply, close when resolved, escalate if you need
          admin help, or cancel if it's noise.
        </span>
      </div>

      {doubts.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No doubts yet from {studentFirstName}.
          </p>
        </Card>
      ) : (
        <>
          <div className="mb-3 flex items-center gap-3 text-sm">
            {openCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {openCount} open
              </span>
            )}
            {repliedCount > 0 && (
              <span className="rounded-full bg-blue-400/10 px-2.5 py-0.5 text-xs font-semibold text-blue-400">
                {repliedCount} awaiting close
              </span>
            )}
          </div>
          <div className="space-y-3">
            {doubts.map((d) => (
              <DoubtCard key={d.id} doubt={d} studentFirstName={studentFirstName} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

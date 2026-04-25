import React, { useState } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

import { useMyMentor } from '@/hooks/useMentorAssignments';
import {
  useMyDoubts,
  useCreateDoubt,
  useCancelDoubt,
  useDoubtReplies,
  type DoubtStatus,
} from '@/hooks/useDoubts';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

const initials = (name: string | null | undefined) =>
  (name ?? '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const statusMeta: Record<DoubtStatus, { label: string; badge: string }> = {
  open: { label: 'Awaiting reply', badge: 'bg-primary/10 text-primary border border-primary/30' },
  replied: { label: 'Mentor replied', badge: 'bg-blue-400/10 text-blue-400 border border-blue-400/30' },
  closed: { label: 'Closed', badge: 'bg-green-500/10 text-green-500 border border-green-500/30' },
  escalated: { label: 'With admin', badge: 'bg-purple-400/10 text-purple-400 border border-purple-400/30' },
  cancelled: { label: 'Cancelled', badge: 'bg-muted/40 text-muted-foreground border border-border' },
  reassigned: { label: 'New mentor assigned', badge: 'bg-orange-500/10 text-orange-500 border border-orange-500/30' },
};

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

const Replies: React.FC<{ doubtId: string }> = ({ doubtId }) => {
  const { data: replies = [], isLoading } = useDoubtReplies(doubtId);
  if (isLoading) return <Skeleton className="mt-2 h-10 w-full" />;
  if (replies.length === 0) return null;
  return (
    <div className="mt-2 border-l-2 border-blue-400/30 pl-3">
      {replies.map((r) => (
        <div key={r.id} className="py-1.5 text-[13px]">
          <span className="font-medium">{r.author?.full_name ?? r.author_role}</span>
          <span className="ml-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            {r.author_role}
          </span>
          : <em className="italic">"{r.body}"</em>
          <div className="text-[11px] text-muted-foreground">{formatRelative(r.created_at)}</div>
        </div>
      ))}
    </div>
  );
};

/**
 * Student-side block: "Your mentor" + compose + inbox of your doubts.
 * Safe to drop onto any authenticated page. Self-gates on the
 * `mentors_enabled` feature flag so it only appears when the feature is live.
 */
const MyMentorDoubts: React.FC = () => {
  const { isFeatureEnabled, isLoading: flagsLoading } = useFeatureFlags();
  const { data: assignment, isLoading: assignmentLoading } = useMyMentor();
  const { data: doubts = [], isLoading: doubtsLoading } = useMyDoubts();
  const create = useCreateDoubt();
  const cancel = useCancelDoubt();
  const [draft, setDraft] = useState('');

  // Wait for flags before rendering anything — avoids a flicker.
  if (flagsLoading) return null;
  if (!isFeatureEnabled('mentors_enabled')) return null;

  const mentor = assignment?.profiles;
  const canSubmit = draft.trim().length > 0 && draft.length <= 200;

  const onSend = async () => {
    try {
      await create.mutateAsync({ question: draft });
      setDraft('');
      toast.success(`Sent to ${mentor?.full_name?.split(' ')[0] ?? 'your mentor'}`);
    } catch (e) {
      toast.error(String((e as Error)?.message ?? e));
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">Ask your mentor</h3>
          <p className="text-xs text-muted-foreground">
            {assignmentLoading
              ? 'Loading…'
              : mentor
              ? `Send a short question to ${mentor.full_name ?? 'your mentor'} — they'll reply in-app.`
              : "You don't have a mentor assigned yet. An admin will assign one shortly."}
          </p>
        </div>
        {mentor && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={mentor.avatar_url ?? undefined} />
            <AvatarFallback className="bg-gradient-to-br from-amber-800/30 to-transparent text-xs font-semibold text-primary">
              {initials(mentor.full_name)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      {mentor && (
        <div className="mt-4">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, 200))}
            placeholder="Keep it short — 200 chars. Your mentor will get a notification."
            rows={2}
            className="resize-none"
          />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span
              className={
                draft.length >= 200
                  ? 'text-destructive'
                  : draft.length >= 170
                  ? 'text-orange-500'
                  : ''
              }
            >
              {draft.length} / 200
            </span>
            <Button
              size="sm"
              onClick={onSend}
              disabled={!canSubmit || create.isPending}
            >
              {create.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                'Send to mentor'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Inbox */}
      {doubts.length > 0 && (
        <div className="mt-5 space-y-2 border-t border-border pt-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Your questions
          </div>
          {doubtsLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            doubts.map((d) => {
              const meta = statusMeta[d.status];
              return (
                <div
                  key={d.id}
                  className="rounded-md border border-border bg-muted/20 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[13px]">{d.question}</div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${meta.badge}`}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    Asked {formatRelative(d.created_at)}
                  </div>
                  <Replies doubtId={d.id} />
                  {d.status === 'open' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 h-auto px-2 py-1 text-[11px] text-muted-foreground hover:text-destructive"
                      onClick={async () => {
                        try {
                          await cancel.mutateAsync({ doubtId: d.id });
                          toast.success('Cancelled');
                        } catch (e) {
                          toast.error(`Could not cancel: ${String(e)}`);
                        }
                      }}
                    >
                      Cancel question
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </Card>
  );
};

export default MyMentorDoubts;

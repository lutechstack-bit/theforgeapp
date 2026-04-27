import React from 'react';
import { Loader2, X, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import {
  useCardsSentToStudent,
  useRetractMentorCard,
  type TargetedCardRow,
} from '@/hooks/useTargetedCards';

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

const statusFor = (c: TargetedCardRow): { label: string; tone: string } => {
  if (c.is_dismissed) return { label: 'Dismissed', tone: 'text-muted-foreground' };
  if (c.is_auto_expired) return { label: 'Auto-expired', tone: 'text-green-500' };
  return { label: 'Active', tone: 'text-primary' };
};

const channels = (c: TargetedCardRow): string => {
  const bits: string[] = [];
  if (c.delivered_as_card) bits.push('home card');
  if (c.delivered_as_push) bits.push('push');
  return bits.join(' + ');
};

/**
 * Mentor-side audit log: "what have I sent this student".
 *
 * Shows recent targeted_cards the mentor sent (active, dismissed, or
 * auto-expired by the trigger when a linked submission arrived). Each
 * active card has a Retract button that flips is_dismissed.
 */
export const SentCardsLog: React.FC<{
  studentId: string;
  studentFirstName: string;
}> = ({ studentId, studentFirstName }) => {
  const { data: cards = [], isLoading } = useCardsSentToStudent(studentId);
  const retract = useRetractMentorCard();

  if (isLoading) {
    return (
      <Card className="p-5">
        <Skeleton className="h-16 w-full" />
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Sent to {studentFirstName}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Cards and pushes you've sent. Retract anything still active.
          </p>
        </div>
        {cards.length > 0 && (
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {cards.length} item{cards.length === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {cards.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          You haven't sent {studentFirstName} any cards yet. Use the "Send notification / card"
          button up top.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {cards.map((c) => {
            const status = statusFor(c);
            const canRetract = !c.is_dismissed && !c.is_auto_expired;
            const onRetract = async () => {
              try {
                await retract.mutateAsync({ cardId: c.id });
                toast.success('Card retracted');
              } catch (e) {
                toast.error(`Could not retract: ${String(e)}`);
              }
            };
            return (
              <li key={c.id} className="flex items-start gap-3 py-3">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-muted text-base">
                  {c.icon ?? '💬'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{c.title}</span>
                    <span
                      className={`shrink-0 rounded-full border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${status.tone}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div className="mt-0.5 line-clamp-2 text-[12.5px] text-muted-foreground">
                    {c.body}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    <span>{formatRelative(c.created_at)}</span>
                    <span>·</span>
                    <span>{channels(c)}</span>
                    {c.cta_url && (
                      <>
                        <span>·</span>
                        <a
                          href={c.cta_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-0.5 text-primary hover:underline"
                        >
                          {c.cta_label || 'Open link'}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </>
                    )}
                  </div>
                </div>
                {canRetract && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={onRetract}
                    disabled={retract.isPending}
                  >
                    {retract.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <X className="mr-1 h-3 w-3" />
                        Retract
                      </>
                    )}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

import React from 'react';
import { X, ExternalLink } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import {
  useMyActiveTargetedCards,
  useDismissTargetedCard,
} from '@/hooks/useTargetedCards';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

const initials = (name: string | null | undefined) =>
  (name ?? '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

/**
 * Stack of active cards targeted at the current user — from their mentor
 * or an admin. Safe to drop onto any authenticated page; self-gates on
 * `mentors_enabled`.
 */
const MentorCardsStack: React.FC = () => {
  const { isFeatureEnabled, isLoading: flagsLoading } = useFeatureFlags();
  const { data: cards = [], isLoading } = useMyActiveTargetedCards();
  const dismiss = useDismissTargetedCard();

  if (flagsLoading) return null;
  if (!isFeatureEnabled('mentors_enabled')) return null;
  if (isLoading && cards.length === 0) {
    return <Skeleton className="h-28 w-full" />;
  }
  if (cards.length === 0) return null;

  return (
    <div className="space-y-3">
      {cards.map((c) => {
        const mentorName = c.source_profile?.full_name ?? (c.source === 'mentor' ? 'your mentor' : 'admin');
        const onDismiss = async () => {
          try {
            await dismiss.mutateAsync({ cardId: c.id });
          } catch (e) {
            toast.error(`Could not dismiss: ${String(e)}`);
          }
        };
        return (
          <Card
            key={c.id}
            className="relative flex min-h-32 overflow-hidden border-primary/25"
          >
            <div className="grid w-24 shrink-0 place-items-center bg-gradient-to-br from-amber-900/30 to-amber-950/5 text-3xl">
              {c.icon ?? '💬'}
            </div>
            <div className="flex-1 p-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={c.source_profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-[9px]">
                    {initials(c.source_profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {c.source === 'admin' ? 'From admin' : 'From your mentor'} · {mentorName}
                </div>
              </div>
              <div className="mt-1.5 text-sm font-semibold leading-snug">{c.title}</div>
              <div className="mt-1 text-[13px] leading-snug text-muted-foreground">
                {c.body}
              </div>
              {c.cta_label && c.cta_url && (
                <Button size="sm" className="mt-3" asChild>
                  <a href={c.cta_url} target="_blank" rel="noreferrer">
                    {c.cta_label} <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </Card>
        );
      })}
    </div>
  );
};

export default MentorCardsStack;

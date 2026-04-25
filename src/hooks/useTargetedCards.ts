import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { SubmissionFormKey } from '@/hooks/useSubmissions';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sb = supabase as any;

export type CardSource = 'admin' | 'mentor';

export type TargetedCardRow = {
  id: string;
  target_user_id: string;
  source: CardSource;
  source_user_id: string;
  title: string;
  body: string;
  cta_label: string | null;
  cta_url: string | null;
  icon: string | null;
  template_key: string | null;
  linked_form_key: SubmissionFormKey | null;
  linked_submission_id: string | null;
  is_dismissed: boolean;
  is_auto_expired: boolean;
  dismissed_at: string | null;
  expires_at: string | null;
  delivered_as_push: boolean;
  delivered_as_card: boolean;
  created_at: string;
  updated_at: string;
  source_profile?: { id: string; full_name: string | null; avatar_url: string | null } | null;
};

// ────────────────────────────────────────────────────────────────────────
// Student side — cards targeted at me
// ────────────────────────────────────────────────────────────────────────

/**
 * All active cards targeted at the current user (not dismissed, not
 * auto-expired). The home / profile surfaces render these.
 */
export const useMyActiveTargetedCards = () => {
  const { user } = useAuth();
  return useQuery<TargetedCardRow[]>({
    queryKey: ['targeted-cards', 'mine', user?.id],
    queryFn: async () => {
      const { data, error } = await sb
        .from('targeted_cards')
        .select(`
          *,
          source_profile:profiles!targeted_cards_source_user_id_fkey (
            id, full_name, avatar_url
          )
        `)
        .eq('target_user_id', user!.id)
        .eq('is_dismissed', false)
        .eq('is_auto_expired', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as TargetedCardRow[];
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000,
  });
};

export const useDismissTargetedCard = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { cardId: string }) => {
      const { error } = await sb
        .from('targeted_cards')
        .update({ is_dismissed: true, dismissed_at: new Date().toISOString() })
        .eq('id', args.cardId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['targeted-cards'] });
    },
  });
};

// ────────────────────────────────────────────────────────────────────────
// Mentor side — sending + auditing
// ────────────────────────────────────────────────────────────────────────

export type SendCardArgs = {
  targetUserId: string;
  title: string;
  body: string;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  icon?: string | null;
  templateKey?: string | null;
  linkedFormKey?: SubmissionFormKey | null;
  deliveredAsPush: boolean;
  deliveredAsCard: boolean;
};

/**
 * Mentor sends a card to one of their students. If push delivery is
 * selected, we also write a `notifications` row so the student gets an
 * in-app ping through the existing notification surface.
 */
export const useSendMentorCard = () => {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (args: SendCardArgs) => {
      if (!user?.id) throw new Error('Not authenticated');
      const title = args.title.trim();
      const body = args.body.trim();
      if (!title) throw new Error('Title is required');
      if (title.length > 80) throw new Error('Title too long (max 80)');
      if (!body) throw new Error('Body is required');
      if (body.length > 300) throw new Error('Body too long (max 300)');
      if (args.ctaLabel && args.ctaLabel.length > 30)
        throw new Error('CTA label too long (max 30)');
      if (!args.deliveredAsPush && !args.deliveredAsCard)
        throw new Error('Pick at least one delivery channel');

      // Insert the card (only if deliveredAsCard is true we actually want
      // the home-card surface to show it — but we always write the row
      // since it's the audit record for the mentor's "sent" log).
      const { data: card, error: cardErr } = await sb
        .from('targeted_cards')
        .insert({
          target_user_id: args.targetUserId,
          source: 'mentor',
          source_user_id: user.id,
          title,
          body,
          cta_label: args.ctaLabel ?? null,
          cta_url: args.ctaUrl ?? null,
          icon: args.icon ?? null,
          template_key: args.templateKey ?? null,
          linked_form_key: args.linkedFormKey ?? null,
          delivered_as_push: args.deliveredAsPush,
          delivered_as_card: args.deliveredAsCard,
        })
        .select()
        .single();
      if (cardErr) throw cardErr;

      // Fan-out to notifications if push requested.
      if (args.deliveredAsPush) {
        const { error: notifErr } = await sb.from('notifications').insert({
          user_id: args.targetUserId,
          type: 'SYSTEM',
          title,
          message: body,
          link: args.ctaUrl ?? null,
          is_global: false,
        });
        // Notification failure shouldn't roll back the card — log and
        // continue. The card is the source of truth.
        if (notifErr) console.warn('Notification write failed:', notifErr);
      }

      return card as TargetedCardRow;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['targeted-cards'] });
      qc.invalidateQueries({
        queryKey: ['targeted-cards', 'sent-by-mentor-to', vars.targetUserId],
      });
    },
  });
};

/**
 * Cards the current mentor has ever sent to a specific student, for
 * the "Sent" audit log on the workspace.
 */
export const useCardsSentToStudent = (studentId: string | null | undefined) => {
  const { user } = useAuth();
  return useQuery<TargetedCardRow[]>({
    queryKey: ['targeted-cards', 'sent-by-mentor-to', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const { data, error } = await sb
        .from('targeted_cards')
        .select('*')
        .eq('target_user_id', studentId)
        .eq('source_user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(25);
      if (error) throw error;
      return (data ?? []) as TargetedCardRow[];
    },
    enabled: !!studentId && !!user?.id,
    staleTime: 30 * 1000,
  });
};

/**
 * Mentor retracts (dismisses) a card they sent.
 */
export const useRetractMentorCard = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { cardId: string }) => {
      const { error } = await sb
        .from('targeted_cards')
        .update({ is_dismissed: true, dismissed_at: new Date().toISOString() })
        .eq('id', args.cardId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['targeted-cards'] });
    },
  });
};

// ────────────────────────────────────────────────────────────────────────
// Frontend-owned templates
// ────────────────────────────────────────────────────────────────────────

export type MentorCardTemplate = {
  key: string;
  label: string;
  icon: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  linkedFormKey?: SubmissionFormKey;
};

/**
 * Mentor-triggerable templates. Kept in code (not DB) for now — can move
 * to a templates table later.
 */
export const MENTOR_CARD_TEMPLATES: MentorCardTemplate[] = [
  {
    key: 'nudge-submission',
    label: 'Nudge on submission',
    icon: '⏰',
    title: "Quick nudge — haven't seen your draft yet",
    body: "You're close. Once you submit, I can give you feedback before the next session. Aim to get it in today.",
    ctaLabel: 'Submit now →',
    ctaUrl: '',
    linkedFormKey: 'script',
  },
  {
    key: 'congrats',
    label: 'Congrats note',
    icon: '🎉',
    title: 'Really strong work on this one',
    body: "Just wanted to say — what you did in scene 7 is exactly what I was hoping you'd find. Keep pulling that thread.",
    ctaLabel: '',
    ctaUrl: '',
  },
  {
    key: 'checkin',
    label: '1:1 check-in',
    icon: '📅',
    title: "Let's jump on a 20-min call this week",
    body: "Want to walk through where you're stuck. Pick a slot that works and we'll iron it out together.",
    ctaLabel: 'Book a slot →',
    ctaUrl: 'https://calendly.com/leveluplearningindia/theforge-script-mentorship',
  },
  {
    key: 'resource',
    label: 'Send a resource',
    icon: '📎',
    title: 'Watch this before your next draft',
    body: "Reminded me of what you're going for in the second act. Short watch — borrow what resonates, leave the rest.",
    ctaLabel: 'Open link →',
    ctaUrl: 'https://',
  },
  {
    key: 'blank',
    label: 'Start blank',
    icon: '✏️',
    title: '',
    body: '',
    ctaLabel: '',
    ctaUrl: '',
  },
];

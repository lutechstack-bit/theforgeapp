import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useEffectiveCohort } from '@/hooks/useEffectiveCohort';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';
import { promiseWithTimeout } from '@/lib/promiseTimeout';

export interface FocusCard {
  id: string;
  title: string;
  description: string | null;
  cta_text: string;
  cta_route: string;
  icon_emoji: string | null;
  priority: number;
  auto_detect_field: string | null;
  cohort_types: string[] | null;
  is_active: boolean;
  order_index: number;
}

export const useTodaysFocus = () => {
  const { profile, userDataLoading } = useAuth();
  const { effectiveCohortType } = useEffectiveCohort();
  const userCohortType = effectiveCohortType;

  const { data: focusCards, isLoading } = useQuery({
    queryKey: ['today-focus-cards'],
    queryFn: async () => {
      const result = await promiseWithTimeout(
        supabase
          .from('today_focus_cards')
          .select('*')
          .eq('is_active', true)
          .order('priority', { ascending: false })
          .order('order_index', { ascending: true })
          .then(res => res),
        10000,
        'today_focus_cards'
      );
      if (result.error) throw result.error;
      return result.data as FocusCard[];
    },
    staleTime: 5 * 60 * 1000,
    enabled: !userDataLoading,
  });

  // Find the highest-priority card that applies to this user
  const activeFocusCard = useMemo(() => {
    if (!focusCards || !profile) return null;

    for (const card of focusCards) {
      // Check cohort filter
      if (card.cohort_types && card.cohort_types.length > 0 && userCohortType) {
        if (!card.cohort_types.includes(userCohortType)) continue;
      }

      // Check auto-detect field (if the profile field is falsy, show the card)
      if (card.auto_detect_field) {
        const fieldValue = (profile as any)[card.auto_detect_field];
        if (fieldValue) continue; // Already completed, skip
      }

      return card;
    }

    return null;
  }, [focusCards, profile, userCohortType]);

  return {
    activeFocusCard,
    isLoading: isLoading || userDataLoading,
  };
};

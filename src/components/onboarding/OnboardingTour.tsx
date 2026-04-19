import React, { useEffect, useState } from 'react';
import Joyride, { ACTIONS, CallBackProps, EVENTS, STATUS, Step } from 'react-joyride';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * OnboardingTour — a short first-time walkthrough built on react-joyride.
 *
 * Source of truth: profiles.has_seen_tour (boolean, nullable). The tour fires
 * exactly when that flag is null or false; on completion/skip we persist
 * `has_seen_tour = true` so subsequent logins are silent. Admins can reset
 * the flag in bulk from the Admin → Controls panel, and any user can replay
 * the tour from the avatar dropdown via useRestartTour() below.
 */

// Tour copy. Each step targets a data-tour="..." attribute on an existing
// element in the layout (see SideNav.tsx + TopProfileDropdown.tsx).
// Every sidebar target must force 'right' placement — the sidebar is flush to
// the left edge of the viewport, so if we leave placement on 'auto' Joyride
// may pick 'left' and the tooltip gets clipped off-screen.
const STEPS: Step[] = [
  {
    target: 'body',
    placement: 'center',
    title: 'Welcome to the Forge 👋',
    content: "Quick tour — under a minute. Let's show you around.",
    disableBeacon: true,
  },
  {
    target: '[data-tour="home"]',
    content:
      "Announcements, today's focus, and what's coming next for your cohort — it all lives here.",
    disableBeacon: true,
    placement: 'right',
  },
  {
    target: '[data-tour="roadmap"]',
    content:
      'Your full journey — every online session and bootcamp day with its date, Zoom link, and recording once the session is done.',
    disableBeacon: true,
    placement: 'right',
  },
  {
    target: '[data-tour="learn"]',
    content:
      "After every online class, the recording appears here the next day or two so you can rewatch it. Your Orientation recording is already up — hit play when you're done here and get started.",
    disableBeacon: true,
    placement: 'right',
  },
  {
    target: '[data-tour="community"]',
    content: 'Find your batchmates, start a conversation, and team up for projects.',
    disableBeacon: true,
    placement: 'right',
  },
  {
    target: '[data-tour="profile-menu"]',
    content: 'Edit your profile, restart this tour anytime, or sign out from here.',
    disableBeacon: true,
    placement: 'bottom-end',
  },
];

// Joyride styling tuned to the Forge amber + dark palette. Tooltip has a
// fixed comfortable width so copy doesn't wrap into 1–2 ugly words per line.
const JOYRIDE_STYLES = {
  options: {
    primaryColor: '#FFBF00',
    backgroundColor: '#0F0F10',
    textColor: '#F5F5F5',
    arrowColor: '#0F0F10',
    overlayColor: 'rgba(0, 0, 0, 0.65)',
    zIndex: 10000,
    width: 360,
  },
  tooltip: {
    borderRadius: 14,
    border: '1px solid rgba(255, 191, 0, 0.25)',
    padding: 20,
    maxWidth: 'calc(100vw - 32px)' as any,
    boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,191,0,0.12)',
  },
  tooltipContainer: { textAlign: 'left' as const },
  tooltipTitle: { fontSize: 17, fontWeight: 700, marginBottom: 8 },
  tooltipContent: { fontSize: 14, lineHeight: 1.55, padding: 0 },
  buttonNext: {
    backgroundColor: '#FFBF00',
    color: '#0F0F10',
    fontWeight: 600,
    borderRadius: 8,
    padding: '8px 14px',
  },
  buttonBack: { color: '#FFBF00', marginRight: 8 },
  buttonSkip: { color: '#9CA3AF' },
  buttonClose: { top: 10, right: 10 },
  spotlight: { borderRadius: 12 },
};

// localStorage fallback so even if the DB update fails (RLS, flaky network),
// a same-browser return visit is still silent. Keyed per user id.
const LS_KEY = (userId: string) => `forge.onboarding.seen.${userId}`;

const hasSeenLocally = (userId?: string): boolean => {
  if (!userId || typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(LS_KEY(userId)) === 'true';
  } catch {
    return false;
  }
};

const markSeenLocally = (userId?: string) => {
  if (!userId || typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_KEY(userId), 'true');
  } catch {
    /* storage full / blocked — ignore */
  }
};

const clearSeenLocally = (userId?: string) => {
  if (!userId || typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LS_KEY(userId));
  } catch {
    /* ignore */
  }
};

// Hook — reads profiles.has_seen_tour for the current user, OR the
// localStorage fallback set after the tour ends.
export const useHasSeenTour = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['onboarding-tour', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      // Local fallback wins for "already seen" — prevents DB hiccups re-showing
      // the tour on every visit.
      if (hasSeenLocally(user.id)) return true;
      const { data, error } = await supabase
        .from('profiles')
        .select('has_seen_tour')
        .eq('id', user.id)
        .single();
      if (error) {
        console.error('[OnboardingTour] Could not read has_seen_tour:', error);
        return false;
      }
      return data?.has_seen_tour ?? false;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook — returns a function any component can call to replay the tour.
// Sets has_seen_tour = false on the profile and invalidates the query
// so the <OnboardingTour /> mounted in AppLayout re-evaluates and fires.
export const useRestartTour = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not signed in');
      clearSeenLocally(user.id);
      const { error } = await supabase
        .from('profiles')
        .update({ has_seen_tour: false })
        .eq('id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-tour', user?.id] });
      // Make sure the sidebar targets are on screen for the first step.
      navigate('/');
    },
  });

  return () => mutation.mutate();
};

const OnboardingTour: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: hasSeenTour, isLoading } = useHasSeenTour();
  const [run, setRun] = useState(false);

  // Delay firing slightly on mount so the sidebar + profile menu render first
  // (otherwise joyride prints "target not found" warnings on the first step).
  useEffect(() => {
    if (isLoading || !user) return;
    if (hasSeenTour === false || hasSeenTour === null) {
      const t = setTimeout(() => setRun(true), 600);
      return () => clearTimeout(t);
    }
    setRun(false);
  }, [hasSeenTour, isLoading, user]);

  const handleCallback = async (data: CallBackProps) => {
    const { status, type, action } = data;

    // Tour ended for any reason: completed, skipped, closed via X, or the
    // tour:end event (fires whenever Joyride tears down). Persist + mark
    // locally so it never re-shows on next visit.
    const terminalStatus =
      status === STATUS.FINISHED ||
      status === STATUS.SKIPPED ||
      (status as unknown as string) === 'error';
    const closedByUser = action === ACTIONS.CLOSE && type === EVENTS.STEP_AFTER;
    const tourEnded = type === EVENTS.TOUR_END;

    if (terminalStatus || closedByUser || tourEnded) {
      setRun(false);
      if (user?.id) {
        // Optimistic local cache so the next page load is instantly silent,
        // even before the DB update round-trips.
        markSeenLocally(user.id);
        queryClient.setQueryData(['onboarding-tour', user.id], true);

        const { error } = await supabase
          .from('profiles')
          .update({ has_seen_tour: true })
          .eq('id', user.id);
        if (error) {
          // Surface so we can debug RLS / permissions issues — but the
          // localStorage fallback above already guarantees the user won't
          // see the tour again on this browser.
          console.error('[OnboardingTour] Failed to persist has_seen_tour:', error);
        }
        queryClient.invalidateQueries({ queryKey: ['onboarding-tour', user.id] });
      }
    }
  };

  // Never render if user isn't logged in or we haven't resolved the flag yet.
  if (!user || isLoading) return null;
  if (hasSeenTour === true) return null;

  return (
    <Joyride
      steps={STEPS}
      run={run}
      continuous
      showSkipButton
      showProgress
      disableScrolling={false}
      disableCloseOnEsc={false}
      scrollToFirstStep
      spotlightPadding={6}
      floaterProps={{
        // Gives tooltip a small gap from the target so the arrow and target
        // aren't crammed together
        offset: 14,
        styles: { floater: { filter: 'none' } },
      }}
      styles={JOYRIDE_STYLES}
      locale={{ back: 'Back', close: 'Close', last: 'Finish', next: 'Next', skip: 'Skip' }}
      callback={handleCallback}
    />
  );
};

export default OnboardingTour;

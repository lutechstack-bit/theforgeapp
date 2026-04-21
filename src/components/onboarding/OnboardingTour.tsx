import React, { useEffect, useState } from 'react';
import Joyride, { ACTIONS, CallBackProps, EVENTS, STATUS, Step } from 'react-joyride';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ForgeTooltip } from './ForgeTooltip';

/**
 * OnboardingTour is a short first-time walkthrough built on react-joyride.
 *
 * Source of truth is profiles.has_seen_tour (boolean, nullable). The tour
 * fires exactly when that flag is null or false; on completion or skip we
 * persist has_seen_tour = true so subsequent logins are silent. Admins can
 * reset the flag in bulk from the Admin Controls panel, and any user can
 * replay the tour from the avatar dropdown via useRestartTour() below.
 *
 * Every step uses placement "center" so the tooltip always sits in the
 * middle of the viewport and can never be clipped on narrow screens. The
 * spotlight ring still highlights the target element through the overlay,
 * so users can see which nav item or control each step is about.
 */

// Both the desktop sidebar (SideNav.tsx) and the mobile bottom nav
// (BottomNav.tsx) carry data-tour="..." attributes so the same step targets
// work on every device. If an attribute isn't present on the current layout,
// Joyride falls back gracefully to showing the tooltip without a spotlight.
//
// Placement rules:
//   - Welcome step (target 'body') uses 'center' for a modal-style opener.
//   - Every other step uses 'auto' so Joyride can cut a spotlight over the
//     actual nav item and position the tooltip in the best available space.
//     Our custom tooltip has its own max-width (min(92vw, 440px)) so it
//     never clips regardless of which side Joyride picks.
const STEPS: Step[] = [
  {
    target: 'body',
    placement: 'center',
    title: 'Welcome to the Forge',
    content: "Quick tour in under a minute. We'll show you around the app.",
    disableBeacon: true,
  },
  {
    target: '[data-tour="home"]',
    placement: 'auto',
    title: 'Home',
    content:
      "Announcements, today's focus, and what's coming next for your cohort. It all lives here.",
    disableBeacon: true,
  },
  {
    target: '[data-tour="roadmap"]',
    placement: 'auto',
    title: 'Roadmap',
    content:
      'Your full journey. Every online session and bootcamp day with its date, Zoom link, and recording once the session is done.',
    disableBeacon: true,
  },
  {
    target: '[data-tour="learn"]',
    placement: 'auto',
    title: 'Learn',
    content:
      "After every online class, the recording appears here in a day or two so you can rewatch it. Your Orientation recording is already up. Hit play when you're done here and get started.",
    disableBeacon: true,
  },
  {
    target: '[data-tour="community"]',
    placement: 'auto',
    title: 'Community',
    content: 'Find your batchmates, start a conversation, and team up for projects.',
    disableBeacon: true,
  },
  {
    target: '[data-tour="profile-menu"]',
    placement: 'auto',
    title: 'Your profile',
    content: 'Edit your profile, restart this tour anytime, or sign out from here.',
    disableBeacon: true,
  },
];

// Joyride styles scoped to what the custom ForgeTooltip doesn't already
// control: the dark page overlay and the spotlight ring around the active
// nav target. All tooltip styling lives inside ForgeTooltip.tsx.
//
// Spotlight ring uses a fat amber glow so students immediately see which
// nav item the current step is talking about, even on busy pages.
const JOYRIDE_STYLES = {
  options: {
    primaryColor: '#FFBF00',
    zIndex: 10000,
    overlayColor: 'rgba(0, 0, 0, 0.75)',
    arrowColor: '#0F0F10',
  },
  spotlight: {
    borderRadius: 16,
    boxShadow:
      '0 0 0 4px rgba(255, 191, 0, 0.55), 0 0 32px rgba(255, 191, 0, 0.35)',
  },
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
    /* storage full or blocked, ignore */
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

// Hook that reads profiles.has_seen_tour for the current user, or the
// localStorage fallback set after the tour ends.
export const useHasSeenTour = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['onboarding-tour', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      // Local fallback wins for "already seen" so DB hiccups don't re-show
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

// Hook that returns a function any component can call to replay the tour.
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
          // Surface so we can debug RLS / permissions issues. The
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
      disableScrolling={false}
      disableCloseOnEsc={false}
      scrollToFirstStep
      spotlightPadding={10}
      tooltipComponent={ForgeTooltip}
      floaterProps={{
        // Keep the tooltip 16px away from the spotlight so the amber ring
        // is fully visible and the arrow has room. The filter reset avoids
        // doubling up Joyride's default glow with our custom shadow.
        offset: 16,
        styles: { floater: { filter: 'none' } },
      }}
      styles={JOYRIDE_STYLES}
      locale={{ back: 'Back', close: 'Close', last: "Let's go", next: 'Next', skip: 'Skip' }}
      callback={handleCallback}
    />
  );
};

export default OnboardingTour;

import React, { useEffect, useState } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
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
  },
  {
    target: '[data-tour="roadmap"]',
    content:
      'Your full journey — every online session and bootcamp day with its date, Zoom link, and recording once the session is done.',
    disableBeacon: true,
  },
  {
    target: '[data-tour="learn"]',
    content:
      "After every online class, the recording appears here the next day or two so you can rewatch it. Your Orientation recording is already up — hit play when you're done here and get started.",
    disableBeacon: true,
  },
  {
    target: '[data-tour="community"]',
    content: 'Find your batchmates, start a conversation, and team up for projects.',
    disableBeacon: true,
  },
  {
    target: '[data-tour="profile-menu"]',
    content: 'Edit your profile, restart this tour anytime, or sign out from here.',
    disableBeacon: true,
    placement: 'bottom-end',
  },
];

// Joyride styling tuned to the Forge amber + dark palette.
const JOYRIDE_STYLES = {
  options: {
    primaryColor: '#FFBF00',
    backgroundColor: '#0F0F10',
    textColor: '#F5F5F5',
    arrowColor: '#0F0F10',
    overlayColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 10000,
  },
  buttonNext: {
    backgroundColor: '#FFBF00',
    color: '#0F0F10',
    fontWeight: 600,
    borderRadius: 8,
  },
  buttonBack: { color: '#FFBF00' },
  buttonSkip: { color: '#9CA3AF' },
  tooltip: {
    borderRadius: 12,
    border: '1px solid rgba(255, 191, 0, 0.15)',
  },
  tooltipTitle: { fontSize: 18, fontWeight: 700 },
};

// Hook — reads profiles.has_seen_tour for the current user.
export const useHasSeenTour = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['onboarding-tour', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('has_seen_tour')
        .eq('id', user.id)
        .single();
      if (error) throw error;
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
    const { status } = data;
    const done: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    if (done.includes(status)) {
      setRun(false);
      if (user?.id) {
        await supabase.from('profiles').update({ has_seen_tour: true }).eq('id', user.id);
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
      styles={JOYRIDE_STYLES}
      locale={{ back: 'Back', close: 'Close', last: 'Finish', next: 'Next', skip: 'Skip' }}
      callback={handleCallback}
    />
  );
};

export default OnboardingTour;

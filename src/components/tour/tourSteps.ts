export interface TourStep {
  targetSelector: string;
  mobileSelector?: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

export const tourSteps: TourStep[] = [
  {
    targetSelector: '[data-tour="home-nav"]',
    mobileSelector: '[data-tour="home-nav-mobile"]',
    title: '🏠 Your Home Base',
    description: 'See announcements, upcoming sessions, your journey progress, and everything happening in your cohort — all in one place.',
    position: 'right',
  },
  {
    targetSelector: '[data-tour="community-nav"]',
    mobileSelector: '[data-tour="community-nav-mobile"]',
    title: '💬 Community',
    description: 'Chat with your batchmates, share ideas, post gigs, and discover fellow creatives in your city.',
    position: 'right',
  },
  {
    targetSelector: '[data-tour="roadmap-nav"]',
    mobileSelector: '[data-tour="roadmap-nav-mobile"]',
    title: '🗺️ Your Roadmap',
    description: 'Track your Forge journey — prep checklist, equipment list, daily schedule, rules, and everything you need before Day 1.',
    position: 'right',
  },
  {
    targetSelector: '[data-tour="learn-nav"]',
    mobileSelector: '[data-tour="learn-nav-mobile"]',
    title: '🎬 Learn',
    description: 'Watch masterclasses, community sessions, and exclusive content from industry mentors.',
    position: 'right',
  },
  {
    targetSelector: '[data-tour="profile-dropdown"]',
    title: '👤 Your Profile',
    description: 'View and edit your profile, portfolio, and account settings. This is your creative identity.',
    position: 'bottom',
  },
];

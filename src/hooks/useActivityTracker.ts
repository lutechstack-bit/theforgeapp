import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const PAGE_NAME_MAP: Record<string, string> = {
  '/': 'Home',
  '/community': 'Community',
  '/learn': 'Learn',
  '/learn/all': 'All Courses',
  '/events': 'Events',
  '/roadmap': 'Roadmap',
  '/roadmap/tasks': 'Roadmap Tasks',
  '/roadmap/prep': 'Roadmap Prep',
  '/roadmap/equipment': 'Roadmap Equipment',
  '/roadmap/rules': 'Roadmap Rules',
  '/roadmap/gallery': 'Roadmap Gallery',
  '/roadmap/films': 'Roadmap Films',
  '/perks': 'Perks',
  '/updates': 'Updates',
  '/profile': 'Profile',
  '/my-kyform': 'My KY Form',
  '/welcome': 'Welcome',
  '/profile-setup': 'Profile Setup',
};

function getPageName(path: string): string {
  if (PAGE_NAME_MAP[path]) return PAGE_NAME_MAP[path];
  if (path.startsWith('/learn/')) return 'Course Detail';
  if (path.startsWith('/events/')) return 'Event Detail';
  if (path.startsWith('/perks/')) return 'Perk Detail';
  if (path.startsWith('/ky-section/')) return 'KY Section';
  if (path.startsWith('/portfolio/')) return 'Public Portfolio';
  return path;
}

function logActivity(userId: string, eventType: string, pagePath?: string, pageName?: string) {
  // Fire-and-forget — don't block UI
  supabase
    .from('user_activity_logs')
    .insert({
      user_id: userId,
      event_type: eventType,
      page_path: pagePath || null,
      page_name: pageName || null,
      metadata: {
        user_agent: navigator.userAgent,
        screen_width: window.innerWidth,
      },
    })
    .then(({ error }) => {
      if (error) console.warn('[ActivityTracker] Insert error:', error.message);
    });
}

export function useActivityTracker() {
  const { user } = useAuth();
  const location = useLocation();
  const lastPathRef = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;
    // Skip admin routes
    if (location.pathname.startsWith('/admin')) return;
    // Skip auth routes
    if (location.pathname === '/auth' || location.pathname === '/forgot-password' || location.pathname === '/reset-password') return;
    // Deduplicate
    if (lastPathRef.current === location.pathname) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      lastPathRef.current = location.pathname;
      const pageName = getPageName(location.pathname);
      logActivity(user.id, 'page_view', location.pathname, pageName);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [user, location.pathname]);
}

export function logLoginEvent(userId: string) {
  logActivity(userId, 'login', '/auth', 'Login');
}

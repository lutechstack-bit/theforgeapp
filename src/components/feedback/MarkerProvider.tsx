import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Marker.io project ID
const MARKER_PROJECT_ID = '696f7d063702deb92d871f48';

// Declare global Marker type with extended API
declare global {
  interface Window {
    Marker?: {
      show: () => void;
      hide: () => void;
      setReporter: (data: { email: string; fullName: string }) => void;
      clearReporter?: () => void;
      setCustomData: (data: Record<string, unknown>) => void;
      isVisible?: () => boolean;
    };
    markerConfig?: {
      project: string;
      source: string;
    };
  }
}

export const MarkerProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profileName, setProfileName] = useState<string>('');
  const [markerReady, setMarkerReady] = useState(false);

  // Helper to fetch profile name
  const loadProfileName = useCallback(async (userId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();
      setProfileName(profile?.full_name || '');
    } catch (error) {
      console.error('MarkerProvider: Error fetching profile name:', error);
      setProfileName('');
    }
  }, []);

  // Effect A: Wait for Marker to be ready (loaded via deferred script in index.html)
  useEffect(() => {
    // Check if Marker is already available
    if (window.Marker) {
      setMarkerReady(true);
      return;
    }

    // Poll for Marker availability (it loads deferred)
    const interval = setInterval(() => {
      if (window.Marker) {
        setMarkerReady(true);
        clearInterval(interval);
      }
    }, 500);

    // Stop polling after 30 seconds (Marker loads 2s after page load + network time)
    const timeout = setTimeout(() => {
      clearInterval(interval);
      if (!window.Marker) {
        console.warn('MarkerProvider: Marker.io did not load within expected time');
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Effect B: Always show Marker widget when ready (no auth gating)
  useEffect(() => {
    if (!markerReady || !window.Marker) return;
    
    // Always show the widget for everyone
    window.Marker.show();
  }, [markerReady]);

  // Effect C: Handle auth state and sync reporter/customData
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          await loadProfileName(user.id);
        }
      } catch (error) {
        console.error('MarkerProvider auth check error:', error);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (currentUser) {
        // User signed in - fetch their profile name
        await loadProfileName(currentUser.id);
      } else {
        // User signed out - clear profile name
        setProfileName('');
      }
    });

    return () => subscription.unsubscribe();
  }, [loadProfileName]);

  // Effect D: Sync reporter and customData based on auth state
  useEffect(() => {
    if (!markerReady || !window.Marker) return;

    if (user) {
      // Set reporter info for authenticated users
      window.Marker.setReporter({
        email: user.email || '',
        fullName: profileName || user.email?.split('@')[0] || 'User',
      });

      window.Marker.setCustomData({
        environment: import.meta.env.MODE,
        app: 'the-forge',
        userId: user.id,
        isAuthenticated: true,
        currentPath: window.location.pathname,
      });
    } else {
      // Clear reporter for anonymous users
      if (window.Marker.clearReporter) {
        window.Marker.clearReporter();
      }

      window.Marker.setCustomData({
        environment: import.meta.env.MODE,
        app: 'the-forge',
        isAuthenticated: false,
        currentPath: window.location.pathname,
      });
    }
  }, [markerReady, user, profileName]);

  return null;
};

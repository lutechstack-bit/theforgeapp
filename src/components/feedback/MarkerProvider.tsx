import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

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

/**
 * MarkerProvider - Initializes and syncs Marker.io feedback widget
 * 
 * IMPORTANT: This component now uses the centralized AuthContext instead of
 * making its own auth.getUser() network calls. This prevents slow auth endpoints
 * from blocking app startup or interfering with session restoration.
 */
export const MarkerProvider = () => {
  // Use centralized auth state - no direct Supabase auth calls
  const { user, profile } = useAuth();
  const markerReadyRef = useRef(false);

  // Effect A: Wait for Marker to be ready (loaded via deferred script in index.html)
  useEffect(() => {
    // Check if Marker is already available
    if (window.Marker) {
      markerReadyRef.current = true;
      window.Marker.show();
      return;
    }

    // Poll for Marker availability (it loads deferred)
    const interval = setInterval(() => {
      if (window.Marker) {
        markerReadyRef.current = true;
        window.Marker.show();
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

  // Effect B: Sync reporter and customData based on auth state from AuthContext
  useEffect(() => {
    if (!markerReadyRef.current || !window.Marker) return;

    // Always show the widget
    window.Marker.show();

    if (user) {
      // Get display name from profile (from AuthContext) or fallback to email
      const displayName = profile?.full_name || user.email?.split('@')[0] || 'User';
      
      // Set reporter info for authenticated users
      window.Marker.setReporter({
        email: user.email || '',
        fullName: displayName,
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
  }, [user, profile?.full_name]);

  // Effect C: Update path on navigation (lightweight)
  useEffect(() => {
    if (!markerReadyRef.current || !window.Marker) return;

    window.Marker.setCustomData({
      currentPath: window.location.pathname,
    });
  }, []);

  return null;
};

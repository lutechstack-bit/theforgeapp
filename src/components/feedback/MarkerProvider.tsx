import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';

// Declare global Marker type
declare global {
  interface Window {
    Marker?: {
      show: () => void;
      hide: () => void;
      setReporter: (data: { email: string; fullName: string }) => void;
      setCustomData: (data: Record<string, unknown>) => void;
    };
  }
}

export const MarkerProvider = () => {
  const { user, profile, edition } = useAuth();
  const { isAdmin, loading } = useAdminCheck();
  const [markerReady, setMarkerReady] = useState(false);

  // Poll for Marker.io to be ready
  useEffect(() => {
    if (window.Marker) {
      setMarkerReady(true);
      return;
    }

    const interval = setInterval(() => {
      if (window.Marker) {
        setMarkerReady(true);
        clearInterval(interval);
      }
    }, 100);

    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Show/hide widget based on admin status
  useEffect(() => {
    if (loading || !markerReady || !window.Marker) return;

    if (isAdmin) {
      window.Marker.show();

      if (user && profile) {
        window.Marker.setReporter({
          email: user.email || '',
          fullName: profile.full_name || 'Admin User',
        });
      }

      window.Marker.setCustomData({
        environment: import.meta.env.MODE,
        app: 'the-forge',
        userId: user?.id,
        editionId: edition?.id || 'Unknown',
        cohortType: edition?.cohort_type || 'Unknown',
      });
    } else {
      window.Marker.hide();
    }
  }, [isAdmin, loading, markerReady, user, profile, edition]);

  return null;
};

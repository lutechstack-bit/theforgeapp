import { useEffect } from 'react';
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

  useEffect(() => {
    // Wait for Marker to be available and admin check to complete
    if (loading || !window.Marker) return;

    if (isAdmin) {
      // Show widget for admins
      window.Marker.show();

      // Set reporter info
      if (user && profile) {
        window.Marker.setReporter({
          email: user.email || '',
          fullName: profile.full_name || 'Admin User',
        });
      }

      // Set custom data
      window.Marker.setCustomData({
        environment: import.meta.env.MODE,
        app: 'the-forge',
        userId: user?.id,
        editionId: edition?.id || 'Unknown',
        cohortType: edition?.cohort_type || 'Unknown',
      });
    } else {
      // Hide widget for non-admins
      window.Marker.hide();
    }
  }, [isAdmin, loading, user, profile, edition]);

  return null;
};

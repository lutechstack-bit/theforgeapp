import { useEffect, useRef } from 'react';
import markerSDK, { MarkerSdk } from '@marker.io/browser';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminCheck } from '@/hooks/useAdminCheck';

const MARKER_PROJECT_ID = '696e53c76b5f86121a1b7612';

export const MarkerProvider = () => {
  const { user, profile, edition } = useAuth();
  const { isAdmin, loading } = useAdminCheck();
  const widgetRef = useRef<MarkerSdk | null>(null);

  useEffect(() => {
    // Only initialize for admin users
    if (loading || !isAdmin) return;
    if (widgetRef.current) return;

    const initMarker = async () => {
      const widget = await markerSDK.loadWidget({
        project: MARKER_PROJECT_ID,
      });

      widgetRef.current = widget;

      // Auto-fill reporter info
      if (user && profile) {
        widget.setReporter({
          email: user.email || '',
          fullName: profile.full_name || 'Admin User',
        });
      }

      // Add custom context data
      widget.setCustomData({
        environment: import.meta.env.MODE,
        app: 'the-forge',
        userId: user?.id,
        editionId: edition?.id || 'Unknown',
        cohortType: edition?.cohort_type || 'Unknown',
      });
    };

    initMarker();

    // Cleanup on unmount
    return () => {
      if (widgetRef.current) {
        widgetRef.current.unload();
        widgetRef.current = null;
      }
    };
  }, [isAdmin, loading, user, profile, edition]);

  return null;
};

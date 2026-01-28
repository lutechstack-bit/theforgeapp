import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

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
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [markerReady, setMarkerReady] = useState(false);

  // Get auth state directly from supabase to avoid context dependency
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          // Check if user has admin role
          const { data: hasAdminRole } = await supabase.rpc('has_role', { _role: 'admin', _user_id: user.id });
          setIsAdmin(hasAdminRole === true);
        }
      } catch (error) {
        console.error('MarkerProvider auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

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

    if (isAdmin && user) {
      window.Marker.show();

      window.Marker.setReporter({
        email: user.email || '',
        fullName: 'Admin User',
      });

      window.Marker.setCustomData({
        environment: import.meta.env.MODE,
        app: 'the-forge',
        userId: user.id,
      });
    } else {
      window.Marker.hide();
    }
  }, [isAdmin, loading, markerReady, user]);

  return null;
};

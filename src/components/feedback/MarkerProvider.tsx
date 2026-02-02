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
  const [profileName, setProfileName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [markerReady, setMarkerReady] = useState(false);

  // Get auth state and profile name
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          // Fetch user's profile name for reporter info
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();
          
          setProfileName(profile?.full_name || '');
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
        setProfileName('');
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

  // Show widget for all authenticated users
  useEffect(() => {
    if (loading || !markerReady || !window.Marker) return;

    if (user) {
      window.Marker.show();

      window.Marker.setReporter({
        email: user.email || '',
        fullName: profileName || user.email?.split('@')[0] || 'User',
      });

      window.Marker.setCustomData({
        environment: import.meta.env.MODE,
        app: 'the-forge',
        userId: user.id,
      });
    } else {
      window.Marker.hide();
    }
  }, [loading, markerReady, user, profileName]);

  return null;
};

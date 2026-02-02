import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { calculateForgeMode, ForgeMode } from '@/lib/forgeUtils';
import { useAdminTestingSafe } from '@/contexts/AdminTestingContext';
import { AuthRecovery } from '@/components/auth/AuthRecovery';

// Auth initialization timeout in milliseconds (8 seconds)
const AUTH_INIT_TIMEOUT_MS = 8000;

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  payment_status: 'CONFIRMED_15K' | 'BALANCE_PAID';
  unlock_level: 'PREVIEW' | 'FULL';
  forge_mode: 'PRE_FORGE' | 'DURING_FORGE' | 'POST_FORGE';
  edition_id: string | null;
  city: string | null;
  kyf_completed: boolean;
  profile_setup_completed: boolean;
  ky_form_completed: boolean;
  bio: string | null;
  instagram_handle: string | null;
  twitter_handle: string | null;
  specialty: string | null;
}

interface Edition {
  id: string;
  forge_start_date: string | null;
  forge_end_date: string | null;
  cohort_type: 'FORGE' | 'FORGE_WRITING' | 'FORGE_CREATORS';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  edition: Edition | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  isFullAccess: boolean;
  isBalancePaid: boolean;
  isDuringForge: boolean;
  forgeMode: 'PRE_FORGE' | 'DURING_FORGE' | 'POST_FORGE';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [edition, setEdition] = useState<Edition | null>(null);
  const [loading, setLoading] = useState(true);
  const [authTimedOut, setAuthTimedOut] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const initAttemptRef = useRef(0);
  const loadingRef = useRef(true); // Track loading state for watchdog closure

  const fetchEdition = async (editionId: string) => {
    const { data, error } = await supabase
      .from('editions')
      .select('id, forge_start_date, forge_end_date, cohort_type')
      .eq('id', editionId)
      .single();
    
    if (error) {
      console.error('Error fetching edition:', error);
      return null;
    }
    return data as Edition;
  };

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as Profile;
  };

  const fetchUserData = async (userId: string) => {
    const profileData = await fetchProfile(userId);
    setProfile(profileData);
    
    if (profileData?.edition_id) {
      const editionData = await fetchEdition(profileData.edition_id);
      setEdition(editionData);
    } else {
      setEdition(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  // Helper to clear session and force reload
  const clearSessionAndReload = useCallback(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => registration.unregister());
        });
      }
    } catch (e) {
      console.error('Error during session cleanup:', e);
    }
    window.location.href = '/auth';
  }, []);

  // Retry auth initialization
  const retryAuth = useCallback(async () => {
    setIsRetrying(true);
    setAuthTimedOut(false);
    setLoading(true);
    initAttemptRef.current += 1;
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Retry auth error:', error);
        setAuthTimedOut(true);
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          await fetchUserData(session.user.id);
        } catch (fetchError) {
          console.error('Error fetching user data on retry:', fetchError);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Retry auth exception:', error);
      setAuthTimedOut(true);
    } finally {
      setIsRetrying(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    // Reset loading ref on mount
    loadingRef.current = true;
    
    // Auth initialization watchdog - prevents infinite loading
    // Uses loadingRef to avoid stale closure issues
    timeoutId = setTimeout(() => {
      if (isMounted && loadingRef.current) {
        console.warn('Auth initialization timed out after', AUTH_INIT_TIMEOUT_MS, 'ms');
        setAuthTimedOut(true);
        setLoading(false);
        loadingRef.current = false;
      }
    }, AUTH_INIT_TIMEOUT_MS);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        // Clear timeout on any auth state change
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            await fetchUserData(session.user.id);
          } catch (error) {
            console.error('Error fetching user data on auth change:', error);
          }
        } else {
          setProfile(null);
          setEdition(null);
        }
        if (isMounted) {
          setLoading(false);
          loadingRef.current = false;
          setAuthTimedOut(false);
        }
      }
    );

    // Initial session check
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (isMounted) {
            setLoading(false);
            loadingRef.current = false;
          }
          return;
        }
        
        if (!isMounted) return;
        
        // Clear timeout on successful init
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            await fetchUserData(session.user.id);
          } catch (fetchError) {
            console.error('Error fetching initial user data:', fetchError);
          }
        }
        
        if (isMounted) {
          setLoading(false);
          loadingRef.current = false;
          setAuthTimedOut(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          setLoading(false);
          loadingRef.current = false;
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [initAttemptRef.current]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: fullName ? { full_name: fullName } : undefined,
      },
    });
    return { error };
  };

  const signOut = async () => {
    // Clear local state FIRST to ensure logout even if server call fails
    setProfile(null);
    setEdition(null);
    setUser(null);
    setSession(null);
    
    try {
      // Use scope: 'local' to clear local session even if server session is already gone
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      console.error('Sign out error (session may already be expired):', error);
      // Even if server signout fails, we've already cleared local state
    }
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    return { error };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  };

  // Get admin testing state (safe hook returns defaults if outside provider)
  const { isTestingMode, simulatedForgeMode } = useAdminTestingSafe();

  const isFullAccess = profile?.unlock_level === 'FULL';
  const isBalancePaid = profile?.payment_status === 'BALANCE_PAID';
  
  // Calculate forge mode with optional admin simulation
  const forgeMode: ForgeMode = calculateForgeMode(
    edition?.forge_start_date, 
    edition?.forge_end_date,
    isTestingMode ? { simulatedMode: simulatedForgeMode } : undefined
  );
  const isDuringForge = forgeMode === 'DURING_FORGE';

  // Show recovery UI if auth timed out
  if (authTimedOut && !loading) {
    return (
      <AuthRecovery
        isRetrying={isRetrying}
        onRetry={retryAuth}
        onClearSession={clearSessionAndReload}
      />
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      edition,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      refreshProfile,
      isFullAccess,
      isBalancePaid,
      isDuringForge,
      forgeMode,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

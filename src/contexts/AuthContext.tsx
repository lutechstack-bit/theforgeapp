import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { calculateForgeMode, ForgeMode } from '@/lib/forgeUtils';
import { useAdminTestingSafe } from '@/contexts/AdminTestingContext';
import { AuthRecovery } from '@/components/auth/AuthRecovery';

// Auth initialization timeout in milliseconds (8 seconds)
const AUTH_INIT_TIMEOUT_MS = 8000;
// User data fetch timeout (5 seconds) - prevents stalled profile fetches from blocking forever
const USER_DATA_TIMEOUT_MS = 5000;

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

// Helper: wrap a promise with a timeout
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => {
      setTimeout(() => {
        console.warn(`[Auth] ${label} timed out after ${ms}ms`);
        resolve(null);
      }, ms);
    }),
  ]);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [edition, setEdition] = useState<Edition | null>(null);
  const [loading, setLoading] = useState(true);
  const [authTimedOut, setAuthTimedOut] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Refs to track initialization state
  const hasInitializedRef = useRef(false);
  const watchdogTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchEdition = async (editionId: string): Promise<Edition | null> => {
    const { data, error } = await supabase
      .from('editions')
      .select('id, forge_start_date, forge_end_date, cohort_type')
      .eq('id', editionId)
      .single();
    
    if (error) {
      console.error('[Auth] Error fetching edition:', error);
      return null;
    }
    return data as Edition;
  };

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('[Auth] Error fetching profile:', error);
      return null;
    }
    return data as Profile;
  };

  // Fetch user data with timeout protection
  const fetchUserDataWithTimeout = async (userId: string): Promise<void> => {
    try {
      const profileData = await withTimeout(
        fetchProfile(userId),
        USER_DATA_TIMEOUT_MS,
        'Profile fetch'
      );
      
      setProfile(profileData);
      
      if (profileData?.edition_id) {
        const editionData = await withTimeout(
          fetchEdition(profileData.edition_id),
          USER_DATA_TIMEOUT_MS,
          'Edition fetch'
        );
        setEdition(editionData);
      } else {
        setEdition(null);
      }
    } catch (error) {
      console.error('[Auth] Error in fetchUserDataWithTimeout:', error);
      // Don't throw - we want to continue even if profile fetch fails
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserDataWithTimeout(user.id);
    }
  };

  // Helper to safely complete initialization
  const completeInit = useCallback((timedOut = false) => {
    // Clear watchdog timer
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }
    
    setLoading(false);
    setAuthTimedOut(timedOut);
    hasInitializedRef.current = true;
  }, []);

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
      console.error('[Auth] Error during session cleanup:', e);
    }
    window.location.href = '/auth';
  }, []);

  // Retry auth initialization
  const retryAuth = useCallback(async () => {
    setIsRetrying(true);
    setAuthTimedOut(false);
    setLoading(true);
    hasInitializedRef.current = false;
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[Auth] Retry auth error:', error);
        completeInit(true);
        return;
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserDataWithTimeout(session.user.id);
      }
      
      completeInit(false);
    } catch (error) {
      console.error('[Auth] Retry auth exception:', error);
      completeInit(true);
    } finally {
      setIsRetrying(false);
    }
  }, [completeInit]);

  useEffect(() => {
    let isMounted = true;
    
    // Reset initialization state on mount
    hasInitializedRef.current = false;
    
    // Start the watchdog timer - this is our fail-safe
    // It will NOT be cleared until initialization is complete
    watchdogTimerRef.current = setTimeout(() => {
      if (isMounted && !hasInitializedRef.current) {
        console.warn('[Auth] Initialization timed out after', AUTH_INIT_TIMEOUT_MS, 'ms');
        completeInit(true);
      }
    }, AUTH_INIT_TIMEOUT_MS);
    
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;
        
        console.log('[Auth] Auth state change:', event);
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          try {
            await fetchUserDataWithTimeout(newSession.user.id);
          } catch (error) {
            console.error('[Auth] Error fetching user data on auth change:', error);
          }
        } else {
          setProfile(null);
          setEdition(null);
        }
        
        // Complete initialization if this is the first auth event
        if (isMounted && !hasInitializedRef.current) {
          completeInit(false);
        }
      }
    );

    // Initial session check - this runs after subscription is set up
    const initializeAuth = async () => {
      try {
        console.log('[Auth] Starting initial session check');
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[Auth] Error getting initial session:', error);
          if (isMounted && !hasInitializedRef.current) {
            completeInit(false); // Not a timeout, just no session
          }
          return;
        }
        
        if (!isMounted) return;
        
        // If onAuthStateChange hasn't fired yet, handle the session here
        if (!hasInitializedRef.current) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            try {
              await fetchUserDataWithTimeout(initialSession.user.id);
            } catch (fetchError) {
              console.error('[Auth] Error fetching initial user data:', fetchError);
            }
          }
          
          // Complete initialization
          if (isMounted && !hasInitializedRef.current) {
            completeInit(false);
          }
        }
      } catch (error) {
        console.error('[Auth] Auth initialization error:', error);
        if (isMounted && !hasInitializedRef.current) {
          completeInit(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
      subscription.unsubscribe();
    };
  }, [completeInit]);

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
      console.error('[Auth] Sign out error (session may already be expired):', error);
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

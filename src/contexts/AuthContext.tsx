import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { calculateForgeMode, ForgeMode } from '@/lib/forgeUtils';
import { useAdminTestingSafe } from '@/contexts/AdminTestingContext';
import { AuthRecovery } from '@/components/auth/AuthRecovery';

// Session initialization timeout (3 seconds) - just for determining if user is logged in
const SESSION_INIT_TIMEOUT_MS = 3000;
// User data fetch timeout (5 seconds) - for profile/edition fetch
const USER_DATA_TIMEOUT_MS = 5000;
// Overall app-level failsafe (10 seconds) - if loading is still true, force recovery
const APP_FAILSAFE_TIMEOUT_MS = 10000;

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
  userDataLoading: boolean;
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
  
  // Split loading states: auth (session) vs user data (profile/edition)
  const [loading, setLoading] = useState(true); // Session initialization only
  const [userDataLoading, setUserDataLoading] = useState(false);
  const [authTimedOut, setAuthTimedOut] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Refs to track initialization state
  const hasInitializedRef = useRef(false);
  const failsafeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchEdition = async (editionId: string): Promise<Edition | null> => {
    const { data, error } = await supabase
      .from('editions')
      .select('id, forge_start_date, forge_end_date, cohort_type')
      .eq('id', editionId)
      .maybeSingle(); // Use maybeSingle to handle missing rows gracefully
    
    if (error) {
      console.error('[Auth] Error fetching edition:', error);
      return null;
    }
    return data as Edition | null;
  };

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle to handle missing rows gracefully
    
    if (error) {
      console.error('[Auth] Error fetching profile:', error);
      return null;
    }
    return data as Profile | null;
  };

  // Fetch user data with timeout protection - NON-BLOCKING
  const fetchUserDataInBackground = useCallback(async (userId: string): Promise<void> => {
    setUserDataLoading(true);
    
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
      console.error('[Auth] Error in fetchUserDataInBackground:', error);
      // Don't throw - we want to continue even if profile fetch fails
    } finally {
      setUserDataLoading(false);
    }
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await fetchUserDataInBackground(user.id);
    }
  };

  // Helper to complete session initialization (NOT user data)
  const completeSessionInit = useCallback((timedOut = false) => {
    if (hasInitializedRef.current) return; // Already initialized
    
    console.log('[Auth] Session initialization complete, timedOut:', timedOut);
    hasInitializedRef.current = true;
    setLoading(false);
    setAuthTimedOut(timedOut);
    
    // Clear failsafe timer since we're done
    if (failsafeTimerRef.current) {
      clearTimeout(failsafeTimerRef.current);
      failsafeTimerRef.current = null;
    }
  }, []);

  // Helper to clear session and force reload
  const clearSessionAndReload = useCallback(async () => {
    try {
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Unregister all service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(r => r.unregister()));
      }
      
      // Clear caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
    } catch (e) {
      console.error('[Auth] Error during session cleanup:', e);
    }
    
    // Hard reload to auth page
    window.location.href = '/auth';
  }, []);

  // Retry auth initialization
  const retryAuth = useCallback(async () => {
    setIsRetrying(true);
    setAuthTimedOut(false);
    setLoading(true);
    hasInitializedRef.current = false;
    
    try {
      const sessionResult = await withTimeout(
        supabase.auth.getSession(),
        SESSION_INIT_TIMEOUT_MS,
        'Session retry'
      );
      
      if (!sessionResult) {
        console.warn('[Auth] Session retry timed out');
        completeSessionInit(true);
        return;
      }
      
      const { data: { session: retrySession }, error } = sessionResult;
      
      if (error) {
        console.error('[Auth] Retry auth error:', error);
        completeSessionInit(true);
        return;
      }
      
      setSession(retrySession);
      setUser(retrySession?.user ?? null);
      completeSessionInit(false);
      
      // Fetch user data in background (non-blocking)
      if (retrySession?.user) {
        fetchUserDataInBackground(retrySession.user.id);
      }
    } catch (error) {
      console.error('[Auth] Retry auth exception:', error);
      completeSessionInit(true);
    } finally {
      setIsRetrying(false);
    }
  }, [completeSessionInit, fetchUserDataInBackground]);

  useEffect(() => {
    let isMounted = true;
    
    // Reset initialization state on mount
    hasInitializedRef.current = false;
    
    // App-level failsafe: if loading is STILL true after 10s, force recovery
    failsafeTimerRef.current = setTimeout(() => {
      if (isMounted && !hasInitializedRef.current) {
        console.error('[Auth] FAILSAFE: App still loading after', APP_FAILSAFE_TIMEOUT_MS, 'ms - forcing recovery');
        completeSessionInit(true);
      }
    }, APP_FAILSAFE_TIMEOUT_MS);
    
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;
        
        console.log('[Auth] Auth state change:', event);
        
        // Update session/user immediately
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Complete session init FIRST (unblocks routing)
        if (!hasInitializedRef.current) {
          completeSessionInit(false);
        }
        
        // Then fetch user data in background (non-blocking)
        if (newSession?.user) {
          fetchUserDataInBackground(newSession.user.id);
        } else {
          setProfile(null);
          setEdition(null);
          setUserDataLoading(false);
        }
      }
    );

    // Initial session check with timeout
    const initializeAuth = async () => {
      try {
        console.log('[Auth] Starting initial session check');
        
        const sessionResult = await withTimeout(
          supabase.auth.getSession(),
          SESSION_INIT_TIMEOUT_MS,
          'Initial session check'
        );
        
        if (!isMounted) return;
        
        // If timeout occurred
        if (!sessionResult) {
          console.warn('[Auth] Initial session check timed out');
          if (!hasInitializedRef.current) {
            completeSessionInit(true);
          }
          return;
        }
        
        const { data: { session: initialSession }, error } = sessionResult;
        
        if (error) {
          console.error('[Auth] Error getting initial session:', error);
          if (!hasInitializedRef.current) {
            completeSessionInit(false); // Not a timeout, just no session
          }
          return;
        }
        
        // If onAuthStateChange hasn't fired yet, handle the session here
        if (!hasInitializedRef.current) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          // Complete session init FIRST (unblocks routing)
          completeSessionInit(false);
          
          // Then fetch user data in background (non-blocking)
          if (initialSession?.user) {
            fetchUserDataInBackground(initialSession.user.id);
          }
        }
      } catch (error) {
        console.error('[Auth] Auth initialization error:', error);
        if (isMounted && !hasInitializedRef.current) {
          completeSessionInit(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      if (failsafeTimerRef.current) {
        clearTimeout(failsafeTimerRef.current);
        failsafeTimerRef.current = null;
      }
      subscription.unsubscribe();
    };
  }, [completeSessionInit, fetchUserDataInBackground]);

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
      userDataLoading,
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

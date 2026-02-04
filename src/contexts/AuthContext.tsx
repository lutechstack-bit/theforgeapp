import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { calculateForgeMode, ForgeMode } from '@/lib/forgeUtils';
import { useAdminTestingSafe } from '@/contexts/AdminTestingContext';
import { AuthRecovery } from '@/components/auth/AuthRecovery';
import { promiseWithSoftTimeout } from '@/lib/promiseTimeout';

// Session initialization timeout (3 seconds) - just for determining if user is logged in
const SESSION_INIT_TIMEOUT_MS = 3000;
// User data fetch timeout (8 seconds) - for profile/edition fetch (increased from 5s)
const USER_DATA_TIMEOUT_MS = 8000;
// Overall app-level failsafe (10 seconds) - if loading is still true, force recovery
const APP_FAILSAFE_TIMEOUT_MS = 10000;
// Max retry attempts for user data
const MAX_USER_DATA_RETRIES = 3;
// Retry delays (exponential backoff)
const RETRY_DELAYS = [2000, 4000, 8000];

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
  userDataTimedOut: boolean;
  userDataError: Error | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  retryUserData: () => Promise<void>;
  isFullAccess: boolean;
  isBalancePaid: boolean;
  isDuringForge: boolean;
  forgeMode: 'PRE_FORGE' | 'DURING_FORGE' | 'POST_FORGE';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper: wrap a promise with a timeout (for session init)
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
  const [userDataTimedOut, setUserDataTimedOut] = useState(false);
  const [userDataError, setUserDataError] = useState<Error | null>(null);
  const [authTimedOut, setAuthTimedOut] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Refs to track initialization state
  const hasInitializedRef = useRef(false);
  const failsafeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userDataRetryCountRef = useRef(0);
  const userDataRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchEdition = async (editionId: string): Promise<Edition | null> => {
    const { data, error } = await supabase
      .from('editions')
      .select('id, forge_start_date, forge_end_date, cohort_type')
      .eq('id', editionId)
      .maybeSingle();
    
    if (error) {
      console.error('[Auth] Error fetching edition:', error);
      throw error;
    }
    return data as Edition | null;
  };

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('[Auth] Error fetching profile:', error);
      throw error;
    }
    return data as Profile | null;
  };

  // Clear user data retry timer
  const clearUserDataRetryTimer = useCallback(() => {
    if (userDataRetryTimerRef.current) {
      clearTimeout(userDataRetryTimerRef.current);
      userDataRetryTimerRef.current = null;
    }
  }, []);

  // Fetch user data with timeout protection and retry logic
  const fetchUserDataInBackground = useCallback(async (userId: string, isRetry = false): Promise<void> => {
    if (!isRetry) {
      setUserDataLoading(true);
      setUserDataTimedOut(false);
      setUserDataError(null);
      userDataRetryCountRef.current = 0;
    }
    
    try {
      console.log(`[Auth] Fetching profile for user ${userId} (attempt ${userDataRetryCountRef.current + 1})`);
      
      // Fetch profile with timeout
      const profileResult = await promiseWithSoftTimeout(
        fetchProfile(userId),
        USER_DATA_TIMEOUT_MS,
        'Profile fetch'
      );
      
      // Handle timeout or error
      if (profileResult.timedOut || profileResult.error) {
        const error = profileResult.error || new Error('Profile fetch timed out');
        console.warn('[Auth] Profile fetch failed:', error.message);
        
        // Check if we should retry
        if (userDataRetryCountRef.current < MAX_USER_DATA_RETRIES) {
          const delay = RETRY_DELAYS[userDataRetryCountRef.current] || 8000;
          console.log(`[Auth] Will retry in ${delay}ms (attempt ${userDataRetryCountRef.current + 2})`);
          
          userDataRetryCountRef.current++;
          clearUserDataRetryTimer();
          userDataRetryTimerRef.current = setTimeout(() => {
            fetchUserDataInBackground(userId, true);
          }, delay);
          
          // Don't set error state yet - we're retrying
          if (!isRetry) {
            // Keep userDataLoading true during retries
          }
          return;
        }
        
        // Max retries reached - mark as timed out/errored but DON'T clear existing profile
        console.error('[Auth] Max retries reached for profile fetch');
        setUserDataTimedOut(profileResult.timedOut);
        setUserDataError(error);
        setUserDataLoading(false);
        return;
      }
      
      const profileData = profileResult.data;
      
      // SUCCESS: Update profile
      setProfile(profileData);
      setUserDataTimedOut(false);
      setUserDataError(null);
      
      // Fetch edition if profile has one
      if (profileData?.edition_id) {
        const editionResult = await promiseWithSoftTimeout(
          fetchEdition(profileData.edition_id),
          USER_DATA_TIMEOUT_MS,
          'Edition fetch'
        );
        
        if (editionResult.data) {
          setEdition(editionResult.data);
        } else if (editionResult.timedOut || editionResult.error) {
          // Edition fetch failed but profile succeeded - not critical
          console.warn('[Auth] Edition fetch failed, continuing with profile only');
        }
      } else {
        setEdition(null);
      }
      
      setUserDataLoading(false);
    } catch (error) {
      console.error('[Auth] Unexpected error in fetchUserDataInBackground:', error);
      setUserDataError(error instanceof Error ? error : new Error('Unknown error'));
      setUserDataLoading(false);
    }
  }, [clearUserDataRetryTimer]);

  // Manual retry function exposed to UI
  const retryUserData = useCallback(async () => {
    if (!user) return;
    clearUserDataRetryTimer();
    userDataRetryCountRef.current = 0;
    await fetchUserDataInBackground(user.id, false);
  }, [user, fetchUserDataInBackground, clearUserDataRetryTimer]);

  const refreshProfile = async () => {
    if (user) {
      clearUserDataRetryTimer();
      userDataRetryCountRef.current = 0;
      await fetchUserDataInBackground(user.id, false);
    }
  };

  // Helper to complete session initialization (NOT user data)
  const completeSessionInit = useCallback((timedOut = false) => {
    if (hasInitializedRef.current) return;
    
    console.log('[Auth] Session initialization complete, timedOut:', timedOut);
    hasInitializedRef.current = true;
    setLoading(false);
    setAuthTimedOut(timedOut);
    
    if (failsafeTimerRef.current) {
      clearTimeout(failsafeTimerRef.current);
      failsafeTimerRef.current = null;
    }
  }, []);

  // Helper to clear session and force reload
  const clearSessionAndReload = useCallback(async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(r => r.unregister()));
      }
      
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
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

  // Retry user data on window focus (if timed out)
  useEffect(() => {
    const handleFocus = () => {
      if (userDataTimedOut && user && !userDataLoading) {
        console.log('[Auth] Window focused, retrying user data fetch');
        retryUserData();
      }
    };

    const handleOnline = () => {
      if (userDataTimedOut && user && !userDataLoading) {
        console.log('[Auth] Browser came online, retrying user data fetch');
        retryUserData();
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [userDataTimedOut, user, userDataLoading, retryUserData]);

  useEffect(() => {
    let isMounted = true;
    
    hasInitializedRef.current = false;
    
    failsafeTimerRef.current = setTimeout(() => {
      if (isMounted && !hasInitializedRef.current) {
        console.error('[Auth] FAILSAFE: App still loading after', APP_FAILSAFE_TIMEOUT_MS, 'ms - forcing recovery');
        completeSessionInit(true);
      }
    }, APP_FAILSAFE_TIMEOUT_MS);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;
        
        console.log('[Auth] Auth state change:', event);
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (!hasInitializedRef.current) {
          completeSessionInit(false);
        }
        
        if (newSession?.user) {
          fetchUserDataInBackground(newSession.user.id);
        } else {
          setProfile(null);
          setEdition(null);
          setUserDataLoading(false);
          setUserDataTimedOut(false);
          setUserDataError(null);
        }
      }
    );

    const initializeAuth = async () => {
      try {
        console.log('[Auth] Starting initial session check');
        
        const sessionResult = await withTimeout(
          supabase.auth.getSession(),
          SESSION_INIT_TIMEOUT_MS,
          'Initial session check'
        );
        
        if (!isMounted) return;
        
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
            completeSessionInit(false);
          }
          return;
        }
        
        if (!hasInitializedRef.current) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          completeSessionInit(false);
          
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
      clearUserDataRetryTimer();
      subscription.unsubscribe();
    };
  }, [completeSessionInit, fetchUserDataInBackground, clearUserDataRetryTimer]);

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
    setProfile(null);
    setEdition(null);
    setUser(null);
    setSession(null);
    clearUserDataRetryTimer();
    
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (error) {
      console.error('[Auth] Sign out error (session may already be expired):', error);
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

  const { isTestingMode, simulatedForgeMode } = useAdminTestingSafe();

  const isFullAccess = profile?.unlock_level === 'FULL';
  const isBalancePaid = profile?.payment_status === 'BALANCE_PAID';
  
  const forgeMode: ForgeMode = calculateForgeMode(
    edition?.forge_start_date, 
    edition?.forge_end_date,
    isTestingMode ? { simulatedMode: simulatedForgeMode } : undefined
  );
  const isDuringForge = forgeMode === 'DURING_FORGE';

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
      userDataTimedOut,
      userDataError,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      refreshProfile,
      retryUserData,
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

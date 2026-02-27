import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { calculateForgeMode, ForgeMode } from '@/lib/forgeUtils';
import { useAdminTestingSafe } from '@/contexts/AdminTestingContext';
import { AuthRecovery } from '@/components/auth/AuthRecovery';
import { promiseWithSoftTimeout } from '@/lib/promiseTimeout';
import { 
  cacheProfile, 
  getCachedProfile, 
  cacheEdition, 
  getCachedEdition,
  clearAllAuthCaches 
} from '@/lib/authCache';

// Session initialization timeout (3 seconds) - just for determining if user is logged in
const SESSION_INIT_TIMEOUT_MS = 3000;
// User data fetch timeout (8 seconds) - for profile/edition fetch
const USER_DATA_TIMEOUT_MS = 8000;
// Overall app-level failsafe (10 seconds) - if loading is still true, force recovery
const APP_FAILSAFE_TIMEOUT_MS = 10000;
// Max retry attempts for user data
const MAX_USER_DATA_RETRIES = 2;
// Retry delays (exponential backoff)
const RETRY_DELAYS = [2000, 4000];

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
  ky_section_progress: Record<string, boolean> | null | any;
  bio: string | null;
  instagram_handle: string | null;
  twitter_handle: string | null;
  specialty: string | null;
  tagline: string | null;
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
  clearCacheAndReload: () => Promise<void>;
  isFullAccess: boolean;
  isBalancePaid: boolean;
  isDuringForge: boolean;
  forgeMode: 'PRE_FORGE' | 'DURING_FORGE' | 'POST_FORGE';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check if running with boot debug enabled
const isBootDebugEnabled = () => {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).has('bootDebug');
};

const bootLog = (message: string, ...args: any[]) => {
  if (isBootDebugEnabled()) {
    console.log(`[BootDebug] ${message}`, ...args);
  }
};

/**
 * Discover the Supabase auth storage key dynamically.
 * This handles cases where the project ID might differ or the key format changes.
 */
function discoverSupabaseAuthKey(): string | null {
  try {
    // Try common patterns
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
        bootLog('Discovered auth key:', key);
        return key;
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Try to read stored session from localStorage immediately (local-first).
 * This allows instant hydration without waiting for network.
 */
function getStoredSession(): { user: User; session: Session } | null {
  try {
    const authKey = discoverSupabaseAuthKey();
    if (!authKey) {
      bootLog('No auth key found in localStorage');
      return null;
    }
    
    const raw = localStorage.getItem(authKey);
    if (!raw) {
      bootLog('Auth key exists but no value');
      return null;
    }
    
    const parsed = JSON.parse(raw);
    
    // Supabase stores session with expires_at timestamp
    if (parsed?.expires_at) {
      const expiresAt = parsed.expires_at * 1000; // Convert to ms
      const now = Date.now();
      if (now >= expiresAt) {
        bootLog('Stored session expired', { expiresAt, now });
        return null;
      }
    }
    
    // Validate we have required session data
    if (parsed?.access_token && parsed?.user?.id) {
      const session: Session = {
        access_token: parsed.access_token,
        refresh_token: parsed.refresh_token || '',
        expires_in: parsed.expires_in || 3600,
        expires_at: parsed.expires_at,
        token_type: parsed.token_type || 'bearer',
        user: parsed.user,
      };
      bootLog('Valid stored session found for user:', parsed.user.id);
      return { user: parsed.user, session };
    }
    
    bootLog('Stored session missing required fields');
    return null;
  } catch (error) {
    console.warn('[Auth] Failed to parse stored session:', error);
    return null;
  }
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
  
  // Refs to track initialization state (NOT state to avoid re-render loops)
  const hasInitializedRef = useRef(false);
  const failsafeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const userDataRetryCountRef = useRef(0);
  const userDataRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hydratedFromCacheRef = useRef(false);
  const currentFetchIdRef = useRef(0); // Track fetch request IDs to prevent stale updates
  const bootCompleteRef = useRef(false);

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
  // NOTE: This function does NOT depend on any state that changes frequently
  const fetchUserDataWithId = useCallback(async (userId: string, fetchId: number, isRetry = false): Promise<void> => {
    // Check if this fetch is still the current one
    if (fetchId !== currentFetchIdRef.current) {
      bootLog('Ignoring stale fetch', { fetchId, current: currentFetchIdRef.current });
      return;
    }
    
    if (!isRetry) {
      setUserDataLoading(true);
      setUserDataTimedOut(false);
      setUserDataError(null);
      userDataRetryCountRef.current = 0;
      
      // Immediately hydrate from cache if available (optimistic UI)
      const cachedProfile = getCachedProfile(userId);
      const cachedEdition = getCachedEdition(userId);
      
      if (cachedProfile && !hydratedFromCacheRef.current) {
        bootLog('Hydrating profile from cache');
        setProfile(cachedProfile as Profile);
        if (cachedEdition) {
          setEdition(cachedEdition as Edition);
        }
        hydratedFromCacheRef.current = true;
      }
    }
    
    try {
      bootLog(`Fetching profile for user ${userId} (attempt ${userDataRetryCountRef.current + 1})`);
      
      // Fetch profile with timeout
      const profileResult = await promiseWithSoftTimeout(
        fetchProfile(userId),
        USER_DATA_TIMEOUT_MS,
        'Profile fetch'
      );
      
      // Check if this fetch is still the current one after await
      if (fetchId !== currentFetchIdRef.current) {
        bootLog('Ignoring stale profile result', { fetchId, current: currentFetchIdRef.current });
        return;
      }
      
      // Handle timeout or error
      if (profileResult.timedOut || profileResult.error) {
        const error = profileResult.error || new Error('Profile fetch timed out');
        console.warn('[Auth] Profile fetch failed:', error.message);
        
        // Check if we should retry
        if (userDataRetryCountRef.current < MAX_USER_DATA_RETRIES) {
          const delay = RETRY_DELAYS[userDataRetryCountRef.current] || 4000;
          bootLog(`Will retry in ${delay}ms (attempt ${userDataRetryCountRef.current + 2})`);
          
          userDataRetryCountRef.current++;
          clearUserDataRetryTimer();
          userDataRetryTimerRef.current = setTimeout(() => {
            fetchUserDataWithId(userId, fetchId, true);
          }, delay);
          
          // If we have cached data, consider loading "done" for UI purposes
          if (hydratedFromCacheRef.current) {
            setUserDataLoading(false);
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
      
      // SUCCESS: Update profile and cache it
      if (profileData) {
        setProfile(profileData);
        cacheProfile(userId, {
          id: profileData.id,
          full_name: profileData.full_name,
          avatar_url: profileData.avatar_url,
          edition_id: profileData.edition_id,
          profile_setup_completed: profileData.profile_setup_completed,
          ky_form_completed: profileData.ky_form_completed,
          unlock_level: profileData.unlock_level,
          payment_status: profileData.payment_status,
          city: profileData.city,
        });
        bootLog('Profile fetched successfully');
      }
      
      setUserDataTimedOut(false);
      setUserDataError(null);
      hydratedFromCacheRef.current = false;
      
      // Fetch edition if profile has one
      if (profileData?.edition_id) {
        const editionResult = await promiseWithSoftTimeout(
          fetchEdition(profileData.edition_id),
          USER_DATA_TIMEOUT_MS,
          'Edition fetch'
        );
        
        // Check staleness again
        if (fetchId !== currentFetchIdRef.current) return;
        
        if (editionResult.data) {
          setEdition(editionResult.data);
          cacheEdition(userId, {
            id: editionResult.data.id,
            cohort_type: editionResult.data.cohort_type,
            forge_start_date: editionResult.data.forge_start_date,
            forge_end_date: editionResult.data.forge_end_date,
          });
        } else if (editionResult.timedOut || editionResult.error) {
          // Edition fetch failed but profile succeeded - not critical
          console.warn('[Auth] Edition fetch failed, continuing with profile only');
        }
      } else {
        setEdition(null);
      }
      
      setUserDataLoading(false);
    } catch (error) {
      console.error('[Auth] Unexpected error in fetchUserData:', error);
      if (fetchId === currentFetchIdRef.current) {
        setUserDataError(error instanceof Error ? error : new Error('Unknown error'));
        setUserDataLoading(false);
      }
    }
  }, [clearUserDataRetryTimer]);

  // Wrapper to start a new fetch with a fresh ID
  const startUserDataFetch = useCallback((userId: string) => {
    currentFetchIdRef.current++;
    const fetchId = currentFetchIdRef.current;
    clearUserDataRetryTimer();
    fetchUserDataWithId(userId, fetchId, false);
  }, [fetchUserDataWithId, clearUserDataRetryTimer]);

  // Manual retry function exposed to UI
  const retryUserData = useCallback(async () => {
    if (!user) return;
    hydratedFromCacheRef.current = false;
    startUserDataFetch(user.id);
  }, [user, startUserDataFetch]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      hydratedFromCacheRef.current = false;
      startUserDataFetch(user.id);
    }
  }, [user, startUserDataFetch]);

  // Helper to complete session initialization (NOT user data)
  const completeSessionInit = useCallback((timedOut = false) => {
    if (hasInitializedRef.current) return;
    
    bootLog('Session initialization complete, timedOut:', timedOut);
    hasInitializedRef.current = true;
    setLoading(false);
    setAuthTimedOut(timedOut);
    
    if (failsafeTimerRef.current) {
      clearTimeout(failsafeTimerRef.current);
      failsafeTimerRef.current = null;
    }
  }, []);

  // Helper to clear session and force reload
  const clearCacheAndReload = useCallback(async () => {
    try {
      clearAllAuthCaches();
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
      const { data: { session: retrySession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[Auth] Retry auth error:', error);
        completeSessionInit(true);
        return;
      }
      
      setSession(retrySession);
      setUser(retrySession?.user ?? null);
      completeSessionInit(false);
      
      if (retrySession?.user) {
        startUserDataFetch(retrySession.user.id);
      }
    } catch (error) {
      console.error('[Auth] Retry auth exception:', error);
      completeSessionInit(true);
    } finally {
      setIsRetrying(false);
    }
  }, [completeSessionInit, startUserDataFetch]);

  // Retry user data on window focus (if timed out)
  useEffect(() => {
    const handleFocus = () => {
      if (userDataTimedOut && user && !userDataLoading) {
        bootLog('Window focused, retrying user data fetch');
        retryUserData();
      }
    };

    const handleOnline = () => {
      if (userDataTimedOut && user && !userDataLoading) {
        bootLog('Browser came online, retrying user data fetch');
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

  // MAIN BOOT EFFECT - runs exactly ONCE
  useEffect(() => {
    // Prevent re-running if already booted
    if (bootCompleteRef.current) {
      bootLog('Boot already complete, skipping re-initialization');
      return;
    }
    bootCompleteRef.current = true;
    
    let isMounted = true;
    bootLog('Starting auth boot sequence');
    
    // === LOCAL-FIRST: Hydrate from stored session immediately ===
    const storedSession = getStoredSession();
    if (storedSession) {
      bootLog('Hydrating session from localStorage (local-first)');
      setSession(storedSession.session);
      setUser(storedSession.user);
      
      // Also hydrate profile/edition from cache
      const cachedProfile = getCachedProfile(storedSession.user.id);
      const cachedEdition = getCachedEdition(storedSession.user.id);
      
      if (cachedProfile) {
        bootLog('Hydrating profile from cache (local-first)');
        setProfile(cachedProfile as Profile);
        hydratedFromCacheRef.current = true;
      }
      if (cachedEdition) {
        setEdition(cachedEdition as Edition);
      }
    }
    
    // Set up app-level failsafe
    failsafeTimerRef.current = setTimeout(() => {
      if (isMounted && !hasInitializedRef.current) {
        console.error('[Auth] FAILSAFE: App still loading after', APP_FAILSAFE_TIMEOUT_MS, 'ms - forcing recovery');
        completeSessionInit(true);
      }
    }, APP_FAILSAFE_TIMEOUT_MS);
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;
        
        bootLog('Auth state change:', event);
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Complete session init on first auth event
        if (!hasInitializedRef.current) {
          completeSessionInit(false);
        }
        
        // Handle user data based on session
        if (newSession?.user) {
          // Only start a new fetch if this is a login/token refresh, not initial hydration
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            startUserDataFetch(newSession.user.id);
          } else if (event === 'INITIAL_SESSION') {
            // For INITIAL_SESSION, only fetch if we don't have cached data
            if (!hydratedFromCacheRef.current) {
              startUserDataFetch(newSession.user.id);
            } else {
              // We have cached data, start a background refresh
              bootLog('Have cached data, starting background refresh');
              startUserDataFetch(newSession.user.id);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setEdition(null);
          setUserDataLoading(false);
          setUserDataTimedOut(false);
          setUserDataError(null);
          hydratedFromCacheRef.current = false;
        }
      }
    );

    // Also do an explicit getSession call with timeout as backup
    // (onAuthStateChange should fire first, but this is a safety net)
    const initializeAuth = async () => {
      try {
        bootLog('Starting initial session check');
        
        // Short timeout - we mainly rely on onAuthStateChange
        const timeoutPromise = new Promise<null>((resolve) => {
          setTimeout(() => resolve(null), SESSION_INIT_TIMEOUT_MS);
        });
        
        const sessionPromise = supabase.auth.getSession();
        const result = await Promise.race([sessionPromise, timeoutPromise]);
        
        if (!isMounted) return;
        
        if (!result) {
          bootLog('Initial session check timed out');
          // If we have local session, still complete as success
          if (storedSession && !hasInitializedRef.current) {
            bootLog('Using locally stored session despite timeout');
            completeSessionInit(false);
            startUserDataFetch(storedSession.user.id);
          } else if (!hasInitializedRef.current) {
            completeSessionInit(true);
          }
          return;
        }
        
        const { data: { session: initialSession }, error } = result;
        
        if (error) {
          console.error('[Auth] Error getting initial session:', error);
          if (!hasInitializedRef.current) {
            // If we have stored session, don't fail on error
            if (storedSession) {
              completeSessionInit(false);
            } else {
              completeSessionInit(false);
            }
          }
          return;
        }
        
        // If onAuthStateChange hasn't fired yet, apply the session
        if (!hasInitializedRef.current) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          completeSessionInit(false);
          
          if (initialSession?.user) {
            startUserDataFetch(initialSession.user.id);
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
  }, []); // Empty dependency array - runs ONCE

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
    // Clear local state first (local-first sign out)
    setProfile(null);
    setEdition(null);
    setUser(null);
    setSession(null);
    hydratedFromCacheRef.current = false;
    clearUserDataRetryTimer();
    clearAllAuthCaches();
    
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
        onClearSession={clearCacheAndReload}
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
      clearCacheAndReload,
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

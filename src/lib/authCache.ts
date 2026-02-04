/**
 * Local cache utilities for auth/profile data.
 * Enables instant hydration on refresh while background validation occurs.
 */

const PROFILE_CACHE_KEY = 'forge_profile_cache';
const EDITION_CACHE_KEY = 'forge_edition_cache';
const CACHE_VERSION = 'v1';
const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CachedProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  edition_id: string | null;
  profile_setup_completed: boolean;
  ky_form_completed: boolean;
  unlock_level: 'PREVIEW' | 'FULL';
  payment_status: 'CONFIRMED_15K' | 'BALANCE_PAID';
  city: string | null;
}

interface CachedEdition {
  id: string;
  cohort_type: 'FORGE' | 'FORGE_WRITING' | 'FORGE_CREATORS';
  forge_start_date: string | null;
  forge_end_date: string | null;
}

interface CacheWrapper<T> {
  version: string;
  timestamp: number;
  userId: string;
  data: T;
}

function getCacheKey(baseKey: string, userId: string): string {
  return `${baseKey}_${userId}`;
}

function isValidCache<T>(cache: CacheWrapper<T> | null, userId: string): cache is CacheWrapper<T> {
  if (!cache) return false;
  if (cache.version !== CACHE_VERSION) return false;
  if (cache.userId !== userId) return false;
  if (Date.now() - cache.timestamp > CACHE_MAX_AGE_MS) return false;
  return true;
}

/**
 * Save profile data to localStorage for instant hydration on refresh
 */
export function cacheProfile(userId: string, profile: CachedProfile): void {
  try {
    const wrapper: CacheWrapper<CachedProfile> = {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      userId,
      data: profile,
    };
    localStorage.setItem(getCacheKey(PROFILE_CACHE_KEY, userId), JSON.stringify(wrapper));
  } catch (error) {
    console.warn('[AuthCache] Failed to cache profile:', error);
  }
}

/**
 * Retrieve cached profile for instant UI hydration
 */
export function getCachedProfile(userId: string): CachedProfile | null {
  try {
    const raw = localStorage.getItem(getCacheKey(PROFILE_CACHE_KEY, userId));
    if (!raw) return null;
    
    const wrapper: CacheWrapper<CachedProfile> = JSON.parse(raw);
    if (!isValidCache(wrapper, userId)) {
      clearProfileCache(userId);
      return null;
    }
    
    return wrapper.data;
  } catch (error) {
    console.warn('[AuthCache] Failed to read cached profile:', error);
    return null;
  }
}

/**
 * Save edition data to localStorage
 */
export function cacheEdition(userId: string, edition: CachedEdition): void {
  try {
    const wrapper: CacheWrapper<CachedEdition> = {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      userId,
      data: edition,
    };
    localStorage.setItem(getCacheKey(EDITION_CACHE_KEY, userId), JSON.stringify(wrapper));
  } catch (error) {
    console.warn('[AuthCache] Failed to cache edition:', error);
  }
}

/**
 * Retrieve cached edition for instant UI hydration
 */
export function getCachedEdition(userId: string): CachedEdition | null {
  try {
    const raw = localStorage.getItem(getCacheKey(EDITION_CACHE_KEY, userId));
    if (!raw) return null;
    
    const wrapper: CacheWrapper<CachedEdition> = JSON.parse(raw);
    if (!isValidCache(wrapper, userId)) {
      clearEditionCache(userId);
      return null;
    }
    
    return wrapper.data;
  } catch (error) {
    console.warn('[AuthCache] Failed to read cached edition:', error);
    return null;
  }
}

/**
 * Clear profile cache for a user
 */
export function clearProfileCache(userId: string): void {
  try {
    localStorage.removeItem(getCacheKey(PROFILE_CACHE_KEY, userId));
  } catch (error) {
    console.warn('[AuthCache] Failed to clear profile cache:', error);
  }
}

/**
 * Clear edition cache for a user
 */
export function clearEditionCache(userId: string): void {
  try {
    localStorage.removeItem(getCacheKey(EDITION_CACHE_KEY, userId));
  } catch (error) {
    console.warn('[AuthCache] Failed to clear edition cache:', error);
  }
}

/**
 * Clear all auth caches (used on sign out)
 */
export function clearAllAuthCaches(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(PROFILE_CACHE_KEY) || key?.startsWith(EDITION_CACHE_KEY)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.warn('[AuthCache] Failed to clear all caches:', error);
  }
}

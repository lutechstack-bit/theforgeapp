
## Goal
Fix the app-wide issue where no content is loading because Supabase queries are not executing, causing infinite loading states across the entire application.

---

## Root Cause Analysis

After investigating the console logs, network requests, database, and RLS policies, I've identified **multiple interconnected issues**:

### Issue 1: RLS Policies Require `authenticated` Role
Several key tables have RLS policies that **only allow SELECT for `authenticated` role**:
- `events` - `roles: {authenticated}`
- `learn_content` - `roles: {authenticated}`
- `editions` - `roles: {authenticated}`
- `roadmap_days` - `roles: {authenticated}`

This means if the Supabase client's session isn't properly established when queries run, **ALL data requests to these tables will fail silently or return empty**.

Tables like `mentors` and `alumni_testimonials` allow `public` access and should work, but even those aren't loading.

### Issue 2: No Network Requests Being Made
The network logs show **zero Supabase requests**. This indicates:
1. React Query queries are not executing at all, OR
2. The Supabase client is broken/not initialized, OR  
3. Queries are hitting stale cache and never refetching

### Issue 3: QueryClient Has No Default Configuration
```javascript
const queryClient = new QueryClient();  // No defaults!
```

This means:
- No default `staleTime` - data goes stale immediately
- No retry configuration
- No error handling
- Potential caching issues that prevent refetches

### Issue 4: AuthContext Loading Race Condition
```javascript
// Line 132 - sets loading=false BEFORE profile is fetched
setLoading(false);
```

The `loading` state is set to `false` before `fetchUserData()` completes. This means:
- ProtectedRoute allows rendering with `profile = null`
- Downstream components/queries that depend on profile data start with null
- The profile loads LATER but dependent queries may not re-run

---

## Implementation Plan

### A) Fix QueryClient Configuration
**File:** `src/App.tsx`

Add sensible defaults to QueryClient to ensure:
- Queries retry on failure
- Network-aware behavior for offline scenarios
- Proper cache management

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
  },
});
```

### B) Fix AuthContext Loading State
**File:** `src/contexts/AuthContext.tsx`

Change the loading state to only be set to `false` AFTER profile data is fetched:

```typescript
// Current (broken):
if (session?.user) {
  fetchUserData(session.user.id);  // Async - runs in background
}
setLoading(false);  // Runs immediately

// Fixed:
if (session?.user) {
  await fetchUserData(session.user.id);
}
setLoading(false);  // Runs after profile is loaded
```

Also add error handling to prevent silent failures.

### C) Fix RLS Policies for Public-Facing Content
**Database Migration:**

Update RLS policies on content tables to allow `public` role for SELECT:
- `events` - Should be publicly viewable
- `learn_content` - Should be publicly viewable
- `editions` - Should be publicly viewable (needed for countdown)

This ensures the Home page can load even before authentication is fully established.

### D) Add Error Boundaries and Diagnostic Logging
**File:** `src/pages/Home.tsx`

Add console logging in development mode to help diagnose query states:
```typescript
if (import.meta.env.DEV) {
  console.log('Home queries:', {
    mentors: mentorsQuery.status,
    alumni: alumniTestimonialsQuery.status,
    events: eventsQuery.status,
    learn: learnContentQuery.status,
  });
}
```

---

## Detailed File Changes

### 1. `src/App.tsx` - Fix QueryClient
Add default options with retry logic and proper error handling.

### 2. `src/contexts/AuthContext.tsx` - Fix Loading Race Condition  
- Make the auth state change handler properly await profile loading
- Add error handling for profile/edition fetch failures
- Ensure `loading` is only `false` when auth state is fully resolved

### 3. Database Migration - Fix RLS Policies
```sql
-- Allow public to view events
DROP POLICY IF EXISTS "Everyone can view events" ON events;
CREATE POLICY "Everyone can view events" 
  ON events FOR SELECT 
  USING (true);

-- Allow public to view learn content  
DROP POLICY IF EXISTS "Everyone can view learn content" ON learn_content;
CREATE POLICY "Everyone can view learn content" 
  ON learn_content FOR SELECT 
  USING (true);

-- Allow public to view editions
DROP POLICY IF EXISTS "Everyone can view editions" ON editions;
CREATE POLICY "Everyone can view editions" 
  ON editions FOR SELECT 
  USING (true);
```

---

## Why This Will Work

1. **QueryClient defaults** - Ensures queries retry and have proper cache behavior
2. **AuthContext fix** - Ensures `profile` is available when components render
3. **RLS policy changes** - Allows content to load regardless of auth state
4. **Diagnostic logging** - Helps identify if queries are running or stuck

---

## Verification Steps

1. **Test Home page load:**
   - Content carousels should appear with data
   - Countdown should show proper dates
   - Journey section should load

2. **Test with fresh session:**
   - Clear localStorage and cookies
   - Login fresh and verify content loads

3. **Test network failures:**
   - Should see error states with retry buttons

---

## Files to Change

1. `src/App.tsx` - Add QueryClient default options
2. `src/contexts/AuthContext.tsx` - Fix loading state race condition
3. Database migration - Update RLS policies on `events`, `learn_content`, `editions`

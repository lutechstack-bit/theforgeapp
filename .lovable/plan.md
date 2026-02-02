
## Goal
Fix the Home page and app-wide loading issue where content queries appear stuck in loading state and never resolve, causing infinite loading skeletons and missing content.

---

## What I Found

### Issue 1: Queries Stuck in Loading State
The Home page shows loading skeletons indefinitely because:
- The Supabase network requests appear to not be completing
- React Query's `isLoading` stays true when queries don't resolve
- The current implementation only shows content when ALL queries finish loading

### Issue 2: No Timeout Protection
When queries hang (network issues, Supabase client issues, etc.), there's no fallback:
- Users see infinite skeletons
- No retry option appears
- No indication of what's happening

### Issue 3: AuthContext Profile Not Loading
The AuthContext's `profile` is null or not loading properly, causing:
- "Hi there" instead of "Hi [Name]"
- Countdown showing 00:00:00:00 (no edition)
- Journey section showing "Your journey is being prepared"

---

## Implementation Plan

### A) Add Query Timeout Protection in Home.tsx
Add a timeout that transitions from "loading" to "error with retry" if queries don't resolve within a reasonable time (e.g., 15 seconds).

**Changes to `src/pages/Home.tsx`:**
1. Add a `useState` for loading timeout
2. Add a `useEffect` that sets a timeout when loading starts
3. If timeout fires and still loading, show error state with retry

### B) Show Each Section Independently
Instead of waiting for ALL queries to finish, render each section as soon as its data arrives.

**Changes to `src/pages/Home.tsx`:**
1. Change from "all or nothing" loading to per-section loading
2. Each carousel shows its own skeleton while loading
3. Each carousel shows content as soon as its query succeeds
4. Failed sections show individual error messages

### C) Improve Error Visibility
Make it clear when something fails so users aren't left guessing.

**Changes to `src/components/home/HomeErrorState.tsx`:**
1. Add more diagnostic information in debug mode
2. Include network connectivity check

### D) Add Loading Timeout to Content Queries
Use React Query's timeout/retry configuration to prevent indefinite loading.

**Changes to `src/pages/Home.tsx`:**
1. Add `staleTime` and `gcTime` configuration
2. Add `retry` and `retryDelay` configuration
3. Add network mode configuration for offline handling

---

## Detailed File Changes

### File: `src/pages/Home.tsx`

**Add loading timeout state and effect:**
```tsx
const [loadingTimedOut, setLoadingTimedOut] = useState(false);

useEffect(() => {
  if (isAnyLoading) {
    const timeout = setTimeout(() => {
      setLoadingTimedOut(true);
    }, 15000); // 15 second timeout
    return () => clearTimeout(timeout);
  } else {
    setLoadingTimedOut(false);
  }
}, [isAnyLoading]);
```

**Change loading condition to include timeout:**
```tsx
// Show error state if timed out while loading
{(isAnyError || loadingTimedOut) && (
  <HomeErrorState 
    failedQueries={loadingTimedOut ? [{ name: 'All', error: new Error('Loading timed out. Please check your connection.') }] : failedQueries} 
    onRetry={handleRetry}
    showDebug={showDebug}
  />
)}
```

**Change to per-section rendering:**
```tsx
{/* Mentors Section */}
{mentorsQuery.isLoading ? (
  <HomeCarouselSkeleton title="Meet Your Mentors" />
) : displayMentors.length > 0 ? (
  <ContentCarousel title="Meet Your Mentors">
    {/* ... mentors content ... */}
  </ContentCarousel>
) : null}

{/* Alumni Section */}
{alumniTestimonialsQuery.isLoading ? (
  <HomeCarouselSkeleton title="Alumni Spotlight" />
) : displayAlumni.length > 0 ? (
  <ContentCarousel title="Alumni Spotlight">
    {/* ... alumni content ... */}
  </ContentCarousel>
) : null}

// ... same pattern for Learn and Events ...
```

**Add query configuration for resilience:**
```tsx
const mentorsQuery = useQuery({
  queryKey: ['home_mentors_all'],
  queryFn: async () => { /* ... */ },
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  retry: 2,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

---

## Files to Change

1. **`src/pages/Home.tsx`**
   - Add loading timeout protection
   - Change to per-section independent rendering
   - Add query configuration for resilience
   - Show error state when timeout fires

2. **`src/components/home/HomeErrorState.tsx`**
   - Add timeout-specific messaging
   - Improve diagnostics display

---

## Verification Steps

1. **Test Normal Loading:**
   - Open Home page
   - Sections should appear as their data loads
   - No infinite skeletons

2. **Test Slow Network:**
   - Throttle network to Slow 3G
   - Should see skeletons briefly, then content
   - If takes too long (>15s), should see error with retry

3. **Test Network Failure:**
   - Disconnect network
   - Should see error state with retry button
   - Reconnect and click retry - content should load

4. **Test with User Who Has Edition:**
   - Login as admin@admin.in
   - Countdown should show days until forge
   - Journey section should show roadmap
   - Content carousels should display

---

## Why This Will Work

1. **Loading timeout** - Ensures users never see infinite skeletons; they get actionable feedback after 15 seconds
2. **Per-section rendering** - Successful queries show content immediately even if others are slow/failing
3. **Query configuration** - Automatic retries handle transient network issues
4. **Clear error states** - Users know what's happening and can take action (retry)

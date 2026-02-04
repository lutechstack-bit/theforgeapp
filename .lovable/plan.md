

## Root Cause Analysis

After thorough investigation of the codebase, I've identified **multiple interconnected issues** causing the problems you're seeing:

---

### Issue 1: "Taking longer than expected" Error on Refresh (Production)

**Root Cause:** The `Home.tsx` page has a 15-second timeout that triggers `HomeErrorState` when any of its data queries (events, mentors, learn content, alumni) are still loading. The problem chain is:

1. **Auth context completes quickly** (session init under 3s) → routes render
2. **But `profile` and `edition` are fetched in background** → `userDataLoading=true`
3. **Home page queries depend on `profile.edition_id`** for cohort filtering
4. **React Query starts these queries immediately** even when `profile` is null
5. **Queries with `enabled: !!profile?.edition_id`** stay in "loading" state indefinitely waiting for profile
6. **15-second timeout fires** → shows "Taking longer than expected"

**Why it works on first load but fails on refresh:** 
- First load: Auth completes, profile loads, queries fire with valid edition_id
- Refresh: Race condition where page renders before profile arrives, queries never start properly

---

### Issue 2: Countdown Timer Shows "00:00:00:00"

**Root Cause:** In `Home.tsx` (line 39-52), the edition is fetched via a **separate React Query** that depends on `profile?.edition_id`:

```tsx
const { data: edition } = useQuery({
  queryKey: ['user-edition', profile?.edition_id],
  queryFn: async () => {
    if (!profile?.edition_id) return null;  // Returns null early
    // ...
  },
  enabled: !!profile?.edition_id,  // Disabled if profile not loaded
});
```

When `profile` is null (still loading), this query returns `null` → `edition` is null → `CompactCountdownTimer` receives `edition={null}` → countdown shows 00:00:00:00.

**Additionally:** The `useAuth()` context already has `edition` data! But `Home.tsx` is fetching it again redundantly instead of using `const { edition } = useAuth()`.

---

### Issue 3: "Your journey will appear here once your cohort is assigned"

**Root Cause:** In `HomeJourneySection.tsx`, `useRoadmapData()` hook checks for `roadmapDays`:

```tsx
if (!roadmapDays || roadmapDays.length === 0) {
  return (
    <section>
      ...
      <p>Your journey will appear here once your cohort is assigned.</p>
    </section>
  );
}
```

The `useRoadmapData()` hook returns empty `roadmapDays` when `profile?.edition_id` is null (line 33-37):

```tsx
if (!profile?.edition_id) {
  return [];  // No edition = no roadmap data
}
```

This happens because `profile` hasn't loaded yet when the component renders.

---

### Issue 4: Skeleton Loaders Never Resolve

**Root Cause:** The carousels (Mentors, Alumni, Learn, Events) show skeletons because their queries are "loading" but never actually fetch data:

- `mentorsQuery` → fetches immediately (no profile dependency) ✅
- `alumniTestimonialsQuery` → fetches immediately ✅
- `eventsQuery` → fetches immediately ✅
- `learnContentQuery` → fetches immediately ✅

BUT the filtering logic `displayMentors` depends on `userCohortType` which comes from `edition?.cohort_type`. When `edition` is null, filtering returns all items (fallback works), BUT the 15-second timeout still fires because `isAnyLoading` may still be true due to waterfall effects.

---

### Issue 5: forwardRef Warning (Minor)

**Root Cause:** In `BottomNav.tsx` (line 97):
```tsx
<MobileMenuSheet onClose={() => setMenuOpen(false)} />
```

The `MobileMenuSheet` component is passed directly to Sheet's children, but Sheet/SheetContent expects refs to be forwarded. This is a warning, not a blocker, but should be fixed.

---

## Fix Strategy

### Fix 1: Use AuthContext's edition data instead of redundant query

**File:** `src/pages/Home.tsx`

Remove the redundant `useQuery` for edition (lines 39-52) and use the edition from AuthContext directly:

```tsx
const { profile, edition, userDataLoading } = useAuth();
```

This eliminates the query dependency chain and uses already-loaded data.

---

### Fix 2: Add graceful loading state for when profile/edition are loading

**File:** `src/pages/Home.tsx`

Instead of showing the error state on timeout, show a more graceful "loading content" state when `userDataLoading` is true. The page should render with placeholders but NOT trigger the error timeout.

Add check:
```tsx
const isProfileLoading = userDataLoading && !profile;

// Adjust timeout to NOT fire while profile is still loading
useEffect(() => {
  // Only start timeout AFTER profile has loaded (or failed)
  if (isProfileLoading) return;
  
  if (isAnyLoading) {
    // ... existing timeout logic
  }
}, [isAnyLoading, isProfileLoading]);
```

---

### Fix 3: Update HomeJourneySection to handle loading state

**File:** `src/components/home/HomeJourneySection.tsx`

Currently shows "cohort not assigned" message when profile is loading. Should show skeleton instead:

```tsx
const { profile, userDataLoading } = useAuth();

// Show loading skeleton if profile is still loading
if (userDataLoading && !profile) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}

// Then show "cohort not assigned" only if profile loaded but has no edition
if (profile && !profile.edition_id) {
  return <section>... cohort not assigned ...</section>;
}
```

---

### Fix 4: Fix CompactCountdownTimer to handle null edition

**File:** `src/components/home/CompactCountdownTimer.tsx`

Add early return or skeleton when edition is null:

```tsx
export const CompactCountdownTimer: React.FC<CompactCountdownTimerProps> = ({ edition }) => {
  // If no edition data yet, show a loading placeholder
  if (!edition) {
    return (
      <div className="h-16 rounded-xl bg-muted/30 animate-pulse" />
    );
  }
  // ... rest of component
};
```

---

### Fix 5: Fix forwardRef warning in MobileMenuSheet

**File:** `src/components/layout/MobileMenuSheet.tsx`

Wrap component with `forwardRef`:

```tsx
export const MobileMenuSheet = React.forwardRef<
  React.ElementRef<typeof SheetContent>,
  MobileMenuSheetProps
>((props, ref) => {
  // ... component body, pass ref to SheetContent
});
MobileMenuSheet.displayName = 'MobileMenuSheet';
```

---

### Fix 6: Fix HomeErrorState forwardRef warning

**File:** `src/components/home/HomeErrorState.tsx`

Similar fix - wrap with forwardRef since it's being used in a context that may pass refs.

---

## Technical Summary

| Issue | Cause | Fix File | Change |
|-------|-------|----------|--------|
| Error on refresh | 15s timeout fires before profile loads | `Home.tsx` | Don't start timeout until profile loaded |
| 00:00:00:00 countdown | Redundant edition query | `Home.tsx` | Use `edition` from AuthContext |
| "Cohort not assigned" | Profile not loaded yet | `HomeJourneySection.tsx` | Show skeleton while loading |
| Eternal skeletons | Queries wait for null profile | `Home.tsx` | Pass profile-loading state downstream |
| forwardRef warnings | Components missing forwardRef | Multiple | Add React.forwardRef wrapper |

---

## Expected Outcome

After these fixes:
1. **On refresh:** Page shows skeletons briefly, then content appears (no error)
2. **Countdown timer:** Shows loading placeholder until edition loads, then correct countdown
3. **Journey section:** Shows skeleton while loading, then content (or "no cohort" if actually unassigned)
4. **No console warnings** for forwardRef issues
5. **Production and preview behave identically**

---

## Files to Change

1. `src/pages/Home.tsx` - Main fixes for timeout and edition query
2. `src/components/home/HomeJourneySection.tsx` - Loading state handling
3. `src/components/home/CompactCountdownTimer.tsx` - Null edition handling
4. `src/components/layout/MobileMenuSheet.tsx` - forwardRef fix
5. `src/components/home/HomeErrorState.tsx` - forwardRef fix


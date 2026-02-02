
## Goal
Fix the app-wide loading issue where pages either show infinite loading skeletons or block entirely when the user's profile has no `edition_id` assigned. Every page should load gracefully regardless of whether the user has an edition assigned.

---

## Root Cause Analysis

### 1. Cascading Dependency Chain (Core Issue)
The app has a strict dependency chain that blocks everything:
```
profile.edition_id → edition query → userCohortType → roadmapDays query
```

When `profile.edition_id` is null:
- The edition query is disabled (`enabled: !!profile?.edition_id`)
- `userCohortType` becomes undefined
- In `useRoadmapData`, the roadmapDays query has `enabled: !!profile?.edition_id && !!userCohortType` (line 80)
- This query stays **disabled forever** (never runs, never resolves)
- `isLoadingDays` stays false BUT `roadmapDays` is undefined
- Components check `if (!roadmapDays)` and show skeleton forever

### 2. Pages Affected
| Page | Blocking Issue |
|------|----------------|
| **Home** | `HomeJourneySection` shows skeleton when `roadmapDays` is undefined |
| **RoadmapLayout** | Shows "Loading your journey..." or "No Edition Assigned" blocking all nested routes |
| **Community** | Uses `profile.edition_id` for cohort group, shows spinner if no edition |
| **RoadmapJourney/Prep/Films/Gallery/Equipment** | All depend on `useRoadmapData` which blocks without edition |

### 3. Why Current Home.tsx Implementation Still Blocks
Home.tsx was updated to handle content queries correctly, but:
- `HomeJourneySection` still uses `useRoadmapData` which returns undefined `roadmapDays` when edition is missing
- The section shows skeleton indefinitely because the check is `if (!roadmapDays)` instead of checking loading state

---

## Implementation Approach

### A) Fix `useRoadmapData` to Return Empty Data Instead of Blocking
**File:** `src/hooks/useRoadmapData.ts`

**Changes:**
1. Remove the blocking `enabled` condition that prevents the query from running
2. Make the query always enabled, but return empty array when conditions aren't met
3. Ensure `isLoadingDays` correctly reflects the actual loading state

**Before (line 79-81):**
```javascript
enabled: !!profile?.edition_id && !!userCohortType
```

**After:**
```javascript
enabled: true  // Always run the query
// Inside queryFn: return [] early if no edition_id
```

### B) Fix `HomeJourneySection` to Handle Missing Data Gracefully
**File:** `src/components/home/HomeJourneySection.tsx`

**Changes:**
1. Get `isLoadingDays` from `useRoadmapData`
2. Show skeleton only while `isLoadingDays === true`
3. If not loading AND `roadmapDays` is empty/null, show a friendly empty state like "Your journey will appear here once you're assigned to a cohort"
4. Never show infinite skeleton

### C) Fix `RoadmapLayout` to Not Block the Entire UI
**File:** `src/components/roadmap/RoadmapLayout.tsx`

**Changes:**
1. Instead of showing a full-page "Loading your journey..." forever, show the hero and navigation with appropriate messaging
2. For users without an edition:
   - Show the hero with a "Coming Soon" or placeholder state
   - Show the navigation tabs (disabled or with messaging)
   - Let the Outlet render with a child-specific empty state
3. For users with edition but no roadmap data:
   - Show "Roadmap is being prepared" instead of blocking

### D) Add Loading Timeout and Fallback States App-Wide
Create a shared pattern that pages can use:

**New utility:** Add a `useLoadingTimeout` hook or inline logic that:
- After 15 seconds of loading, shows an error/retry state
- Prevents infinite skeleton states

### E) Fix Other Affected Pages

**Community.tsx (line 101-113):**
- Currently fetches cohort group only if `profile?.edition_id` exists
- If no edition, user sees loading state forever because `initializeCommunity` never completes properly
- Fix: Allow community to load with city groups even if cohort group is null

**RoadmapJourney/Prep/Films/Gallery/Equipment:**
- All check `roadmapDays` or similar data
- After useRoadmapData fix, they will receive empty arrays instead of undefined
- Ensure each shows appropriate empty state instead of blocking

---

## Detailed File Changes

### 1. `src/hooks/useRoadmapData.ts`
```diff
- enabled: !!profile?.edition_id && !!userCohortType
+ enabled: true
```
```javascript
queryFn: async () => {
+ // Return empty if no edition assigned
+ if (!profile?.edition_id) {
+   return [];
+ }
  // ... rest of existing logic
}
```

### 2. `src/components/home/HomeJourneySection.tsx`
```diff
const {
  roadmapDays,
+ isLoadingDays,
  getDayStatus,
  forgeMode,
  forgeStartDate,
  userCohortType,
} = useRoadmapData();

- if (!roadmapDays) {
+ if (isLoadingDays) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}

- if (roadmapDays.length === 0) {
+ if (!roadmapDays || roadmapDays.length === 0) {
-   return null;
+   return (
+     <section className="space-y-4">
+       <div className="mb-2">
+         <h1 className="text-2xl font-bold text-foreground">Hi {firstName}</h1>
+         <p className="text-muted-foreground">Your journey is being prepared</p>
+       </div>
+       <div className="glass-premium rounded-xl p-6 text-center">
+         <MapIcon className="h-8 w-8 text-primary/50 mx-auto mb-3" />
+         <p className="text-sm text-muted-foreground">
+           Your journey will appear here once your cohort is assigned.
+         </p>
+       </div>
+     </section>
+   );
}
```

### 3. `src/components/roadmap/RoadmapLayout.tsx`
```diff
- if (isLoadingDays) {
+ // Only show loading state for a reasonable duration
+ if (isLoadingDays && profile?.edition_id) {
  return (
    <div className="container py-6 flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Loading your journey...</p>
    </div>
  );
}

if (!profile?.edition_id) {
  return (
    <div className="container py-6">
      <div className="p-8 rounded-2xl glass-premium text-center">
        <Anchor className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">No Edition Assigned</h2>
-       <p className="text-muted-foreground">Please contact the team.</p>
+       <p className="text-muted-foreground mb-4">Please contact the team to be assigned to a cohort.</p>
+       {/* Still show navigation back to home */}
+       <Button variant="outline" onClick={() => navigate('/')}>
+         Go to Home
+       </Button>
      </div>
    </div>
  );
}
```

### 4. `src/pages/Community.tsx`
```diff
const initializeCommunity = async () => {
  setLoading(true);
  await Promise.all([fetchCityGroups(), fetchCohortGroup(), fetchStats()]);
  setLoading(false);
};

+ // Update fetchCohortGroup to handle missing edition gracefully
const fetchCohortGroup = async () => {
- if (!profile?.edition_id) return;
+ if (!profile?.edition_id) {
+   // No edition, but still allow community to load with city groups only
+   return;
+ }
  
  const { data } = await supabase
    .from('cohort_groups')
    .select('*')
    .eq('edition_id', profile.edition_id)
-   .single();
+   .maybeSingle();  // Use maybeSingle to prevent error if not found
  
  if (data) {
    setCohortGroup(data);
    setActiveGroupId(data.id);
    setActiveGroupType('cohort');
+ } else {
+   // Default to first city group if no cohort
+   if (cityGroups.length > 0) {
+     setActiveGroupId(cityGroups[0].id);
+     setActiveGroupType('city');
+   }
  }
};
```

---

## Verification Steps

### Test 1: User Without Edition
1. Create/use a test user with `edition_id = null`
2. Navigate to Home → Should show journey placeholder, other content should load
3. Navigate to /roadmap → Should show "No Edition Assigned" with navigation option
4. Navigate to /community → Should load with city groups available
5. Navigate to /learn, /events, /profile → Should all load normally

### Test 2: User With Edition  
1. Use a user with a valid edition_id
2. All pages should load normally with content
3. Roadmap should show full journey, prep items, etc.
4. Home should show countdown, journey, mentors, events

### Test 3: Loading Timeout
1. Throttle network to Slow 3G
2. Pages should show skeletons briefly then resolve
3. If queries take >15 seconds, should show retry option

### Test 4: Network Error
1. Disconnect network temporarily
2. Error states should appear with retry buttons
3. Retry should work when network is restored

---

## Files to Change
1. `src/hooks/useRoadmapData.ts` - Remove blocking enabled condition
2. `src/components/home/HomeJourneySection.tsx` - Handle loading/empty states properly
3. `src/components/roadmap/RoadmapLayout.tsx` - Improve no-edition and loading states
4. `src/pages/Community.tsx` - Handle missing edition gracefully
5. `src/pages/roadmap/RoadmapJourney.tsx` - Ensure empty state is handled
6. `src/pages/roadmap/RoadmapPrep.tsx` - Ensure empty state is handled
7. `src/pages/roadmap/RoadmapFilms.tsx` - Already has empty state (OK)
8. `src/pages/roadmap/RoadmapGallery.tsx` - Already has empty state (OK)
9. `src/pages/roadmap/RoadmapEquipment.tsx` - Ensure empty state works

---

## Why This Will Work
1. **No more disabled queries** - Queries run and return empty instead of staying pending
2. **Clear state distinction** - Loading vs Empty vs Error are all handled differently
3. **Graceful degradation** - Users without editions can still use most of the app
4. **No infinite skeletons** - Every loading state resolves to either content or empty state
5. **Consistent pattern** - All pages follow the same loading/error/empty handling

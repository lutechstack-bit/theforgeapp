
## What’s actually happening (root cause with evidence)

### Symptoms you’re seeing
- After login, **refresh** shows:
  - “Your journey is being prepared / cohort assigned” (even though it was working)
  - After ~15s: **“Taking longer than expected”**
  - Sometimes a full-screen **“Something went wrong”** (ErrorBoundary) on desktop
- Happens on **both Preview and Published**, and on **Safari Mac + Chrome/Edge**.

### Evidence from in-app diagnostics
- With `/?homeDebug=1`, the **Home Debug Panel shows**:
  - Events: ⏳, Learn: ⏳, Mentors: ⏳, Alumni: ⏳
  - User Cohort: **(none)**
- At the same time, the network capture did **not show any completed XHR/fetch calls** for those queries, which strongly suggests **queries are stuck in a “pending” state** (not erroring, not completing).

### Core root cause (there are two coupled problems)

#### Root cause A — “Hardened startup” timeouts create an inconsistent state
In `AuthContext.tsx`, profile/edition fetching is “non-blocking” and wrapped in a 5s timeout:
- If the request is slow or stalls, `withTimeout(..., 5000)` returns `null`
- The app then sets:
  - `profile = null`
  - `edition = null`
  - `userDataLoading = false`

This causes two downstream problems:
1) **Home starts its 15s timeout only after** `userDataLoading` becomes `false`.  
   If profile fetch silently timed out, Home incorrectly assumes “user data is ready” and begins timing out the content queries.
2) Components that rely on profile/edition (Roadmap, Journey header, cohort filtering) now behave as if:
   - the user has no cohort, and
   - roadmap has no days,
   even though the real issue is “profile fetch didn’t finish”.

So refresh produces a misleading “cohort not assigned” UI and then the timeout error.

#### Root cause B — Some data queries can hang indefinitely (no abort) and React Query stays ⏳
Your Home page queries (events/learn/mentors/alumni) throw on error, but **they never reach error**—they remain `isLoading`.
That happens when the underlying fetch **stalls/hangs** (common on flaky networks and occasionally on mobile Safari/Chrome) because:
- there is **no request-level abort timeout** (native fetch can hang for a long time),
- and React Query will keep the query in loading state.

This is exactly why you get “Taking longer than expected” after 15 seconds: the UI timeout triggers, but the requests are still stuck.

### Important note (why it “never happened before”)
These issues tend to appear when one of these changes happens:
- a stricter timeout was introduced (profile fetch = 5 seconds),
- the app started rendering more while user data is unresolved (by design),
- or some users/devices encounter transient stalls to the backend endpoints (which becomes visible because there’s no abort).

This is not “1000 users will break the backend” by itself; it’s primarily **client resilience**: the app must handle slow/stalled requests and never silently treat “timed out” as “no cohort”.

---

## The fix strategy (make refresh bulletproof)

We’ll implement three layers:

### Layer 1 — Don’t convert “timeout” into “null profile”
**Goal:** If profile fetch times out, don’t pretend the user has no profile/cohort. Instead mark a dedicated error state and keep recovery paths.

Changes in `src/contexts/AuthContext.tsx`:
- Add explicit states:
  - `userDataError: Error | null`
  - `userDataTimedOut: boolean`
  - `lastUserDataFetchAt: number`
- Update `withTimeout` usage so timeouts do NOT set `profile=null` as “truth”.
  - If timed out:
    - keep existing `profile/edition` (if any) instead of overwriting with null
    - set `userDataTimedOut=true` and `userDataError` with a meaningful message
    - keep background retry running (see Layer 2)
- Add a “retry profile fetch” mechanism that:
  - retries automatically (exponential backoff) a few times
  - and also retries on:
    - window focus
    - browser coming back online
- If timed out repeatedly, show a **purpose-built recovery UI** (reusing your existing “AuthRecovery” pattern) but for user data:
  - “We couldn’t load your profile data”
  - buttons: Retry, Clear Cache & Reload

Why this matters:
- It prevents the app from mistakenly switching to “cohort not assigned”.
- It avoids cascading UI timeouts caused by incorrect `userDataLoading=false`.

### Layer 2 — Add request-level abort timeouts for backend reads
**Goal:** Any backend read should fail fast (e.g., 8–12 seconds), so React Query moves to `isError` and users can retry. No more infinite ⏳.

Implementation approach:
- Create a small utility in `src/lib/` (e.g., `queryTimeout.ts`) that wraps a promise and rejects after X ms.
- Wrap every critical `useQuery` queryFn (Home queries + roadmap queries + sidebar highlights) like:
  - `await promiseWithTimeout(supabaseCallPromise, 12000, 'home_mentors_all')`
- When timeout occurs, throw an Error with a recognizable message (e.g., `FORGE_TIMEOUT:` prefix) so the UI can detect and display a correct message.

Where we apply this first (highest impact):
- `src/pages/Home.tsx` queries:
  - events
  - learn_content
  - mentors
  - alumni_testimonials
- `src/hooks/useRoadmapData.ts` roadmap days query and sidebar-related queries that impact Home rendering

This ensures:
- The app shows an actionable error state, not endless loading.
- “Try Again” actually has a chance to succeed because queries aren’t stuck forever.

### Layer 3 — Fix roadmap query enabling + remove “instant []” caching
**Goal:** Roadmap should not cache an empty result just because profile wasn’t ready at that moment.

In `src/hooks/useRoadmapData.ts`:
- Change the roadmap-days query:
  - Remove `enabled: true`
  - Replace with:
    - enabled only when:
      - `!userDataLoading` AND
      - `profile` is known (or explicitly known missing) AND
      - when edition is present: `!!profile.edition_id`
  - If there is truly no edition assigned, we still return `[]`, but only after we know profile is loaded successfully.
- Add a distinct UI message path:
  - “Loading your journey…” (while profile is loading)
  - “Your cohort isn’t assigned yet” (profile loaded AND edition_id is null)
  - “We couldn’t load your profile data” (profile fetch failed/timed out)

In `src/components/home/HomeJourneySection.tsx`:
- Update empty state decision tree:
  1) if `userDataLoading` → skeleton
  2) if `userDataTimedOut` or `userDataError` → show “Couldn’t load profile” with Retry
  3) if `profile && !profile.edition_id` → show “cohort not assigned”
  4) else if roadmapDays empty → show “journey not configured yet” (admin/config issue) rather than cohort message

---

## Address the “Something went wrong” (ErrorBoundary) screen
That screen means a runtime exception is being thrown (not just slow queries).

We will:
1) Audit the components that always mount on Home:
   - `RoadmapSidebar`
   - `FloatingHighlightsButton`
   - `AdminCohortSwitcher`
   - `CompactCountdownTimer`
2) Ensure they are null-safe when `profile` or `edition` is temporarily unavailable.
3) Add a tiny “crash signature” logger inside `ErrorBoundary.componentDidCatch` (console + optional backend logging in a later step) so we can pinpoint the exact component/line if it ever happens again in production.

---

## Fix the remaining ref warning (quality + stability)
Console still shows “Function components cannot be given refs” referencing `BottomNav`. Even if it’s “just a warning”, it’s better to eliminate it (and in some UI-lib compositions it can cause weird runtime behavior).

Change:
- `src/components/layout/BottomNav.tsx` → wrap export in `React.forwardRef` (or ensure it’s never used where a ref is passed). This completes the ref-forwarding cleanup.

---

## Implementation checklist (files we’ll change)

### Auth + startup resilience
- `src/contexts/AuthContext.tsx`
  - introduce `userDataError`, `userDataTimedOut`
  - change timeout behavior to not overwrite profile/edition with null
  - add retry/backoff and retry triggers (focus/online)
  - expose `refreshProfile()` that also clears timedOut state

### Query abort timeouts
- Add `src/lib/promiseTimeout.ts` (or similar)
- Update:
  - `src/pages/Home.tsx` queryFns wrapped with timeout
  - `src/hooks/useRoadmapData.ts` queryFns wrapped with timeout
  - (If needed) `src/components/roadmap/RoadmapSidebar.tsx` and the FAB hook/queries

### Roadmap query enable + UI logic
- `src/hooks/useRoadmapData.ts`
  - fix roadmap-days query `enabled` logic
  - ensure no “instant []” unless we truly know there’s no edition
- `src/components/home/HomeJourneySection.tsx`
  - correct empty state logic using new auth flags

### ErrorBoundary improvements (diagnostic)
- `src/components/error/ErrorBoundary.tsx`
  - include a short “Error ID” / “last action” info (optional)
  - keep existing recovery buttons

### Ref forwarding cleanup
- `src/components/layout/BottomNav.tsx`
  - forwardRef or adjust usage to avoid refs

---

## How we will verify (end-to-end tests)
1) Login → land on Home → confirm content loads.
2) Refresh immediately after login (multiple times):
   - Home content still loads; no “Taking longer than expected”
3) Enable `/?homeDebug=1`:
   - verify the debug panel shows queries progress to ✅
   - verify `User Cohort` shows correctly once profile/edition loaded
4) Simulate slow network (browser throttling):
   - confirm queries fail within ~12s with a clear error + retry
   - retry recovers without hard reload
5) Mobile Safari test:
   - same refresh scenario, confirm no stuck loading
6) Confirm no ref warnings in console.

---

## Expected outcome
- Refresh becomes safe and consistent:
  - No false “cohort not assigned” due to timeouts
  - No indefinite ⏳ (backend reads either succeed or fail fast)
  - Users see actionable recovery instead of broken state
- Much stronger behavior under real-world conditions (spotty mobile networks), which is what matters for 1000+ users.

---

## One critical follow-up question (only if you want)
To ensure the published domain behaves exactly the same: are users installing the app as a PWA (Add to Home Screen), or using it in Safari/Chrome normally?  
If PWAs are used, we’ll also add a small “Version / Update available” indicator and force-refresh logic when a new build is detected to prevent stale bundles.

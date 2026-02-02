
Goal
- Fix the Home page showing the “Content Coming Soon” empty state even when content exists.
- Make failures visible (loading vs error vs truly empty) so it’s obvious why content is/isn’t showing.

What I found (why it looks like “nothing” is on Home)
- Home (src/pages/Home.tsx) shows “Content Coming Soon” when all of these are empty/undefined:
  - mentors
  - alumniTestimonials
  - learnContent
  - events
- Right now, the empty-state condition treats “undefined (still loading or errored)” the same as “empty array (truly no content)”. That means:
  - If any query is still loading, the empty state can flash.
  - If any query errors (permissions/network), the empty state can appear permanently with no visible error.
- The backend tables actually contain content (mentors, alumni testimonials, learn content, and homepage events), so the most likely causes are:
  - One or more queries are erroring (silently), or
  - Queries are never firing/finishing in that environment, or
  - Cohort filtering removes all results (and we don’t fall back).

Implementation approach (frontend only)
A) Make Home “state-aware”: Loading vs Error vs Empty vs Content
1) Update Home.tsx to capture query states:
   - For each useQuery call (events, learnContent, mentors, alumniTestimonials), also read:
     - isLoading / isFetching
     - isError
     - error
     - isFetched
2) Change the empty-state condition so it only renders when:
   - All queries have finished fetching (isFetched for each), AND
   - None are in an error state, AND
   - All final arrays are truly empty.

B) Add visible loading placeholders (so Home never looks broken)
1) While queries are loading:
   - Keep the countdown + journey section visible.
   - Show lightweight skeletons for the carousels (Mentors / Alumni / Learn / Events) instead of immediately showing “Content Coming Soon”.

C) Add a visible error state with a Retry button (so we stop guessing)
1) If any query errors:
   - Render a card/banner such as:
     - “We couldn’t load home content. Please try again.”
   - Add a “Retry” button that triggers refetch/invalidate for the failed queries (via React Query’s useQueryClient()).
2) In Preview/dev only, optionally show a compact details block:
   - Which query failed + the error message
   - Current route
   - Whether the user is authenticated

D) Make cohort filtering resilient (so content doesn’t disappear due to cohort mismatch)
Right now, mentors/testimonials are filtered at the query layer using `.contains('cohort_types', [userCohortType])`.
To prevent “no content” due to filtering edge cases, refactor to:
1) Fetch all active mentors/testimonials once.
2) Filter client-side:
   - If user cohort exists: show items that include it.
   - If that produces 0 results: fall back to showing all active items (or show a small “No cohort-specific mentors yet” note and still show global items).
This avoids extra round trips and prevents silent “filtered to nothing”.

E) (Optional but recommended) Add a debug switch
- Add a `?homeDebug=1` query param that, when present, shows a small debug panel:
  - Query statuses (loading/error/success)
  - Counts returned
  - Helpful for diagnosing issues on custom domain vs preview quickly.

Files to change
- src/pages/Home.tsx
  - Adjust query state handling
  - Add loading/error UI
  - Fix empty-state logic
  - Refactor cohort filtering to client-side with safe fallback

Verification steps (end-to-end)
1) In Preview:
   - Open “/” and confirm you see loading skeletons briefly (not “Content Coming Soon” immediately).
   - Once loaded, confirm at least one section appears (Mentors / Alumni / Learn / Events).
2) Force a failure scenario:
   - Temporarily disable network (or simulate) and confirm you see a clear error card + Retry.
3) Confirm empty state:
   - Only appears if the backend truly has no content AND queries succeeded.
4) Mobile check:
   - Ensure layout doesn’t collapse or hide content on smaller widths.

Why this will solve it
- It prevents “Content Coming Soon” from masking the real issue (loading vs error).
- It ensures cohort filtering can’t accidentally hide everything.
- It makes problems diagnosable immediately without guessing.

Notes (related, but separate from Home)
- Marker.io still shows a 403 ping in preview, which is a Marker-side domain verification issue; once Home is fixed, we can add a similar visible “Marker blocked for this domain” diagnostic if you want so it never fails silently again.

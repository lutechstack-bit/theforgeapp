
Issue diagnosis:
- The filter row in `AllCourses` is scrollable, but it does not auto-scroll to the active tab.
- When `activeFilter` is `community_sessions` (often via `?section=community_sessions`), the selected third pill starts partially off-screen.
- Button chips also miss `flex-shrink-0`, so long labels can compress/clamp awkwardly on narrow mobile widths.

Implementation steps:
1. Update `src/pages/AllCourses.tsx` filter tabs to support active-chip auto-scroll:
   - Add `useRef` for the scroll container and active button.
   - Add `useEffect` that runs on `activeFilter` and calls `activeButtonRef.current?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })`.
2. Make each filter button stable width behavior:
   - Add `flex-shrink-0` to filter button classes.
   - Keep `whitespace-nowrap` so labels stay readable.
3. Improve edge visibility in horizontal scroll:
   - Keep/adjust end padding (`pr-8`) and add a small start padding strategy (`pl-1` or container inner wrapper) so first/last pills never appear clipped against viewport edges.
4. Verify with initial states:
   - Load `/all-courses?section=community_sessions` and confirm “Community Sessions” pill is fully visible on first paint.
   - Toggle across all three filters and ensure no clipping on 320px/375px widths.

Technical details:
- File: `src/pages/AllCourses.tsx`
- React hooks to add: `useEffect`, `useRef`
- DOM behavior: scroll active filter chip into view whenever selected filter changes
- CSS class adjustments: add `flex-shrink-0` to pills; preserve horizontal overflow for touch scrolling

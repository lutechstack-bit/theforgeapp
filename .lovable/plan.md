

# Fix Upcoming Online Sessions — Cohort-Aware Filtering + Uniform Cards

## Problem
1. **No cohort filtering** — the query fetches ALL `roadmap_days` where `is_virtual=true` regardless of cohort. Writing cohort users (who have NO online sessions) still see Filmmaking/Creators sessions.
2. **Unequal card heights** — variable description lengths cause inconsistent card sizes in the scroll row.
3. **Calendar button only supports Google** — the Roadmap's `SessionDetailModal` already supports 4 providers (Google, Apple, Outlook, Yahoo) but the card's calendar icon only does Google.

## Changes — `src/components/learn/UpcomingSessionsSection.tsx`

### 1. Add cohort-aware filtering
- Import `useEffectiveCohort` hook to get the user's `effectiveEdition`
- Filter the `roadmap_days` query by `edition_id` (matching how `useRoadmapData` does it)
- Include the query key with `edition_id` so it re-fetches on cohort switch
- If no `edition_id` is available, return empty (section hides itself via `sessions.length === 0`)
- **Writing cohort**: Since Writing editions have no virtual `roadmap_days`, the query returns empty and the entire section auto-hides

### 2. Fix card height consistency
- Remove the conditional `{session.description && ...}` block from the card face (description stays in the detail modal)
- Set `min-h-[160px]` on the inner card container with `flex flex-col`
- Pin action row to bottom with `mt-auto`

### 3. Keep SessionDetailModal (already has full features)
- The existing modal already has: Join Zoom button, Meeting ID/Passcode display, 4-provider calendar sync
- This matches the Roadmap's online session functionality exactly

### 4. Upgrade card calendar button to 4-provider popover
- Replace the single Google Calendar `onClick` with a `Popover` containing Google, Apple, Outlook, Yahoo options (same pattern as `SessionDetailModal`)

## File
`src/components/learn/UpcomingSessionsSection.tsx` — single file edit


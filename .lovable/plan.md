

# Fix Reversed Session Numbers Across the App

## Problem
Online sessions use negative `day_number` values (-7 through -1). The code displays `Math.abs(day_number)` as the session number, so the first session (day -7) shows as "SESSION 7" and the last (day -1) shows as "SESSION 1" — completely backwards.

## Affected Files (5 locations)

| File | Line | Current | Should Be |
|------|------|---------|-----------|
| `SessionDetailCard.tsx` | 28 | `SESSION ${Math.abs(day.day_number)}` | `SESSION ${totalOnline + day.day_number + 1}` |
| `HomeJourneySection.tsx` | 106 | `S${Math.abs(day.day_number)}` | `S${index + 1}` (already in a `.map()`) |
| `RoadmapJourney.tsx` | 91 | `S${Math.abs(day.day_number)}` | `S${index + 1}` (already in a `.map()`) |
| `UpcomingSessionsSection.tsx` | 107 | `{Math.abs(session.day_number)}` | Computed session index |
| `SessionDetailModal.tsx` | 87, 92 | `{Math.abs(session.day_number)}` | Computed session index |

## Fix Approach

The online sessions are already sorted by `day_number` ascending (-7, -6, -5...). The correct session number is simply the position in that sorted list (1-indexed).

- **`HomeJourneySection.tsx`** and **`RoadmapJourney.tsx`**: The `.map()` already provides an index. Change fallback label from `S${Math.abs(day.day_number)}` to `S${index + 1}`.

- **`SessionDetailCard.tsx`**: This component receives a single day and doesn't know the total count. Pass a `sessionNumber` prop from the parent, or compute it as `totalOnlineSessions + day_number + 1` (since day -7 with 7 total → 1, day -1 with 7 total → 7). The parent (`HomeJourneySection`) already has `onlineSessions.length`.

- **`UpcomingSessionsSection.tsx`** and **`SessionDetailModal.tsx`**: Same fix — compute session number from the total online sessions count and the day_number, or pass it through.

## Changes

### 1. `SessionDetailCard.tsx`
Add optional `sessionNumber` prop. Use it in the badge: `SESSION ${sessionNumber}` instead of `SESSION ${Math.abs(day.day_number)}`.

### 2. `HomeJourneySection.tsx`
- Pass `sessionNumber` to `SessionDetailCard` computed from the online sessions array index.
- Fix pill fallback label: use `S${index + 1}`.

### 3. `RoadmapJourney.tsx`
- Same pill label fix: `S${index + 1}`.
- Pass `sessionNumber` to any detail card rendered.

### 4. `UpcomingSessionsSection.tsx`
Compute session number from total online count: replace `Math.abs(session.day_number)` with the correct sequential number.

### 5. `SessionDetailModal.tsx`
Accept a `sessionNumber` prop or compute it similarly. Replace both occurrences of `Math.abs(session.day_number)`.

All cohorts are affected equally since they all use negative day_numbers for online sessions.


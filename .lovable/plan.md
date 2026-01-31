

# Remove Pre-Forge Session Lock for 15K Paid Users

## Problem

Currently, Pre-Forge online session meeting details (Zoom links, meeting IDs, passcodes) are hidden until 48 hours before the session start time. This affects all users including those who have paid ₹15K and are confirmed participants.

**Current behavior:**
- PRE_FORGE mode + session >48 hours away → Shows "Meeting details will be available 48 hours before the session"
- PRE_FORGE mode + session ≤48 hours away → Shows full meeting card with Zoom details
- DURING_FORGE mode → Always shows full meeting card

**Requested behavior:**
- All enrolled users (₹15K paid) should see meeting credentials immediately for pre-forge sessions without waiting for the 48-hour window

---

## Solution

Update the `DayDetailModal` component to always show meeting credentials for authenticated users (who have paid ₹15K). Since only enrolled users can access the Roadmap page, we can safely remove the 48-hour time restriction for Pre-Forge sessions.

---

## File to Change

### `src/components/roadmap/DayDetailModal.tsx`

**Current logic (lines 72-82):**
```tsx
// Calculate if we should show meeting credentials (48 hours before session or during forge)
const sessionDate = day.date ? new Date(day.date) : null;
const hoursUntilSession = sessionDate 
  ? (sessionDate.getTime() - Date.now()) / (1000 * 60 * 60) 
  : Infinity;

// Show meeting card if: During Forge OR session is within 48 hours
const showMeetingCard = forgeMode === 'DURING_FORGE' || (hoursUntilSession <= 48 && hoursUntilSession > -24);

// Show "coming soon" message if: Pre-Forge AND session is more than 48 hours away
const showMeetingComingSoon = forgeMode === 'PRE_FORGE' && hoursUntilSession > 48;
```

**New logic:**
```tsx
// Always show meeting card for enrolled users (they've paid 15K, they should have access)
// Only hide if session is more than 24 hours in the past
const sessionDate = day.date ? new Date(day.date) : null;
const hoursUntilSession = sessionDate 
  ? (sessionDate.getTime() - Date.now()) / (1000 * 60 * 60) 
  : Infinity;

// Show meeting card: Always show for valid sessions (not more than 24h in the past)
const showMeetingCard = hoursUntilSession > -24;

// Never show "coming soon" - users always have access to meeting details
const showMeetingComingSoon = false;
```

---

## What Changes

| Before | After |
|--------|-------|
| Meeting details hidden until 48h before session | Meeting details always visible |
| Shows "Coming soon" message in Pre-Forge | No more "coming soon" message |
| Time-gated access to Zoom credentials | Immediate access for enrolled users |

---

## Why This Is Safe

1. **Only enrolled users can access Roadmap** - The roadmap is behind authentication
2. **All users on the platform have paid ₹15K** - They're confirmed participants
3. **Virtual sessions are cohort-specific** - Users only see sessions for their edition
4. **No security risk** - The meeting credentials aren't being exposed to unauthenticated users

---

## Summary

Remove the 48-hour time restriction from `DayDetailModal.tsx` so that Pre-Forge session meeting credentials (Zoom links, IDs, passcodes) are immediately visible to all enrolled users who have paid ₹15K.


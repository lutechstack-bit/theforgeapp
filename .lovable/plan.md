
# Fix Roadmap Progress Calculation Bug

## Problem Summary

The roadmap is showing **86% (6/7 days) complete** when the Forge starts in 8 days because:

1. **Fallback data has wrong dates**: When the user's edition has no `roadmap_days`, the system finds days from another edition with hardcoded dates from 2025
2. **Date preservation bug**: The code preserves `day.date` if it exists, even when it's from a different edition
3. **Wrong status calculation**: Since `2025-02-15 < 2026-01-31` (today), those days show as "completed"

### Database Evidence

**User's Edition:**
- "Forge Filmmaking - Edition 14" with `forge_start_date: 2026-02-07`
- Has **zero** roadmap_days entries

**Fallback Edition Used:**
- "Forge Filmmaking - Goa Feb 2025" with hardcoded dates like `2025-02-15`, `2025-02-16`...
- These dates are in the past relative to today

---

## Solution

### Part 1: Fix Date Calculation in `useRoadmapData.ts`

**Current Logic (BROKEN):**
```typescript
// Only calculates date if day.date is null
if (day.date) {
  return day; // KEEPS wrong 2025 dates from fallback edition!
}
```

**New Logic:**
```typescript
// Always recalculate dates based on user's forge_start_date for physical days
// Only keep day.date for online sessions (day_number < 0) from user's OWN edition
const shouldKeepOriginalDate = 
  day.date && 
  day.edition_id === profile?.edition_id && 
  day.day_number < 0; // Online sessions with fixed meeting times

if (shouldKeepOriginalDate) {
  return day;
}

// Calculate date for all other days based on user's forge_start_date
```

### Part 2: Handle Online Sessions (Negative Day Numbers)

Online sessions (day_number -5 to 0) may have specific dates that should be preserved **only if from user's own edition**.

For fallback templates, online session dates should also be calculated relative to `forge_start_date`.

### Part 3: Fix Status Calculation for PRE_FORGE

In `getDayStatus`, when `forgeMode === 'PRE_FORGE'`, ALL physical days (day_number >= 1) should be "upcoming", regardless of calculated dates.

**Current issue:** The function compares dates even in PRE_FORGE mode.

**Fix:** Add explicit PRE_FORGE handling to return 'upcoming' for all active days.

---

## Files to Change

### 1. `src/hooks/useRoadmapData.ts`

**Changes:**
- Update date calculation memo to always recalculate for fallback data
- Only preserve original dates for user's own edition's online sessions
- Add `profile.edition_id` to dependency array
- Fix `getDayStatus` to respect `forgeMode` for all calculations

### 2. `src/components/roadmap/JourneyStats.tsx`

**Validation only** - Ensure it receives correct `completedCount`/`totalCount` (no code change needed)

### 3. `src/components/roadmap/RoadmapHero.tsx`

**Validation only** - Ensure it receives correct progress values (no code change needed)

---

## Technical Implementation

### Updated Date Calculation Logic

```typescript
const roadmapDays = useMemo(() => {
  if (!templateDays) return [];
  
  return templateDays.map(day => {
    // For online sessions (negative day numbers) from user's OWN edition, keep the date
    const isOwnEditionOnlineSession = 
      day.edition_id === profile?.edition_id && 
      day.day_number < 0 && 
      day.date;
    
    if (isOwnEditionOnlineSession) {
      return day;
    }
    
    // Calculate all other dates based on user's forge_start_date
    let calculatedDate: string | null = null;
    
    if (forgeStartDate) {
      if (day.day_number > 0) {
        // Physical days: Day 1 = forge_start_date, Day 2 = forge_start_date + 1, etc.
        const dayDate = new Date(forgeStartDate);
        dayDate.setDate(dayDate.getDate() + (day.day_number - 1));
        calculatedDate = dayDate.toISOString().split('T')[0];
      } else if (day.day_number < 0) {
        // Online sessions: negative days before forge_start_date
        const dayDate = new Date(forgeStartDate);
        dayDate.setDate(dayDate.getDate() + day.day_number);
        calculatedDate = dayDate.toISOString().split('T')[0];
      }
      // day_number === 0 (Pre-Forge Preparation) has no date
    }
    
    return {
      ...day,
      date: calculatedDate
    };
  });
}, [templateDays, forgeStartDate, profile?.edition_id]);
```

### Updated Status Calculation Logic

```typescript
const getDayStatus = (day: RoadmapDay): 'completed' | 'current' | 'upcoming' | 'locked' => {
  if (!day.is_active) return 'locked';
  
  // Admin testing mode handling (existing code)...
  
  // PRE_FORGE: All days are upcoming (none completed yet)
  if (forgeMode === 'PRE_FORGE') {
    // Day 0 (Pre-Forge Prep) is "current" before forge starts
    if (day.day_number === 0) return 'current';
    return 'upcoming';
  }
  
  // POST_FORGE: All days are completed
  if (forgeMode === 'POST_FORGE') {
    return 'completed';
  }
  
  // DURING_FORGE: Use date comparison (existing logic)
  if (!day.date) {
    return 'current'; // Day 0 without date during forge
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayDate = new Date(day.date);
  dayDate.setHours(0, 0, 0, 0);
  
  if (dayDate < today) return 'completed';
  if (dayDate.getTime() === today.getTime()) return 'current';
  return 'upcoming';
};
```

---

## Expected Behavior After Fix

### PRE_FORGE (8 days until start)
| Display | Value |
|---------|-------|
| Progress Ring | 0% |
| Days Complete | 0/7 (or 0/8 with Pre-Forge) |
| Day 0 Status | Current |
| Days 1-7 Status | Upcoming |

### DURING_FORGE (Day 3)
| Display | Value |
|---------|-------|
| Progress Ring | 28% |
| Days Complete | 2/7 |
| Days 1-2 Status | Completed |
| Day 3 Status | Current |
| Days 4-7 Status | Upcoming |

### POST_FORGE
| Display | Value |
|---------|-------|
| Progress Ring | 100% |
| Days Complete | 7/7 |
| All Days Status | Completed |

---

## Summary

| Issue | Root Cause | Fix |
|-------|------------|-----|
| Wrong progress % | Fallback dates from 2025 treated as past | Recalculate all dates based on user's `forge_start_date` |
| 6/7 completed in PRE_FORGE | Date comparison ignores forgeMode | Add explicit PRE_FORGE/POST_FORGE handling |
| Online sessions wrong dates | Preserved dates from other editions | Only preserve dates from user's OWN edition |

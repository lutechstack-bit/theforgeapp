

# Fix: Pre Forge Cards Showing Portrait Instead of Landscape

## Problem
All existing `bfp_sessions` rows in the database have `card_layout = 'portrait'` (set by the column default when it was added). The code on line 298 of `Learn.tsx` checks `item.card_layout || defaultCardLayout` -- but since the value is `'portrait'` (not null), the `defaultCardLayout="landscape"` fallback is never reached.

## Solution (2 changes)

### 1. Database Migration
Update all existing `bfp_sessions` rows to use `'landscape'`:
```sql
UPDATE public.learn_content
SET card_layout = 'landscape'
WHERE section_type = 'bfp_sessions';
```

### 2. Change the column default
Change the default for future `bfp_sessions` content so admins don't have to manually set it:
```sql
ALTER TABLE public.learn_content
ALTER COLUMN card_layout SET DEFAULT 'portrait';
```
(This is already the default, so no change needed here -- only the data update above.)

## Files Modified

| File | Change |
|------|--------|
| Database migration | `UPDATE learn_content SET card_layout = 'landscape' WHERE section_type = 'bfp_sessions'` |

No code file changes needed -- the `LearnCourseCard` landscape variant and `Learn.tsx` logic are already correct. The only issue is the data.

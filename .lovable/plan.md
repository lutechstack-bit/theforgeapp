

# Fix Pre Forge Session Card Backgrounds

## Problem
The old thumbnail images stored in the database for each pre-forge session card contain text and graphics that bleed through the golden gradient overlay, creating a messy double-text effect.

## Solution

### 1. Copy new image to project
Copy the uploaded clean image (`Adv_PP_3_1.png`) to `public/images/learn/pre-forge-placeholder.png`, replacing the current placeholder.

### 2. Update all database records
Set `thumbnail_url` to `/images/learn/pre-forge-placeholder.png` for all 15 `bfp_sessions` rows. This ensures every card uses the clean background image instead of the old per-card thumbnails.

```sql
UPDATE public.learn_content
SET thumbnail_url = '/images/learn/pre-forge-placeholder.png'
WHERE section_type = 'bfp_sessions';
```

Later, you can change individual card images from the admin panel -- the `thumbnail_url` field is already editable per card.

## Files Modified

| File | Change |
|------|--------|
| `public/images/learn/pre-forge-placeholder.png` | Replaced with new clean image |
| Database | All 15 `bfp_sessions` rows updated to use new image path |

No code changes needed -- the `LearnCourseCard` component already reads `thumbnail_url` from the database.



# Replace Alumni Testimonials with Student Works in Alumni Showcase

## What the user wants
The "Alumni Showcase" section on the Home page currently shows data from the `alumni_testimonials` table. The user wants it to show `user_works` (student portfolio projects) instead, and wants the alumni testimonials feature removed entirely.

## Changes

### 1. Rewrite Home.tsx alumni query → user_works query
Replace the `alumni_testimonials` fetch with a query to `user_works` table, selecting works that have video/media content. Map the `user_works` fields to the `AlumniData` interface expected by `AlumniShowcaseSection`:
- `title` → `film`
- `user_id` → look up name from profiles (or just use title)
- `thumbnail_url` → `thumbnail_url`
- `media_url` → `video_url`

Since `user_works` doesn't have a `name` field (it's per-user), we need to join with `profiles` to get the creator's name. However, RLS on `user_works` only allows viewing own works or public portfolio works. We'll query works that have public portfolios enabled (matching the existing RLS policy `Public can view works for public portfolios`).

### 2. Update AlumniShowcaseSection component
Minor adjustments to handle `user_works` data shape — the component interface (`AlumniData`) stays the same since we map in Home.tsx.

### 3. Remove Admin Alumni Testimonials page
- Delete `src/pages/admin/AdminAlumniTestimonials.tsx`
- Remove route from `src/App.tsx` (line 279)
- Remove import from `src/App.tsx` (line 56)
- Remove sidebar link from `src/components/admin/AdminLayout.tsx` (line 49)

### 4. Clean up Home.tsx
- Remove `extractYouTubeId` import (if no longer needed)
- Update query key, error labels, debug panel text

### 5. AdminDocs reference cleanup
- Remove the `alumni_testimonials` row from the documentation table in `AdminDocs.tsx`

### Files to modify
- `src/pages/Home.tsx` — Replace alumni_testimonials query with user_works + profiles query
- `src/components/admin/AdminLayout.tsx` — Remove Alumni Testimonials sidebar link
- `src/App.tsx` — Remove route and import for AdminAlumniTestimonials

### File to delete
- `src/pages/admin/AdminAlumniTestimonials.tsx`

### Database note
The `alumni_testimonials` table will remain in the database (no migration needed to drop it), but it will no longer be referenced by any frontend code.


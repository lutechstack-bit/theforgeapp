

# Alumni Showcase — Cohort-Specific, Admin-Managed

## Problem
The current Alumni Showcase section on the homepage pulls from `user_works` (student portfolios), which is empty, showing "Content Coming Soon." The user wants a proper admin-managed showcase with different media types per cohort:
- **Filmmaking**: Video showcase (landscape, with play button)
- **Writing**: Image showcase (book covers — portrait cards)
- **Creators**: Reels-style vertical videos

## Database

### New table: `alumni_showcase`
| Column | Type | Purpose |
|--------|------|---------|
| id | uuid PK | |
| title | text NOT NULL | Work title (e.g. "Ocean Eyes, Starry Skies") |
| author_name | text NOT NULL | Creator name |
| cohort_type | text NOT NULL | `FORGE`, `FORGE_WRITING`, `FORGE_CREATORS` |
| media_type | text NOT NULL | `video`, `image`, `reel` |
| media_url | text | Video URL or image URL |
| thumbnail_url | text | Thumbnail for videos |
| redirect_url | text | Optional external link |
| description | text | Optional subtitle/achievement |
| order_index | int DEFAULT 0 | Sort order |
| is_active | boolean DEFAULT true | |
| created_at | timestamptz DEFAULT now() | |

RLS: Public SELECT where `is_active = true`, admin ALL via `has_role`.

## Admin Changes — New tab in `AdminLearn.tsx`

Add a 4th tab **"Alumni Showcase"** with:
- Sub-toggle: **Filmmaking** / **Writing** / **Creators** (filters by `cohort_type`)
- Card list showing each showcase item with thumbnail, title, author
- **Add Item** dialog with:
  - Title, Author Name inputs
  - Cohort Type select (auto-set from sub-toggle)
  - Media Type select (auto-set based on cohort: video for FORGE, image for WRITING, reel for CREATORS)
  - Image/video upload via `FileUpload` to `learn-thumbnails` bucket
  - Redirect URL input (optional)
  - Order index, active toggle
- Edit/Delete per card

## Frontend Changes — `AlumniShowcaseSection.tsx` + `Home.tsx`

### `Home.tsx`
- Replace the `user_works` query with a query to `alumni_showcase` filtered by the user's `effectiveCohortType`
- Remove the "Content Coming Soon" empty state (the section just hides when empty)
- Pass the fetched data + cohort type to `AlumniShowcaseSection`

### `AlumniShowcaseSection.tsx`
- Accept a `cohortType` prop to determine rendering mode
- **FORGE (Filmmaking)**: Landscape 16:9 video cards with play button overlay (current behavior)
- **FORGE_WRITING (Writing)**: Portrait book-cover cards (aspect-[2/3]) showing the image, with title + author below
- **FORGE_CREATORS (Creators)**: Vertical 9:16 reel cards with play button overlay
- All three modes use the same horizontal scroll carousel
- Clicking an image card opens it in a lightbox dialog; clicking a video/reel opens the video player dialog

## Files Changed
1. **Migration SQL** — create `alumni_showcase` table + RLS
2. **`src/pages/admin/AdminLearn.tsx`** — add "Alumni Showcase" tab with CRUD
3. **`src/pages/Home.tsx`** — replace `user_works` query with `alumni_showcase` query
4. **`src/components/home/AlumniShowcaseSection.tsx`** — support 3 rendering modes based on cohort type


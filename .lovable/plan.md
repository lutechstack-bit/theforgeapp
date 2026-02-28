

# Fix: Alumni Showcase Missing Thumbnails & Titles

## Root Cause

The `alumni_testimonials` database records have `thumbnail_url = NULL` and `film = NULL` for all 9 entries. The code tries to extract a YouTube ID for auto-thumbnails, but these are `.mp4` files, so that fallback produces nothing. Result: grey boxes with generic "Student Film" labels.

## Fix

**`src/components/home/AlumniShowcaseSection.tsx`**: For `.mp4` videos without thumbnails, generate a thumbnail by loading the video element and capturing its first frame. Additionally, fall back to showing the person's `name` instead of "Student Film" when `film` is null (this is already partially done but the card shows "Student Film" as default).

**`src/pages/Home.tsx`** (lines 74-86): Update the `displayAlumni` mapping to stop relying on YouTube ID extraction for non-YouTube videos. When `thumbnail_url` is null and the video is a direct `.mp4`, pass `null` so the component handles it.

**`src/components/home/AlumniShowcaseSection.tsx`** (lines 81-93): Replace the static grey `Film` icon fallback with a `<video>` element that loads the first frame as a poster by using `preload="metadata"` — this auto-shows the first frame without downloading the full video.

### Changes

1. **`src/components/home/AlumniShowcaseSection.tsx`** — In the thumbnail fallback (line 89-93), replace the grey `<Film>` icon div with a `<video>` element using `preload="metadata"` and the video URL as `src`. Add `#t=0.5` to the src to seek to 0.5s for a meaningful frame. This gives a real preview without needing a separate thumbnail image.

2. **`src/components/home/AlumniShowcaseSection.tsx`** — Line 107: The film title already falls back to `a.name` via `a.film || 'Student Film'`. Change to `a.film || a.name` so it shows the person's name instead of generic "Student Film".

3. **`src/pages/Home.tsx`** — No changes needed; the data flow is correct, just the component rendering needs the fix.


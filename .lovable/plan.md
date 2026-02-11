

# Use Student Works Content in Alumni Showcase

## What Changes

Keep the exact same frontend layout of the Alumni Showcase section (horizontal scroll of film cards with play icons, video dialog) but swap the data source from `alumni_testimonials` to `roadmap_sidebar_content` (student works uploaded via admin).

## Changes

### 1. Home.tsx -- Replace alumni_testimonials query with student works query

- Replace the `alumniTestimonialsQuery` to fetch from `roadmap_sidebar_content` where `block_type = 'student_work'` and `is_active = true`
- Also fetch edition mappings from `roadmap_sidebar_content_editions` for cohort filtering
- Map the student work data into the same `AlumniData` shape the component expects
- Extract YouTube video IDs from the `media_url` field (handles both clean embed URLs and full iframe HTML strings) to generate thumbnails automatically
- Update debug panel, error state, and empty state references accordingly
- Update retry handler to invalidate the new query key

### 2. AlumniShowcaseSection.tsx -- Update video playback to support YouTube

- Keep the entire card layout, styling, and scroll behavior identical
- Replace `SecureVideoPlayer` with a YouTube iframe for playback in the dialog
- Add a helper function to extract YouTube video ID from various URL formats (embed URLs, iframe HTML)
- Use `https://img.youtube.com/vi/{VIDEO_ID}/hqdefault.jpg` as auto-generated thumbnails when no explicit thumbnail exists

### Data Format

The `roadmap_sidebar_content` student works have:
- `media_url`: Either a clean YouTube embed URL (`https://www.youtube.com/embed/VIDEO_ID?si=...`) or a full `<iframe>` HTML string
- `title` and `caption`: Currently null for all entries, so the component will show "Student Film" as fallback
- `media_type`: "youtube"

The YouTube video ID will be extracted via regex to generate both thumbnails and embed URLs for playback.

## Technical Details

### Files Modified

| File | Change |
|------|--------|
| `src/pages/Home.tsx` | Replace `alumni_testimonials` query with `roadmap_sidebar_content` query for student works; map data to AlumniData shape with auto-generated YouTube thumbnails |
| `src/components/home/AlumniShowcaseSection.tsx` | Replace `SecureVideoPlayer` with YouTube iframe in the video dialog; add YouTube ID extraction helper |

### YouTube ID Extraction Logic

```text
Input formats:
1. "https://www.youtube.com/embed/cxA5eMxwtDU?si=..."
2. "<iframe ... src=\"https://www.youtube.com/embed/Slqg1Lpinqs?si=...\" ...></iframe>"

Regex: /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/
Output: video ID (e.g., "cxA5eMxwtDU")

Thumbnail: https://img.youtube.com/vi/{ID}/hqdefault.jpg
Embed URL: https://www.youtube.com/embed/{ID}?autoplay=1
```


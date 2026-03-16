

# Fix Creators Thumbnails + Remove View All + Seed Filmmaking

## Issues

1. **Creators broken thumbnails**: The 4 Vimeo items have `thumbnail_url = null`. Vimeo embed URLs can't be used as image `src`. The component needs to auto-generate Vimeo thumbnail URLs when no `thumbnail_url` is set.
2. **"View all" button**: Should be removed for all three cohorts.
3. **Filmmaking content**: Still not seeded — need to insert the 4 YouTube videos provided earlier.

## Changes

### 1. Edit `AlumniShowcaseSection.tsx`

- **Add Vimeo thumbnail helper**: When `thumbnail_url` is null and `media_url` contains a Vimeo ID, generate a thumbnail using `https://vumbnail.com/{vimeoId}.jpg` (a free Vimeo thumbnail service).
- **Remove the "View all" button** and the `ChevronRight` import / `useNavigate` (no longer needed).

The thumbnail resolution logic becomes:
```
thumbnail_url → if null, check media_url for Vimeo ID → vumbnail.com/{id}.jpg
                                    or YouTube ID → img.youtube.com/vi/{id}/hqdefault.jpg
                                    fallback → Play icon placeholder
```

### 2. Seed Filmmaking (FORGE) rows

Insert 4 rows into `alumni_showcase`:

| Title | YouTube ID | thumbnail_url |
|-------|-----------|---------------|
| Student Film 1 | cxA5eMxwtDU | auto from YouTube |
| Student Film 2 | mGcbPPpldBI | auto from YouTube |
| Student Film 3 | mGcbPPpldBI | (same as #2) |
| Student Film 4 | Slqg1Lpinqs | auto from YouTube |

With `media_type = 'video'`, `cohort_type = 'FORGE'`, and YouTube thumbnail URLs pre-populated.

## Files

| Action | File |
|--------|------|
| Edit | `src/components/home/AlumniShowcaseSection.tsx` — auto-generate thumbnails, remove View All |
| Migration | Insert 4 FORGE rows into `alumni_showcase` with YouTube thumbnail URLs |


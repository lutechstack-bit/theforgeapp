

# Update Masterclass Cards with Correct URLs and Uploaded Images

## What Changes

Replace the "Learn from the Best" section with hardcoded image cards using the 7 uploaded screenshots. Each card opens the correct external masterclass link in a new tab. The uploaded images already contain all text/branding baked in, so the card component becomes a simple clickable image.

## Changes

### 1. Copy uploaded images to project

Save to `public/images/masterclass/`:
- `lokesh.png`, `nelson.png`, `karthik.png`, `venket-ram.png`, `anthony.png`, `drk-kiran.png`, `ravi-basrur.png`

### 2. Simplify MasterclassCard.tsx

Since the images already contain instructor names and styling, the component becomes a clickable image card:
- Image fills the card with rounded corners
- No text overlays or buttons needed
- Click opens external URL in new tab
- Hover: subtle scale + border glow
- Props: `imageUrl`, `externalUrl`, `name` (alt text only)

### 3. Update Learn.tsx -- Hardcoded masterclass data

Replace the dynamic masterclass filter with this array:

| Instructor | URL |
|-----------|-----|
| Lokesh Kanagaraj | https://masterclass.leveluplearning.in/lokesh-kanagaraj |
| Nelson Dilipkumar | https://masterclass.leveluplearning.in/ |
| Karthik Subbaraj | https://masterclass.leveluplearning.in/karthik-subbaraj |
| G Venket Ram | https://www.leveluplearning.in/g-venket-ram-1 |
| Anthony | https://www.leveluplearning.in/anthony |
| DRK Kiran | https://www.leveluplearning.in/kiran |
| Ravi Basrur | https://masterclass.leveluplearning.in/ravi-basrur |

The section always renders (no conditional on data), and the dynamic `category = 'Masterclass'` filter is removed.

## Files Summary

| File | Action |
|------|--------|
| `public/images/masterclass/*.png` | COPY -- 7 uploaded images |
| `src/components/learn/MasterclassCard.tsx` | SIMPLIFY -- image-only clickable card |
| `src/pages/Learn.tsx` | UPDATE -- hardcoded data array with all 7 correct URLs |


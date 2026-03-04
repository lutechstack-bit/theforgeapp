

# Root Cause & Fix: Perk Banner Images Not Showing

## Diagnosis
The `PerkCard` code correctly checks `bannerUrl` and renders the image-only card when present. However, querying the database reveals:

| Perk | banner_url |
|------|-----------|
| Sony | `null` |
| Sandcastles | `null` |
| Digitek | `null` |
| Canon | `null` |

All `banner_url` values are `null`, so the fallback text layout renders every time. The code is fine — the data is missing.

## Fix

### 1. Copy uploaded images to project
- `user-uploads://01_1.jpg` → `public/images/perks/sony-banner.jpg`
- `user-uploads://02_1.jpg` → `public/images/perks/digitek-banner.jpg`
- `user-uploads://03_1.jpg` → `public/images/perks/sandcastles-banner.jpg`

### 2. Update database records
Run an UPDATE query to set `banner_url` for each perk:
- Sony → `/images/perks/sony-banner.jpg`
- Digitek → `/images/perks/digitek-banner.jpg`
- Sandcastles → `/images/perks/sandcastles-banner.jpg`

No code changes needed — the existing `PerkCard` component will automatically render the banner cards once the data is populated.

## Files
| Action | File |
|--------|------|
| Copy | 3 uploaded images → `public/images/perks/` |
| DB Update | Set `banner_url` on 3 perk rows |


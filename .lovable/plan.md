

# Implementation Plan: 9 Changes

## 1. Add "Updates" feature toggle in Admin Dashboard
**File: `src/pages/admin/AdminDashboard.tsx`** (after line 408)
- Add a second toggle row for `updates_enabled` with `Info` icon, same pattern as `events_enabled`

**File: `src/components/layout/SideNav.tsx`** (line 45-48)
- Add filtering for Updates in `bottomItems`: filter out `/updates` when `updates_enabled` is disabled

## 2. Auto-hide countdown timer when expired
**File: `src/components/home/CompactCountdownTimer.tsx`**
- Add `isExpired` state. In the `useEffect` (line 125-142), when `difference <= 0`, set `isExpired = true`
- After the hooks but before JSX return, add: `if (isExpired) return null;`

## 3. Update hero greeting copy
**File: `src/pages/Home.tsx`** (lines 127-128)
- `"Hi {firstName}"` → `"Hey {firstName}"`
- `"Let's make today count"` → `"Time to Learn, Do, and Become."`

## 4. Update KY Profile card header copy
**File: `src/components/home/KYProfileCard.tsx`**
- Line 36: `"Complete Your Profile"` → `"Creator Profile"`
- Line 41: `"Required before bootcamp"` → `"Help us get to know you"`

## 5. Update Travel & Stay section header defaults
**File: `src/components/home/TravelStaySection.tsx`** (lines 32-33)
- Default title: `'Travel & Stay'` → `'Your Venue'`
- Default subtitle: `undefined` → `"Where you'll be living, breathing, eating and creating"`

## 6. Ensure Batchmates shows for all cohorts
The `BatchmatesSection` component already supports all cohorts (filters by `edition_id`). It's controlled by the `homepage_sections` database table. The `batchmates` row's `cohort_types` column needs to be set to `null` (= all cohorts). This requires a database migration to ensure the row exists with `cohort_types = null`.

## 7. Update Learn page banner redirect URLs
**File: `src/pages/Learn.tsx`**
- Lines 47, 55, 63: Update `forgeResidencies` array `ctaUrl` values:
  - FORGE: `'https://www.forgebylevelup.com/'`
  - FORGE_WRITING: `'https://www.forgebylevelup.com/writingresidency'`
  - FORGE_CREATORS: `'https://creators.forgebylevelup.com/'`
- Lines 291, 298, 305: Update online program `ctaUrl` values:
  - Breakthrough Filmmaking: `'https://www.leveluplearning.live/bfp-2'`
  - Video Editing Academy: `'https://www.leveluplearning.live/ve'`
  - Creator Academy: keep as-is (no URL provided by user)

## 8. Replace Forge Filmmaking banner image
- Copy uploaded `banners12.jpg` to `public/images/programs/forge-filmmaking.png` (overwrite)
- This is already referenced in the `forgeResidencies` array at line 49

## 9. Replace 3 Perks banner images
- Copy `01_2.jpg` → `public/images/perks/sony-banner.jpg` (overwrite existing)
- Copy `02_2.jpg` → `public/images/perks/digitek-banner.jpg` (overwrite existing)
- Copy `03_2.jpg` → `public/images/perks/sandcastles-banner.jpg` (overwrite existing)

These files already exist at those paths. The perk cards use `banner_url` from the database, so as long as the DB records point to `/images/perks/sony-banner.jpg` etc., the new images will display automatically.

| # | File | Change |
|---|------|--------|
| 1a | `AdminDashboard.tsx` | Add `updates_enabled` toggle row |
| 1b | `SideNav.tsx` | Filter Updates by `updates_enabled` flag |
| 2 | `CompactCountdownTimer.tsx` | Return null when expired |
| 3 | `Home.tsx` | Update greeting copy |
| 4 | `KYProfileCard.tsx` | Update header/subtitle copy |
| 5 | `TravelStaySection.tsx` | Update default title/subtitle |
| 6 | DB migration | Ensure batchmates section has `cohort_types = null` |
| 7 | `Learn.tsx` | Update all banner redirect URLs |
| 8 | Asset copy | Replace forge-filmmaking banner image |
| 9 | Asset copy | Replace 3 perks banner images |


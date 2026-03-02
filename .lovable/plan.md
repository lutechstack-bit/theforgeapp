

# PerkDetail Redesign + Admin Claims with Tabs & Download

## Issues to Fix

1. **PerkDetail layout**: `max-w-2xl` is too narrow, leaving large black gaps on desktop. The banner area is an empty colored box that looks bad.
2. **Mobile responsiveness**: Detail page needs proper mobile padding and sizing.
3. **Admin claims**: Currently a single modal showing all claims — needs per-brand sub-tabs and CSV download.

## Changes

### 1. `src/pages/PerkDetail.tsx` — Redesign layout
- Change `max-w-2xl` → `max-w-4xl lg:max-w-5xl xl:max-w-6xl` (matching the Perks list page width standard)
- **Remove the banner** entirely. Replace with a cleaner layout: logo + name + headline in a horizontal hero card (logo on left, text on right, with a subtle gradient background using `banner_color`)
- This eliminates the empty banner problem
- Info sections and claim form use a 2-column layout on desktop (info left, form right), single column on mobile
- Proper `pb-24` on mobile for bottom nav clearance

### 2. `src/pages/admin/AdminPerks.tsx` — Claims tabs + download
- Replace the single claims modal with an inline tabbed view at the bottom of the page
- Add tabs: "All Claims" + one tab per perk (Sony, Digitek, etc.)
- Each tab shows a table of claims with date, form data columns
- Add "Download CSV" button per tab that exports the visible claims as CSV
- CSV export: generate in-browser using `Blob` + `URL.createObjectURL`

### Files Changed
1. **Edit**: `src/pages/PerkDetail.tsx` — new layout, remove banner, responsive widths
2. **Edit**: `src/pages/admin/AdminPerks.tsx` — add claims section with per-brand tabs + CSV download


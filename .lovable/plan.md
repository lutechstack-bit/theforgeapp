

# Redesign Alumni Showcase, Add Travel & Stay, Compact Mentors, Polish Homepage

## Overview

Three main changes:
1. **Replace testimonial video cards** with film-style showcase cards (matching the reference: dark thumbnail with play icon, duration badge, film title + author + edition below)
2. **Add inline Travel & Stay section** to the homepage (image carousel + property details + "Open in Maps" button, matching the reference)
3. **Compact mentor cards** for a tighter, more balanced layout
4. **Remove testimonials section** (it was previously the same as Alumni -- the Alumni Showcase stays but gets redesigned)
5. **Overall polish**: consistent section spacing, card borders, and section header styling

---

## 1. Redesign AlumniShowcaseSection

Replace the current `ContentCarousel` + `TestimonialVideoCard` approach with a card-grid layout matching the reference image:

- Section wrapped in a bordered rounded card (like journey section)
- Header: Film icon + "Alumni Showcase" title + "View all >" link
- Subtitle: "Click to watch films from past Forgers"
- Cards in a horizontal scroll or 3-column grid:
  - Dark thumbnail area with centered gold play icon and duration badge (bottom-right)
  - Below the thumbnail: Film title (bold) and "by Name . Edition" (muted)

**File: `src/components/home/AlumniShowcaseSection.tsx`** -- REWRITE

The `alumni_testimonials` table already has `name`, `film`, `video_url`, `thumbnail_url`. We'll use `film` as the title and `name` as the author. A `duration` field doesn't exist yet, so we'll show it if available or skip.

---

## 2. Create TravelStaySection

New component that fetches from the `stay_locations` table (already populated with data) and renders:

- Section wrapped in a bordered rounded card
- Header: Location pin icon + "Travel & Stay" title + "Details >" link
- Layout: Image carousel (left, ~40% width) + property info (right)
  - Property name (bold) with home icon
  - Address (muted)
  - Description/notes
  - "Open in Maps" gold button (full-width on mobile)

**File: `src/components/home/TravelStaySection.tsx`** -- CREATE

Data source: `stay_locations` table (already has `name`, `full_address`, `google_maps_url`, `gallery_images`, `featured_image_url`)

---

## 3. Compact Mentor Cards

Reduce the `CleanMentorCard` sizing:
- Reduce `min-w` from `180px/200px/240px` to `140px/160px/180px`
- Reduce image aspect ratio from `4/5` to `3/4`
- Reduce text sizes (name from `text-lg/xl` to `text-sm/base`)
- Reduce padding from `p-4` to `p-3`

**File: `src/components/shared/CleanMentorCard.tsx`** -- MODIFY

---

## 4. Update Home.tsx

- Add `TravelStaySection` rendering (after alumni, before empty state)
- Wire it to the `travel_stay` homepage section (already exists in DB)
- Remove any remaining references to testimonials if separate from alumni
- Ensure consistent section spacing (`space-y-8`)
- Wrap major sections in bordered cards for visual grouping (matching the reference's card-based layout)

**File: `src/pages/Home.tsx`** -- MODIFY

---

## 5. Everything Admin-Customizable

The `travel_stay` section key already exists in `homepage_sections` table. Admins can already:
- Toggle visibility via `/admin/homepage`
- Edit the title/subtitle
- Reorder it relative to other sections

Stay locations are managed via the existing `/admin/roadmap-sidebar` admin page. No new admin pages needed.

---

## Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/components/home/AlumniShowcaseSection.tsx` | REWRITE | Film-style showcase cards with play icons and duration badges |
| `src/components/home/TravelStaySection.tsx` | CREATE | Inline stay location with image carousel and map link |
| `src/components/shared/CleanMentorCard.tsx` | MODIFY | Smaller, more compact cards |
| `src/pages/Home.tsx` | MODIFY | Add TravelStaySection, polish spacing and layout |

No database migrations needed -- all data sources already exist.

---

## Technical Details

### AlumniShowcaseSection redesign
- Wrapped in `rounded-2xl border border-border/40 bg-card/30 p-5` container
- Header with Film icon + title + "View all >" button
- Subtitle text in muted color
- Horizontal scrollable row of film cards (each ~200px wide)
- Each card: dark bg thumbnail area with gold Play circle centered, optional duration badge, then text below

### TravelStaySection
- Fetches `stay_locations` where `is_active = true` from database
- Image carousel uses `gallery_images` JSON array (already has `url` and `caption`)
- Carousel has prev/next arrows and dot indicators
- Right side shows name, address, description from `notes` JSON
- Gold "Open in Maps" button links to `google_maps_url`
- Responsive: stacks vertically on mobile

### CleanMentorCard compaction
- `min-w-[140px] sm:min-w-[160px] md:min-w-[180px]`
- `aspect-[3/4]` image
- `text-sm sm:text-base` for name
- `p-3` padding
- Brand logos stay but smaller (`h-5`)

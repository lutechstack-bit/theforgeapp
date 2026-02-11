

# Redesign Learn Page -- Matching Reference Screenshots

## Overview

Rebuild the Learn page with four distinct sections matching the uploaded reference screenshots, with careful attention to spacing, sizing, and mobile responsiveness. The page will flow seamlessly with the existing app's design language (dark theme, gold accents, OpenSauceOne typography).

---

## 1. Rewrite LearnCourseCard with Metadata Below Thumbnail

**File: `src/components/learn/LearnCourseCard.tsx`** -- REWRITE

The reference shows cards with visible metadata below the thumbnail image. New card structure:

- Fixed-width card (`w-[200px] sm:w-[220px]`) instead of aspect-ratio-only
- Thumbnail area: `aspect-[3/4]` rounded-xl with object-cover image, duration badge (top-right), subtle hover scale
- Below thumbnail: gold uppercase category label (`text-[10px]`), bold title (`text-sm font-bold`, line-clamp-2), instructor name in a dark pill (`bg-muted/50 rounded-full px-2 py-0.5`), company/role in muted text
- New props: `category`, `instructorName`, `companyName`
- Card has `bg-card rounded-2xl border border-border/30 hover:border-primary/30` container
- No overflow hidden on outer wrapper so text below image is visible

---

## 2. Create UpcomingSessionsSection

**File: `src/components/learn/UpcomingSessionsSection.tsx`** -- CREATE

Fetches from `roadmap_days` where `is_virtual = true` and `is_active = true`, ordered by `day_number`.

Each session card:
- Dark card (`bg-card rounded-2xl border border-border/30 p-4`) with fixed width (`w-[280px] sm:w-[300px]`)
- Date pill: gold bg circle or rounded square with day number (large) and day name (small) positioned at top-left
- Title bold, session time from `session_start_time` + `session_duration_hours`, description in muted text (line-clamp-2)
- Bottom row: gold "Join Session" button (with Video icon) + bordered calendar icon button
- Horizontal scroll carousel using Embla (same Carousel component used elsewhere)

Clicking "Join Session" opens a responsive modal (Dialog on desktop, Drawer on mobile).

---

## 3. Create SessionDetailModal

**File: `src/components/learn/SessionDetailModal.tsx`** -- CREATE

Responsive modal matching the reference:
- Uses `useIsMobile()` hook to switch between Drawer (mobile) and Dialog (desktop)
- Content: date pill + title + formatted date/time, description text, gold "Join Zoom Meeting" full-width button linking to `meeting_url`, outlined "Add to Calendar" button using existing `calendarUtils`
- Consistent padding (`p-5`) and spacing (`space-y-4`)

---

## 4. Create MasterclassCard

**File: `src/components/learn/MasterclassCard.tsx`** -- CREATE

For the "Learn from the Best" section, filtering `learn_content` where `category = 'Masterclass'`:
- Large card (`w-[280px] sm:w-[300px]`) with instructor thumbnail filling top area (`aspect-[3/4]`)
- Optional badge at top-left (gold pill: "BESTSELLER" / "NEW")
- Below image: "TEACHES FILMMAKING" gold uppercase label, large bold instructor name, description (line-clamp-2), lesson count/duration row
- Gold gradient "Start Learning >" full-width button at bottom
- `bg-card rounded-2xl border border-border/30` wrapper

---

## 5. Rewrite Learn.tsx Page Layout

**File: `src/pages/Learn.tsx`** -- REWRITE

New page structure with consistent spacing and mobile responsiveness:

- **Outer container**: `min-h-screen bg-background pb-24`
- **Inner content**: `px-4 sm:px-5 py-5 space-y-8 sm:space-y-10 max-w-full overflow-hidden`
- **Header**: "Learn" title (text-xl sm:text-2xl font-bold) + subtitle in muted text, no Film icon (cleaner)
- **Section 1**: `UpcomingSessionsSection` -- "Upcoming Online Sessions" with horizontal carousel
- **Section 2**: Continue Watching carousel (existing, shown only if items exist)
- **Section 3**: "Pre Forge Sessions" -- horizontal carousel of redesigned `LearnCourseCard` with category + instructor metadata
- **Section 4**: "More from LevelUp" -- same card style, community sessions
- **Section 5**: "Learn from the Best" -- `MasterclassCard` carousel for Masterclass-category content

Each section header follows consistent pattern:
- `h2 text-lg sm:text-xl font-bold` + optional subtitle `text-sm text-muted-foreground`
- "View All >" pill button on right when items > 3

Data queries remain the same (all from `learn_content` table), just grouped differently:
- `bfp_sessions` section_type for Pre Forge
- `community_sessions` section_type for LevelUp
- `category = 'Masterclass'` filter for Learn from the Best (subset of existing data)
- New query for `roadmap_days` virtual sessions

---

## Mobile Responsiveness Details

- All carousels use `basis-auto` with fixed card widths so cards don't stretch awkwardly
- Cards have consistent widths: `w-[200px] sm:w-[220px]` for course cards, `w-[280px] sm:w-[300px]` for session/masterclass cards
- Section padding: `px-4` on mobile, `px-5` on desktop
- Carousel content uses `pl-4` gap between items with `-ml-4` offset on CarouselContent
- No horizontal overflow on the page (`overflow-hidden` on container)
- Bottom padding `pb-24` for bottom navigation clearance
- Touch-friendly card sizes and tap targets (min 44px for buttons)
- Session modal uses Drawer on mobile for native-feeling bottom sheet

---

## Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/components/learn/LearnCourseCard.tsx` | REWRITE | Add category, instructor, role metadata below thumbnail |
| `src/components/learn/UpcomingSessionsSection.tsx` | CREATE | Virtual session cards with join + calendar buttons |
| `src/components/learn/SessionDetailModal.tsx` | CREATE | Responsive modal for session details |
| `src/components/learn/MasterclassCard.tsx` | CREATE | Large masterclass cards with "Start Learning" CTA |
| `src/pages/Learn.tsx` | REWRITE | New 5-section layout with consistent spacing |

No database migrations needed. All data sources already exist.


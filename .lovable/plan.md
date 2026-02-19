

# Redesign Event Cards to Match Reference

## Current State
The Events page uses `CleanEventCard` with a **landscape 4:3 aspect ratio**, a title at the bottom of the image, date/location text, and a full-width CTA button ("Attend Event" / "Registered").

## Reference Design
The uploaded image shows a **portrait card** with:
- Full-bleed background image (aspect ratio ~4:5)
- Title overlaid at the bottom of the image with a dark gradient
- A footer bar with: host avatar + name on the left, date + location in small pill badges on the right
- Rounded corners with a subtle border
- No prominent CTA button on the card face

## Changes Required

### 1. Database: Add host fields to `events` table
Add `host_name` (text, nullable) and `host_avatar_url` (text, nullable) columns so admins can assign a host to each event. These are optional -- cards will gracefully hide the avatar area if not set.

```sql
ALTER TABLE public.events
  ADD COLUMN host_name text,
  ADD COLUMN host_avatar_url text;
```

### 2. `src/components/shared/CleanEventCard.tsx` -- Redesign

Restyle the card to match the reference:

| Element | Current | New |
|---------|---------|-----|
| Image aspect ratio | `aspect-[4/3]` (landscape) | `aspect-[4/5]` (portrait) |
| Title position | Bottom of image | Same, but larger font with drop-shadow |
| Footer | Date + location text + full CTA button | Host avatar + name (left), date pill + location pill (right) |
| CTA button | Full-width "Attend Event" | Removed from card face (registration happens on click/detail page) |
| Badges | "FILLING FAST" / "PAST EVENT" top-left | Keep as-is |

New props: `hostName?: string`, `hostAvatar?: string`

### 3. `src/pages/Events.tsx` -- Pass new props

Pass `host_name` and `host_avatar_url` from the query results to `CleanEventCard`.

### 4. Admin page (if exists) -- no changes now

The admin events page already uses the events table; the new columns will appear for editing later.

## Files Modified

| File | Change |
|------|--------|
| Database migration | Add `host_name` and `host_avatar_url` to `events` |
| `src/components/shared/CleanEventCard.tsx` | Redesign to portrait layout with host footer, remove CTA button |
| `src/pages/Events.tsx` | Pass `hostName` and `hostAvatar` props |




# Redesign Event Detail Page (Lu.ma-Inspired Layout)

## Goal
Redesign the `/events/:id` page to match the reference screenshot -- a premium, two-column layout with clear visual hierarchy similar to lu.ma event pages.

## Current State
The page is a single-column, stacked layout: hero image on top, then title, then metadata rows, then description. It works but looks plain compared to the reference.

## New Layout

### Desktop (sm+ breakpoint): Two-Column Layout
```text
+-----------------------------------------------------+
| <- Events / Event Title              [SHARE EVENT]   |
+-----------------------------------------------------+
|                        |                              |
|   [Event Image]        |  Event Title (large)         |
|   (aspect-square or    |                              |
|    4:3, rounded)       |  [FEB] Friday, Feb 20        |
|                        |  [20 ] 07:00 PM - 08:30 PM   |
|   HOSTED BY            |                              |
|   [avatar] Host Name   |  [camera] MEDIUM             |
|                        |          Virtual Meeting      |
|   [REGISTER ->]        |                              |
|                        |  ABOUT                        |
|                        |  Description text...          |
|                        |                              |
+-----------------------------------------------------+
```

### Mobile: Stacked single-column (same content, vertically stacked)

## Sections to Build

### 1. Breadcrumb Header
- Back arrow + "Events / Event Title" breadcrumb
- "SHARE EVENT" button on the right (uses navigator.share or copies link)

### 2. Left Column (Desktop) / Top Section (Mobile)
- Event image (rounded-2xl, aspect-[4/3])
- "HOSTED BY" section with host avatar + name (uses `host_name` and `host_avatar_url` from DB)
- Register CTA button (full-width, blue/primary) -- replaces the current fixed bottom bar

### 3. Right Column (Desktop) / Below Image (Mobile)
- Large event title (text-3xl to text-4xl font-bold)
- Date/time info card: calendar icon with month + day number, full date, time range
- Medium info card: camera icon + "Virtual Meeting" or map pin + location
- "ABOUT" section with description
- Recording embed (for past events, same as current)
- Notes section (for past events, same as current)

## Data Mapping
All data comes from the existing `events` table:
- `title` -- main heading
- `image_url` -- hero image
- `event_date` -- date/time cards (format month, day, weekday, time)
- `is_virtual` / `location` -- medium card
- `host_name` / `host_avatar_url` -- hosted by section
- `description` -- about section
- `recording_url` / `notes` -- past event archive content
- `event_types` -- badge (optional)

## Technical Details

### File: `src/pages/EventDetail.tsx` (full rewrite)
- Use `grid grid-cols-1 md:grid-cols-[minmax(0,400px)_1fr] gap-8` for the two-column layout
- Left column: image, host, register button
- Right column: title, date/time cards, about, recording, notes
- Share button uses `navigator.share()` with fallback to clipboard copy
- Mobile: natural stacking, register button inline (not fixed bottom)
- Remove the fixed bottom CTA bar -- integrate register button into the left column

### Styling
- Dark theme consistent with the reference
- Cards use `bg-card/60 border border-border/50 rounded-xl`
- Date card shows month abbreviation (uppercase) + day number in a mini calendar block
- "ABOUT" as an uppercase label heading
- Host section: small avatar circle + uppercase "HOSTED BY" label

## Files Modified

| File | Change |
|------|--------|
| `src/pages/EventDetail.tsx` | Full redesign to two-column lu.ma-style layout |


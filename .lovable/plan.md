

# Redesign Journey Section & Remove Sidebar from Homepage

## What Changes

### 1. Redesign HomeJourneySection to match the reference design

The reference images show a clean, spacious layout with:

**Header**: Bold title "Your Forge Journey" with subtitle "7 online sessions + 8 days in Goa" (no icon box or left border accent)

**Online Sessions sub-section**:
- Camera icon + "Online Sessions" label + date range (e.g. "Jan 29 - Feb 7"), all on one line
- Horizontal date pills showing date number + day name (e.g. "29 / Wed"), with selected pill having a gold/primary filled background with rounded corners
- Session detail card below: large rounded card with border showing Session number label (gold text), bold title, date + time range, description text, then "Add to Calendar" button (gold outlined) and "Via Zoom Link" label

**Goa Bootcamp sub-section**:
- Location pin icon + "Goa Bootcamp" label + date range
- Date pills showing date + "Day N" label
- Day detail card: theme name (gold text), title, date + activity count, then schedule items as individual rounded cards with icons, title, time range, and description -- highlight cards (like shoot slots) get a gold border/tint

### 2. Remove desktop sidebar & mobile floating button from Homepage

Remove the `RoadmapSidebar` (right column) and `FloatingHighlightsButton` from `Home.tsx` to give the main content full width.

### 3. Update SessionDetailCard to match the reference

The current card is too compact. The reference shows:
- Larger padding and text sizes
- Session label as gold text (not a badge)
- Full description paragraph visible
- "Add to Calendar" as a prominent outlined button with calendar icon
- "Via Zoom Link" as a subtle label with video icon
- For bootcamp days: schedule items shown as individual rounded sub-cards with icon containers, activity name, time range, and description

---

## Technical Details

### Files Modified

| File | Change |
|------|--------|
| `src/pages/Home.tsx` | Remove RoadmapSidebar, FloatingHighlightsButton imports and rendering. Remove flex sidebar column, make main content full-width. |
| `src/components/home/HomeJourneySection.tsx` | Update header to remove icon box and border-left accent, use simpler bold text. Add camera icon for Online Sessions header, location pin for Bootcamp header. Remove "View All" button. |
| `src/components/home/DatePillSelector.tsx` | Adjust pill styling to match reference: more square/rounded-lg shape, gold filled for selected, show "Day N" sub-label for bootcamp pills. |
| `src/components/home/SessionDetailCard.tsx` | Major redesign: larger card with more padding, session label as gold text not badge, show full description, "Add to Calendar" as outlined gold button, "Via Zoom Link" as icon+text label, schedule items as individual rounded sub-cards with icon containers and gold-tinted highlight for key activities. |

### Key Design Details

**Date Pills (reference match)**:
- Rounded-lg (not fully rounded), more square shape (~56x64px)
- Selected state: solid primary/gold background, white text
- Default state: subtle border with muted text
- Sub-label shows day name (Wed, Fri) for online, "Day N" for bootcamp

**Session Detail Card (Online)**:
- "Session N" as primary-colored text (not a badge pill)
- Bold title on next line
- Date + time range (e.g. "Jan 31 . 7:00 PM - 9:00 PM")
- Description paragraph in muted text
- Bottom row: "Add to Calendar" outlined button + "Via Zoom Link" label with video icon

**Day Detail Card (Bootcamp)**:
- Theme name as primary-colored text
- Bold title
- Date + "N activities" count
- Schedule items as individual rounded sub-cards:
  - Icon in a circle container (left)
  - Activity name (bold) + time/description (muted) on right
  - Key activities (like shoots) get a gold border/tint highlight

### Implementation Approach

1. Update `DatePillSelector` styling to match the reference's more square, larger pills
2. Split `SessionDetailCard` into two display modes: "online" (shows description, Add to Calendar, Zoom link) and "bootcamp" (shows schedule as sub-cards with icons)
3. Update `HomeJourneySection` header to use simpler typography with inline icons for section labels
4. Strip sidebar and floating button from `Home.tsx`, making main content occupy full width

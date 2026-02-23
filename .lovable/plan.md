

# Roadmap Redesign: Reference Image Recreation (Functional + Dynamic)

## Overview
Rebuild the Roadmap page to exactly match the uploaded reference image with fully functional, dynamic data from the database. All content is already admin-managed -- no new admin pages needed.

## What Gets Built

### 1. Summary Cards Row (New Component)
Three horizontally scrollable cards between the Hero and Tabs, each pulling live data:

**Journey Card**
- "Day X/Y" with current day title and date/time
- Dot progress indicator (one dot per day, filled = completed)
- Data: `useRoadmapData()` -> `roadmapDays`, `getDayStatus`, `currentDayNumber`, `totalCount`

**Tasks Card**
- Circular progress ring with completion percentage
- "X remaining" and "Y required left" counts
- Data: `useStudentJourney()` -> `stages`, `getStageStats`, `isTaskCompleted`

**Prep Card**
- "X% ready" with progress bar
- "X/Y items checked"
- "Overdue" badge when items exist but progress is 0 and forge start is near
- Data: `useRoadmapData()` -> `prepProgress`

Cards are `overflow-x-auto snap-x` on mobile for horizontal scrolling, and evenly distributed on desktop.

### 2. Tab Navigation Redesign
Update `QuickActionsBar` to match reference styling:
- Show icons on ALL screen sizes (currently hidden on mobile)
- Active tab: amber/primary filled background
- Inactive tabs: ghost/outlined style
- Horizontally scrollable on mobile

### 3. Journey Tab Enhancement
Update `RoadmapJourney` to match reference:
- Bold heading: "6 days in Goa" (dynamic count) with date range subtitle
- Date pills enhanced with `themeName` below each pill (sourced from `roadmap_days.theme_name`)
- Detail card redesigned:
  - Amber "DAY X | Date" badge header
  - Large bold title
  - Description paragraph
  - Time + location meta row
  - Numbered schedule list (amber-bordered circles with numbers replacing icon-based sub-cards)
  - "View full details >" link

### 4. DatePillSelector Enhancement
Add optional `themeName` field to pill interface and render it below each pill as a small label.

### 5. SessionDetailCard Redesign
Replace icon-based schedule sub-cards with numbered list items (amber numbered circles + activity text).

## Mobile Responsiveness
- Summary cards: horizontal scroll with `snap-x snap-mandatory`
- Tab bar: horizontal scroll with hidden scrollbar
- Date pills: existing scroll behavior preserved with theme labels
- Detail card: full-width stacked layout
- All touch-friendly with adequate tap targets

## Admin Customization
All data is already admin-managed through existing panels:
- Journey days: AdminRoadmap (roadmap_days table -- title, description, theme_name, schedule, etc.)
- Tasks: AdminJourneyTasks (journey_tasks table)
- Prep items: AdminRoadmap prep section (prep_checklist_items table)
- Hero content: driven by edition data (cohort_type, forge_start_date)
- No new admin pages or database changes needed

## Files to Create/Modify

| File | Change |
|------|--------|
| `src/components/roadmap/RoadmapSummaryCards.tsx` | **New** -- 3 dynamic summary cards (Journey, Tasks, Prep) with live data |
| `src/components/roadmap/RoadmapLayout.tsx` | Insert `RoadmapSummaryCards` between Hero and QuickActionsBar |
| `src/components/roadmap/QuickActionsBar.tsx` | Show icons on all screens, amber active state styling |
| `src/pages/roadmap/RoadmapJourney.tsx` | Add bold heading with dynamic count/date range, pass `themeName` to pills, update detail card rendering |
| `src/components/home/DatePillSelector.tsx` | Add optional `themeName` to pill interface, render below pill |
| `src/components/home/SessionDetailCard.tsx` | Numbered schedule items with amber circles, amber DAY badge header |

## Technical Details

### Summary Cards Data Flow

```text
RoadmapSummaryCards
  |-- useRoadmapData()
  |     |-- currentDayNumber, totalCount --> Journey card
  |     |-- prepProgress --> Prep card
  |-- useStudentJourney()
        |-- stages, getStageStats, isTaskCompleted --> Tasks card
```

### DatePill Interface Update

```typescript
interface DatePill {
  id: string;
  date: Date | null;
  dayNumber: number;
  label: string;
  subLabel?: string;
  themeName?: string; // e.g., "Foundation", "Vision"
  status: 'completed' | 'current' | 'upcoming' | 'locked';
}
```

### Schedule List Rendering Change

Current: Icon-based sub-cards with colored circles
New: Numbered circles (1, 2, 3, 4) with amber border + activity text on the right

```text
  (1) Morning: Directing masterclass
  (2) Afternoon: Shot planning workshop
  (3) Evening: 1-on-1 mentor sessions
```

### Tapping Summary Cards
Each card is tappable and navigates to its respective tab:
- Journey card -> `/roadmap` (stays on journey)
- Tasks card -> `/roadmap/tasks`
- Prep card -> `/roadmap/prep`


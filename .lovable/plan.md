
# Major UI Restructure: Homepage → Journey Timeline + New Tasks Tab

## Overview

This plan restructures the app by:
1. **Replacing the sticky notes/journey bento hero on Homepage** with the Roadmap Journey timeline (day-by-day schedule)
2. **Creating a new "Tasks" sub-page under Roadmap** with a clean, modern checklist card design
3. **Preserving all existing features** (stage tracking, task completion, auto-complete, streak, etc.)

---

## Current State → New State

```text
CURRENT HOMEPAGE:
├── CompactCountdownTimer
├── JourneyBentoHero (sticky notes + stages) ← REMOVE
├── Meet Your Mentors
├── RoadmapBentoBox (highlights)
├── Alumni Spotlight
├── Learn Section
└── Events Section

NEW HOMEPAGE:
├── CompactCountdownTimer
├── JourneyTimeline (from Roadmap) ← NEW: Embedded timeline
├── Meet Your Mentors
├── RoadmapBentoBox
├── Alumni Spotlight
├── Learn Section
└── Events Section

NEW ROADMAP NAVIGATION:
[Journey] [Tasks] [Prep] [Equipment*] [Rules]
                   ↑
               NEW TAB
```

---

## Phase 1: Create New Tasks Page (`/roadmap/tasks`)

### New File: `src/pages/roadmap/RoadmapTasks.tsx`

A clean, modern checklist UI organized by journey stages:

**Design Approach - Modern Checklist Cards:**
- Collapsible stage cards with progress bars
- Clean task rows with checkboxes, descriptions, and due dates
- Visual status indicators (completed = green checkmark, auto-completed = badge)
- Filter chips (All, Required, Optional, Done)
- Stage progress rings inline with headers

**UI Structure:**
```text
┌─────────────────────────────────────────────────┐
│ Your Tasks                    [Streak Badge]    │
│ 12/18 tasks completed         [Filter Chips]    │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ ▼ Stage 1: Pre-Registration     ●●●●○ 4/5   │ │
│ │   ☑ Complete your profile       [Auto]      │ │
│ │   ☑ Submit KY Form                          │ │
│ │   ☐ Connect on Instagram                    │ │
│ │   ☑ Introduce yourself          [Auto]      │ │
│ │   ☑ Review the roadmap                      │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │ ▶ Stage 2: Pre-Travel (Coming)   ○○○○○ 0/3 │ │
│ └─────────────────────────────────────────────┘ │
│ ...                                             │
└─────────────────────────────────────────────────┘
```

**Features Preserved:**
- All 6 stages (5 for Writers)
- Task completion toggle with optimistic updates
- Auto-completion detection from profile data
- Linked prep category sync (bidirectional)
- Deep linking to specific tasks/sections
- Pull-to-refresh on mobile
- Confetti celebration on stage completion
- Streak badge display

---

## Phase 2: Embed Journey Timeline on Homepage

### Modified File: `src/pages/Home.tsx`

**Changes:**
1. Remove `JourneyBentoHero` import and usage
2. Add inline Journey Timeline component (adapted from `RoadmapJourney`)
3. Keep compact countdown at top

**New Homepage Structure:**

```tsx
<div className="space-y-5 sm:space-y-6">
  {/* Countdown Timer */}
  <CompactCountdownTimer edition={edition} />

  {/* Journey Timeline - Embedded from Roadmap */}
  <HomeJourneySection /> {/* NEW component */}

  {/* Meet Your Mentors */}
  <ContentCarousel title="Meet Your Mentors">...</ContentCarousel>
  
  {/* ... rest unchanged */}
</div>
```

### New Component: `src/components/home/HomeJourneySection.tsx`

A streamlined version of `RoadmapJourney` for the homepage:
- Shows first 3-4 upcoming days with "View Full Journey" link
- Compact JourneyStats bar
- Timeline nodes with hover effects
- Links to `/roadmap` for full view

---

## Phase 3: Update Navigation

### Modified File: `src/components/roadmap/QuickActionsBar.tsx`

Add Tasks tab to the navigation:

```tsx
const sections = [
  { id: 'journey', path: '/roadmap', label: 'Journey', icon: Map },
  { id: 'tasks', path: '/roadmap/tasks', label: 'Tasks', icon: CheckSquare }, // NEW
  { id: 'prep', path: '/roadmap/prep', label: 'Prep', icon: FileText },
  // ... rest
];
```

### Modified File: `src/App.tsx`

Add route for Tasks:

```tsx
<Route path="/roadmap" element={<RoadmapLayout />}>
  <Route index element={<RoadmapJourney />} />
  <Route path="tasks" element={<RoadmapTasks />} /> {/* NEW */}
  <Route path="prep" element={<RoadmapPrep />} />
  {/* ... rest */}
</Route>
```

### Modified File: `src/pages/roadmap/index.ts`

Export the new component:

```tsx
export { default as RoadmapTasks } from './RoadmapTasks';
```

---

## Phase 4: Create Task Card Components

### New File: `src/components/tasks/TaskStageCard.tsx`

Collapsible card for each stage:

```tsx
interface TaskStageCardProps {
  stage: JourneyStage;
  tasks: JourneyTask[];
  isExpanded: boolean;
  onToggle: () => void;
  // ... task completion props
}
```

**Features:**
- Collapsible with smooth animation
- Progress bar in header (completed/total)
- Stage icon and color theming
- Current stage highlighted with accent border
- Completed stages show green checkmark

### New File: `src/components/tasks/TaskRow.tsx`

Individual task item:

```tsx
interface TaskRowProps {
  task: JourneyTask;
  isCompleted: boolean;
  isAutoCompleted: boolean;
  onToggle: () => void;
  forgeStartDate?: string;
}
```

**Features:**
- Checkbox with tap animation
- Title + optional description
- "Auto" badge for auto-completed tasks
- Due date badge (if applicable)
- Deep link arrow (if task has navigation)
- Swipe-to-complete on mobile (optional)

### New File: `src/components/tasks/TasksHeader.tsx`

Page header with stats and filters:

```tsx
interface TasksHeaderProps {
  completedCount: number;
  totalCount: number;
  activeFilter: TaskFilterType;
  onFilterChange: (filter: TaskFilterType) => void;
}
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/roadmap/RoadmapTasks.tsx` | Main Tasks page with stage cards |
| `src/components/tasks/TaskStageCard.tsx` | Collapsible stage card |
| `src/components/tasks/TaskRow.tsx` | Individual task item |
| `src/components/tasks/TasksHeader.tsx` | Page header with filters |
| `src/components/tasks/index.ts` | Barrel export |
| `src/components/home/HomeJourneySection.tsx` | Embedded timeline for homepage |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Home.tsx` | Replace JourneyBentoHero with HomeJourneySection |
| `src/components/roadmap/QuickActionsBar.tsx` | Add Tasks tab |
| `src/App.tsx` | Add `/roadmap/tasks` route |
| `src/pages/roadmap/index.ts` | Export RoadmapTasks |

---

## Features Preservation Checklist

All existing functionality will be preserved:

| Feature | Current Location | New Location |
|---------|------------------|--------------|
| Stage progress tracking | JourneyBentoHero | RoadmapTasks |
| Task completion toggle | StickyNoteCard | TaskRow |
| Auto-complete detection | useStudentJourney | useStudentJourney (unchanged) |
| Prep category sync | JourneyTaskItem | TaskRow |
| Streak badge | JourneyBentoHero header | TasksHeader |
| Confetti celebration | JourneyBentoHero | RoadmapTasks |
| Deep linking | JourneyTaskItem | TaskRow |
| Pull-to-refresh | JourneyBentoHero | RoadmapTasks |
| Stage navigation strip | StageNavigationStrip | TaskStageCard headers |
| Personal note | PersonalNoteCard | Sidebar/bottom on Tasks page |
| Status widget | StatusWidget | Preserved in Tasks page |
| Task filters | TaskFilters | TasksHeader |

---

## Mobile Considerations

1. **Tasks page** - Full-height scrollable with sticky header containing filters
2. **Stage cards** - Only current stage expanded by default to save space
3. **Touch targets** - 44px minimum for checkboxes and buttons
4. **Swipe gestures** - Optional swipe-to-complete for tasks
5. **Homepage timeline** - Show 3 days max with "View all" link

---

## Desktop Considerations

1. **Tasks page** - Two-column layout possible (stages left, detail right)
2. **All stages visible** - Show all stages expanded or with quick expand/collapse
3. **Hover states** - Progress rings, task rows have hover effects
4. **Keyboard navigation** - Tab through tasks, space to toggle

---

## Visual Design

The new Tasks UI follows the brand guidelines:

- **Colors**: Primary yellow (#FFBC3B), Deep gold (#D38F0C), stage-specific accents
- **Cards**: Dark glass-morphism background (`bg-card` or `bg-black/60`)
- **Progress**: Gold progress bars and rings
- **Typography**: Clean hierarchy with `font-semibold` headers
- **Spacing**: Consistent 4px grid system

---

## Risk Mitigation

1. **No breaking changes to hooks** - `useStudentJourney` remains unchanged
2. **Gradual removal** - JourneyBentoHero components stay in codebase until fully migrated
3. **Preserved imports** - Index files updated to export new components
4. **Testing path** - Can test new Tasks page at `/roadmap/tasks` before homepage change

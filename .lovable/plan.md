
# Comprehensive Journey Hero Section Fixes

## Issues Identified

### 1. UI Overflow Issues
**Problem**: The Stage Navigation Strip uses `min-w-[500px]` causing horizontal overflow on mobile screens. The sticky notes extend beyond their container boundaries.

**Root Cause**: Fixed minimum widths and absolute positioning without proper overflow containment.

### 2. FAB Not Visible on Desktop
**Problem**: The Floating Action Button is conditionally rendered only on mobile (`{isMobile && <FloatingActionButton />}`).

**Root Cause**: The FAB was intentionally limited to mobile-only, but users expect it on desktop as well.

### 3. Desktop Layout Has Unused Space
**Problem**: The "freeform" desktop layout uses absolute positioning with fixed widths (280px, 340px, 260px), leaving large gaps on wide screens and looking messy on medium screens.

**Root Cause**: Fixed-width cards with absolute positioning don't scale responsively.

### 4. Mobile Needs Stacked Card UI
**Current State**: Mobile uses a horizontal carousel where each sticky note takes 85% width.

**Desired State**: Stacked cards like the KYFormCardStack - where you see depth behind the current card with rotated background layers.

### 5. Prep-to-Sticky Sync Not Working
**Problem**: Ticking items in `/roadmap/prep` doesn't reflect in the journey sticky notes.

**Root Cause Analysis**:
- The sync works from Journey → Prep (bulk update on toggle)
- But Prep → Journey is **passive** (only checks if category is complete on render)
- The `useStudentJourney` hook fetches prep progress but the Roadmap Prep page uses a separate `useRoadmapData` hook
- When prep items are toggled in RoadmapPrep, it only invalidates `user-prep-progress`
- The journey page's `useStudentJourney` also watches `user-prep-progress` but may not refresh due to stale query keys

**Fix**: Add bidirectional cache invalidation - when toggling prep items, also invalidate journey progress queries.

### 6. Whiteboard Concept
**User Request**: Make the sticky notes function like a "whiteboard" - draggable, zoomable, pan-able canvas.

**Recommendation**: This is a significant feature (e.g., using React Flow or similar). Propose a lighter version: draggable sticky notes with snap-to-grid positions that persist, giving a whiteboard feel without the complexity.

---

## Implementation Plan

### Part 1: Fix UI Overflow Issues

**Stage Navigation Strip** (`StageNavigationStrip.tsx`):
- Remove `min-w-[500px]` constraint
- Use `flex-shrink-0` on each stage item to prevent crushing
- Add proper padding and gaps that scale with screen size
- Use `gap-2 sm:gap-4` for responsive spacing between nodes

**StickyNoteCard** (`StickyNoteCard.tsx`):
- Ensure the pin/clip element doesn't extend beyond container bounds
- Add `overflow-hidden` to the outer wrapper when needed

### Part 2: Enable FAB on Desktop

**FloatingActionButton** (`FloatingActionButton.tsx`):
- Always render the FAB (remove `{isMobile &&` condition in JourneyBentoHero)
- Adjust positioning for desktop: `bottom-8 right-8` with proper z-index
- Add subtle hover states for desktop mouse interaction

**JourneyBentoHero** (`JourneyBentoHero.tsx`):
- Remove the `{isMobile && ...}` wrapper around FAB
- The FAB component already has responsive positioning (`bottom-24 right-4 z-40 md:bottom-8 md:right-8`)

### Part 3: Redesign Desktop Layout

Replace the absolute-positioned "freeform" layout with a responsive grid that uses space efficiently:

**New Desktop Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  Stage Navigation Strip (horizontal)                    │
├───────────────────────┬─────────────────────────────────┤
│                       │                                 │
│  CURRENT STAGE        │  CONTEXT PANEL                  │
│  (Larger sticky note) │  - Next upcoming stage preview  │
│  - Full task list     │  - Last completed stage summary │
│  - Filters            │  - Quick stats                  │
│                       │                                 │
├───────────────────────┴─────────────────────────────────┤
│  Quick Actions Row                                      │
└─────────────────────────────────────────────────────────┘
```

**Implementation**:
- Use CSS Grid: `grid-cols-1 lg:grid-cols-[1fr_300px] gap-4`
- Current stage takes the main column with full task list
- Side panel shows stacked mini-cards for completed/upcoming stages
- Utilizes screen real estate efficiently

### Part 4: Implement Stacked Card UI for Mobile

Create a new stacked card layout inspired by KYFormCardStack:

**New Mobile Layout**:
```
┌────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░  (stage 3 behind)
│   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  (stage 2 behind)
│    ┌────────────────────────┐
│    │   CURRENT STAGE        │
│    │   ──────────────────   │
│    │   [✓] Task 1           │
│    │   [ ] Task 2           │
│    │   [ ] Task 3           │
│    └────────────────────────┘
│         ● ○ ○ ○ ○ ○  (dot indicators)
└────────────────────────────────────┘
```

**Implementation**:
- Create `StickyNoteCardStack.tsx` component
- Show current stage as the front card
- Background "ghost" cards (rotated, offset) represent other stages
- Swipe left/right to navigate between stages
- Animate card transitions like KYFormCardStack

**Technical Approach**:
- Track `currentStageIndex` state
- Render 2-3 background layers with increasing rotation/offset
- Use swipe gestures (touch events) to change stage index
- Animate with CSS transforms and keyframes

### Part 5: Fix Bidirectional Prep Sync

**Problem**: The `useRoadmapData` hook only invalidates `user-prep-progress` when toggling, but doesn't notify the journey system.

**Solution**: Add cross-query invalidation so both systems stay in sync.

**useRoadmapData.ts changes**:
```typescript
const togglePrepMutation = useMutation({
  mutationFn: async ({ itemId, completed }) => {
    // ... existing logic
  },
  onSuccess: () => {
    // Invalidate prep progress
    queryClient.invalidateQueries({ queryKey: ['user-prep-progress'] });
    // NEW: Also invalidate journey progress so sticky notes refresh
    queryClient.invalidateQueries({ queryKey: ['user_journey_progress'] });
    queryClient.invalidateQueries({ queryKey: ['prep-checklist-items'] });
  }
});
```

**useStudentJourney.ts changes**:
- Ensure the `isTaskAutoCompleted` check always uses fresh `prepProgress` data
- Add a `refetchInterval: false` to prevent stale data issues

### Part 6: Lightweight Whiteboard Feel

Instead of a full canvas implementation, add these features for a "whiteboard" feel:

1. **Draggable Sticky Notes (Desktop Only)**:
   - Use `react-draggable` or native drag events
   - Cards can be repositioned within a bounded area
   - Positions saved to localStorage for persistence

2. **Zoom Controls**:
   - Add zoom in/out buttons (or pinch gesture)
   - Use CSS transform scale on the container

3. **Pan Gesture (Mobile)**:
   - The horizontal carousel already provides panning
   - Enhance with momentum scrolling

**Simpler Alternative (Recommended)**:
- Skip full whiteboard for now
- Focus on the stacked card UI which gives a tactile, interactive feel
- Add subtle parallax/tilt effects on cards for depth

---

## File Changes Summary

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/journey/StickyNoteCardStack.tsx` | Stacked card container for mobile with swipe navigation |

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/journey/StageNavigationStrip.tsx` | Remove `min-w-[500px]`, add responsive spacing |
| `src/components/journey/JourneyBentoHero.tsx` | New grid-based desktop layout, stacked cards for mobile, enable FAB for all devices |
| `src/components/journey/StickyNoteCard.tsx` | Add overflow handling, ensure pin doesn't cause overflow |
| `src/components/journey/FloatingActionButton.tsx` | Adjust z-index if needed, ensure visibility |
| `src/hooks/useRoadmapData.ts` | Add cross-query invalidation for journey sync |
| `src/index.css` | Add stacked card animations, whiteboard-like interactions |

---

## Technical Specifications

### Stacked Card Stack Component

```typescript
// StickyNoteCardStack.tsx
interface StickyNoteCardStackProps {
  stages: JourneyStage[];
  currentIndex: number;
  onStageChange: (index: number) => void;
  children: (stage: JourneyStage, isActive: boolean) => React.ReactNode;
}
```

**Key Features**:
- Swipe detection using touch events
- Background cards with `rotate-[2deg] translate-y-2 translate-x-2`
- Animation classes: `animate-stack-pop-out`, `animate-stack-pop-in` (already exist)
- Dot indicators below the stack

### Responsive Desktop Grid

```css
/* Desktop layout */
.journey-hero-desktop {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1rem;
}

/* Side panel stacked cards */
.side-panel-stack {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
```

### Stage Navigation Responsive Fix

```typescript
// Remove hard min-width
<div className="w-full overflow-x-auto scrollbar-hide">
  <div className="flex items-center justify-between gap-2 sm:gap-4 px-2 py-3">
    {/* Stage items with flex-shrink-0 */}
  </div>
</div>
```

---

## Implementation Order

1. **Fix overflow issues** (Stage Navigation Strip) - Quick win
2. **Enable FAB on desktop** - Simple toggle
3. **Fix prep sync** - Add query invalidation
4. **Create stacked card component** - New mobile layout
5. **Redesign desktop layout** - Grid-based responsive design
6. **Add whiteboard-lite features** - Stretch goal if time permits

---

## Expected Outcomes

### Mobile
- Stacked card UI with visible depth layers
- Swipe between stages smoothly
- FAB visible and functional
- No horizontal overflow on stage strip
- Prep changes sync to sticky notes in real-time

### Desktop
- Efficient use of screen space with grid layout
- Current stage prominently displayed with full task list
- Side panel shows context (upcoming/completed stages)
- FAB available for quick actions
- All interactions work with mouse

### Sync Behavior
- Toggle prep item → Journey sticky note updates automatically
- Toggle journey task → Prep checklist updates automatically
- Both directions work seamlessly

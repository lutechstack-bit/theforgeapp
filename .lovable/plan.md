
## Student Journey Bento Box - Complete Visual Overhaul + Features 1-6

### Overview
This plan addresses the text visibility issues, implements a freeform sticky note layout, applies Forge brand colors, and adds 6 enhancement features to create a polished, engaging journey experience.

---

### Problem Analysis

From the screenshot and code review:
1. **Text is invisible** - Light cream text (`text-foreground`) on light amber/cream backgrounds
2. **Layout is rigid** - Current 3-column grid is uniform, lacks organic feel
3. **Brand colors underutilized** - Using generic Tailwind colors instead of Forge Yellow/Gold/Orange

---

### Part 1: Fix Text Visibility & Brand Colors

#### StickyNoteCard.tsx Changes

Replace the color variants with solid light paper backgrounds and ensure all text is black/dark:

| Element | Current (Broken) | Fixed |
|---------|------------------|-------|
| Card Background | `from-amber-50/90 to-amber-100/80` | Solid `bg-[#FEF7E0]` (warm cream) |
| Title Text | `text-{color}-600` (e.g., amber-600) | `text-gray-900 font-bold` |
| Task Text | `text-foreground` (cream) | `text-gray-800` |
| Description | `text-muted-foreground` | `text-gray-600` |
| Pin/Clip | Per-stage gradient | Forge brand gradient (yellow → gold → orange) |

**New Paper-Style Backgrounds (All Stages):**
```text
Pre-Registration: #FEF7E0 (warm cream)
Pre-Travel:       #FFF8E6 (pale amber)
Final Prep:       #FEF3C7 (light gold)
Online Forge:     #FDF6E3 (soft cream)
Physical Forge:   #FFFBEB (warm white)
Post Forge:       #FEF9E7 (champagne)
```

All backgrounds are light paper tones with **black text** for maximum contrast.

---

### Part 2: Freeform Layout

Transform the rigid 3-column grid into an organic, scattered layout:

**Desktop Layout (Freeform):**
```text
+------------------------------------------------------------------+
|  Hi Rahul! 23 days until Forge                    Stage 2 of 6   |
+------------------------------------------------------------------+
|  [o]----[●]----[ ]----[ ]----[ ]----[ ]                          |
+------------------------------------------------------------------+
|                                                                   |
|  +-------------+                                                  |
| /  COMPLETED   \      +--------------------+                      |
||  Pre-Reg       |    /   CURRENT STAGE     \     +------------+   |
||  ✓ Form        |   |   PRE-TRAVEL         |    /  UP NEXT    \  |
||  ✓ Profile     |   |   ☐ Book travel   →  |   |  Final Prep   | |
||  4/4 done ✓    |   |   ✓ Review map    →  |   |  ○ Script...  | |
| \  rotate:-3°  /    |   ☐ Packing...    →  |   |  ○ Day 0...   | |
|  +-------------+    |   3/6 tasks          |    \  rotate:+4° /  |
|     z-index:1       \     rotate:0°        /     +------------+   |
|                      +--------------------+        z-index:2      |
|                           z-index:3                               |
+------------------------------------------------------------------+
```

**CSS Implementation:**
- Completed stage: `left:0, top:16px, rotate(-3deg), z-index:1`
- Current stage: `left:50%, transform:translateX(-50%), top:0, rotate(0deg), z-index:3`
- Upcoming stage: `right:0, top:24px, rotate(4deg), z-index:2`
- Current stage is larger and has enhanced shadow/glow

**Mobile Layout:**
- Stays as vertical stack (no freeform on small screens)
- Current stage full width at top
- Completed/Upcoming in accordion

---

### Part 3: Enhanced Sticky Note Styling

Add paper texture and improved shadows:

```css
.sticky-note-paper {
  /* Solid light background for contrast */
  background: var(--paper-color);
  
  /* Paper texture effect */
  background-image: 
    linear-gradient(90deg, transparent 95%, rgba(0,0,0,0.02) 100%),
    linear-gradient(transparent 95%, rgba(0,0,0,0.02) 100%);
  
  /* Layered realistic shadow */
  box-shadow: 
    0 1px 3px rgba(0,0,0,0.08),
    0 4px 6px rgba(0,0,0,0.05),
    0 10px 20px rgba(0,0,0,0.08);
  
  /* Subtle border for definition */
  border: 1px solid rgba(0,0,0,0.05);
}
```

**Pin/Clip Styling (Forge Brand):**
```css
.sticky-pin {
  background: linear-gradient(
    to bottom, 
    #FFBC3B,  /* Forge Yellow */
    #D38F0C   /* Forge Gold */
  );
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
}
```

---

### Part 4: Feature 1 - Progress Ring on Stage Navigation

Add circular progress indicators around each stage dot showing completion percentage.

**Visual:**
```text
   ╭──────╮
   │  ✓   │  ← Completed (100% ring, green fill)
   ╰──────╯
   
   ╭▓▓▓▓──╮
   │  2   │  ← Current (partial ring showing 50%)
   ╰──────╯
   
   ╭──────╮
   │  3   │  ← Upcoming (empty ring, muted)
   ╰──────╯
```

**Implementation:**
- Use SVG circle with `stroke-dasharray` and `stroke-dashoffset` to create progress arc
- Calculate percentage from `getStageStats(stageId)`
- Colors: Emerald for completed, Primary (gold) for current, Muted for upcoming

---

### Part 5: Feature 2 - Drag to Reorder Tasks

Allow students to reorder tasks within a stage by drag-and-drop.

**Implementation:**
- Add `user_task_order` column to `user_journey_progress` or create new `user_task_preferences` table
- Use native HTML5 drag-and-drop or lightweight library
- Save order preference per user
- Tasks maintain custom order on next visit

**Interaction:**
- Long press (mobile) or grab handle (desktop) to initiate drag
- Visual feedback with lift effect and placeholder
- Save to database on drop

---

### Part 6: Feature 3 - Task Categories/Filters

Add filter buttons above the current stage tasks.

**UI:**
```text
+--------------------------------------------------+
|  PRE-TRAVEL                                      |
|  ┌─────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐ |
|  │ All │ │ Required │ │ Optional │ │ Completed │ |
|  └─────┘ └──────────┘ └──────────┘ └───────────┘ |
+--------------------------------------------------+
```

**Implementation:**
- Filter state managed locally
- Pills/tabs for: All | Required | Optional | Completed
- Filter applied only to current stage card
- Persist filter choice in localStorage

---

### Part 7: Feature 4 - Due Date Indicators

Show countdown/urgency for time-sensitive tasks.

**Database Change:**
- Add `due_days_offset` column to `journey_tasks` table (days relative to forge_start)

**Visual:**
```text
☐ Book Travel                    Due in 12 days  (green)
☐ Upload Ticket                  Due in 5 days   (yellow)
☐ Complete Script                Due in 2 days   (orange)
☐ Final Balance                  Due tomorrow!   (red)
```

**Color Coding:**
- 7+ days: Green (`text-emerald-600`)
- 4-7 days: Yellow (`text-amber-600`)
- 1-3 days: Orange (`text-orange-600`)
- 0 or overdue: Red (`text-red-600`)

---

### Part 8: Feature 5 - Celebration Animations

Trigger visual celebrations when completing stages or reaching milestones.

**Triggers:**
1. Complete a task: Checkbox scales up with checkmark animation
2. Complete all tasks in a stage: Confetti burst from the stage card
3. Move to next stage: Stage dots animate with connecting line "flowing"

**Implementation:**
- Confetti component using CSS keyframe animations
- Particles spawn from completed stage, fall/drift down
- Gold/yellow colored particles matching brand
- Auto-dismiss after 3 seconds

---

### Part 9: Feature 6 - Quick Actions Row

Add direct links below the bento box for immediate feature access.

**Visual:**
```text
+------------------------------------------------------------------+
|  [📍 View Roadmap]  [💬 Open Community]  [📚 Watch Next Class]    |
+------------------------------------------------------------------+
```

**Implementation:**
- Horizontal row of pill-style buttons
- Icons + short labels
- Links to: /roadmap, /community, /learn
- Responsive: 3 columns on desktop, horizontal scroll on mobile
- Glass-card styling with hover gold glow

---

### Database Migration

**New columns for `journey_tasks` table:**
```sql
ALTER TABLE journey_tasks 
ADD COLUMN due_days_offset INTEGER DEFAULT NULL;

COMMENT ON COLUMN journey_tasks.due_days_offset IS 
  'Number of days before forge_start_date this task is due. NULL means no due date.';
```

---

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/journey/ProgressRing.tsx` | SVG circular progress indicator |
| `src/components/journey/TaskFilters.tsx` | Filter pills component |
| `src/components/journey/DueDateBadge.tsx` | Due date countdown badge |
| `src/components/journey/ConfettiCelebration.tsx` | Stage completion animation |
| `src/components/journey/QuickActionsRow.tsx` | Feature shortcut buttons |

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/journey/StickyNoteCard.tsx` | Light paper backgrounds, black text, Forge brand pins, paper texture, freeform rotation support |
| `src/components/journey/JourneyBentoHero.tsx` | Freeform layout with absolute positioning, z-index layering, enhanced current stage, quick actions row |
| `src/components/journey/JourneyTaskItem.tsx` | Dark text colors, due date badge, drag handle, better contrast |
| `src/components/journey/StageNavigationStrip.tsx` | Progress ring around dots, stage click to celebrate |
| `src/hooks/useStudentJourney.ts` | Add task order preference, filter support, due date calculations |
| `src/index.css` | Add confetti keyframes and sticky-note paper classes |

---

### Component Architecture

```text
JourneyBentoHero
├── Header (Greeting + Stage Counter)
├── StageNavigationStrip
│   └── ProgressRing (for each stage dot)
├── Freeform Bento Container
│   ├── StickyNoteCard (Completed - absolute left)
│   │   └── JourneyTaskItem (compact, completed styling)
│   ├── StickyNoteCard (Current - absolute center)
│   │   ├── TaskFilters
│   │   └── JourneyTaskItem (full, with due dates, draggable)
│   │       └── DueDateBadge
│   └── StickyNoteCard (Upcoming - absolute right)
│       └── JourneyTaskItem (locked preview)
├── QuickActionsRow
└── ConfettiCelebration (triggered on stage complete)
```

---

### Mobile Responsiveness

All features adapt for mobile:
- **Freeform layout**: Disabled on mobile, uses vertical stack
- **Progress rings**: Slightly smaller on mobile
- **Task filters**: Horizontal scroll if needed
- **Due dates**: Abbreviated ("5d" instead of "5 days")
- **Quick actions**: Horizontal scroll row
- **Confetti**: Reduced particle count for performance

---

### Summary

This implementation will:
1. Fix text visibility with black text on light paper backgrounds
2. Create organic freeform layout with scattered, overlapping sticky notes
3. Apply Forge brand colors (Yellow/Gold/Orange) to pins and accents
4. Add progress rings showing completion % per stage
5. Enable drag-to-reorder for personal task prioritization
6. Add filter pills (All/Required/Optional/Completed)
7. Show due date indicators with color-coded urgency
8. Trigger celebration animations on stage completion
9. Provide quick action buttons for feature navigation

The result will be a polished, engaging, and functional journey dashboard that drives app usage while delighting students with premium interactions.


## Journey Hero Section Enhancement - 8 Premium Mobile-First Features

This plan implements 8 mobile-friendly improvements to the Journey Bento Hero section, enhancing user experience with swipe gestures, bottom sheets, streak tracking, horizontal carousels, pull-to-refresh, floating action buttons, sticky progress bars, and dark mode textures.

---

### Features Overview

| # | Feature | Mobile Benefit |
|---|---------|----------------|
| 1 | Swipe-to-Complete Gesture | iOS-style task completion |
| 2 | Bottom Sheet Drawer | Thumb-friendly task details |
| 3 | Streak Counter | Daily motivation tracker |
| 4 | Horizontal Stage Carousel | Swipeable stage navigation |
| 5 | Pull-to-Refresh | Native refresh gesture |
| 6 | Floating Action Button (FAB) | Quick access to key actions |
| 9 | Sticky Progress Bar | Always-visible completion status |
| 10 | Dark Mode Textures | Better dark theme contrast |

---

### Part 1: Swipe-to-Complete Gesture

**What it does:** Allow users to swipe right on a task to complete it, swipe left to undo.

**Implementation:**
- Create new `SwipeableTaskItem.tsx` component with touch event handlers
- Use CSS transforms for smooth swipe animation
- Threshold of 80px triggers completion
- Visual feedback: green checkmark appears during swipe right, red X during swipe left

**Files to create:**
- `src/components/journey/SwipeableTaskItem.tsx`

**Files to modify:**
- `src/components/journey/StickyNoteDetailModal.tsx` - Use SwipeableTaskItem instead of current row
- `src/index.css` - Add swipe animations

**Technical approach:**
```text
Touch Events Flow:
onTouchStart → Record startX position
onTouchMove → Calculate deltaX, apply translateX transform
onTouchEnd → If deltaX > 80px, trigger complete/uncomplete
```

---

### Part 2: Bottom Sheet Drawer (Replace Dialog Modal)

**What it does:** Replace the current Dialog modal with a Vaul bottom sheet drawer for mobile, keeping Dialog for desktop.

**Implementation:**
- Create new `StickyNoteBottomSheet.tsx` component using existing `Drawer` primitive
- On mobile: Use bottom sheet that slides up from bottom
- On desktop: Keep existing Dialog modal
- Add snap points: 50% (preview), 90% (full)

**Files to create:**
- `src/components/journey/StickyNoteBottomSheet.tsx`

**Files to modify:**
- `src/components/journey/JourneyBentoHero.tsx` - Conditionally render Drawer on mobile, Dialog on desktop
- `src/components/journey/index.ts` - Export new component

**Bottom Sheet Layout:**
```text
┌──────────────────────────────┐
│         ━━━━━━━━━            │ ← Drag handle
│  FINAL PREP          3/5 ✓  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━  │ ← Progress bar
├──────────────────────────────┤
│  [✓] Complete script prep    │ ← Swipeable rows
│  [ ] Pack your bags          │
│  ...                         │
├──────────────────────────────┤
│  [  View Full Prep  ]        │ ← Footer CTA
└──────────────────────────────┘
```

---

### Part 3: Streak Counter

**What it does:** Track consecutive days of task completion to motivate users.

**Implementation:**
- Create `useStreak.ts` hook to calculate streak from `user_journey_progress` timestamps
- Display streak badge in hero header with fire emoji
- Streak breaks if no task completed in 24 hours
- Store last activity in localStorage as backup

**Files to create:**
- `src/hooks/useStreak.ts`
- `src/components/journey/StreakBadge.tsx`

**Files to modify:**
- `src/components/journey/JourneyBentoHero.tsx` - Add StreakBadge to header

**Streak Calculation Logic:**
```text
1. Query user_journey_progress ORDER BY completed_at DESC
2. Group completions by date
3. Count consecutive days from today backwards
4. If no completion today but yesterday has one, streak continues
5. If gap > 1 day, streak = 0
```

**Visual Design:**
```text
🔥 3-day streak!
```

---

### Part 4: Horizontal Stage Carousel (Mobile)

**What it does:** Replace vertical stack of sticky notes with horizontal swipeable carousel on mobile.

**Implementation:**
- Use existing Embla carousel component
- Each sticky note becomes a carousel slide
- Current stage centered, completed/upcoming peek from sides
- Dot indicators show current position
- Snap to stage on swipe

**Files to modify:**
- `src/components/journey/JourneyBentoHero.tsx` - Replace mobile vertical stack with Carousel
- `src/components/journey/StickyNoteCard.tsx` - Add full-width mode for carousel

**Mobile Layout (Before → After):**
```text
BEFORE (Vertical Stack):         AFTER (Horizontal Carousel):
┌──────────────────┐            ┌────┬──────────────────┬────┐
│ Current Stage    │            │ <  │  Current Stage   │  > │
└──────────────────┘            └────┴──────────────────┴────┘
┌──────────────────┐                     ○ ● ○ ○ ○ ○
│ Completed        │                     (dot indicators)
└──────────────────┘
```

---

### Part 5: Pull-to-Refresh

**What it does:** Allow users to pull down on the hero section to refresh journey data.

**Implementation:**
- Create `usePullToRefresh.ts` hook with touch event handling
- Show loading spinner when pulled past threshold (60px)
- Invalidate and refetch journey queries on release
- Animate content back to position

**Files to create:**
- `src/hooks/usePullToRefresh.ts`
- `src/components/journey/PullToRefreshWrapper.tsx`

**Files to modify:**
- `src/components/journey/JourneyBentoHero.tsx` - Wrap content in PullToRefreshWrapper

**Visual States:**
```text
Pull:     ↓ Pull to refresh...  (< 60px)
Release:  ↻ Release to refresh  (> 60px)
Loading:  ⟳ (spinner)           (fetching)
Done:     ✓ Updated!            (complete)
```

---

### Part 6: Floating Action Button (FAB)

**What it does:** Quick access button for key actions: Add reminder, Mark all as reviewed, Quick nav.

**Implementation:**
- Create `FloatingActionButton.tsx` component
- Fixed position bottom-right (above bottom nav on mobile)
- Expandable menu with 3 actions:
  1. Set reminder (opens native notification prompt)
  2. Mark current stage as reviewed
  3. Jump to roadmap

**Files to create:**
- `src/components/journey/FloatingActionButton.tsx`

**Files to modify:**
- `src/components/journey/JourneyBentoHero.tsx` - Add FAB component
- `src/index.css` - Add FAB animations

**FAB Layout:**
```text
                          ┌─────────┐
                          │ Roadmap │ ← Action 3
                          └─────────┘
                     ┌──────────────────┐
                     │ Mark as Reviewed │ ← Action 2
                     └──────────────────┘
                        ┌────────────┐
                        │ + Reminder │ ← Action 1
                        └────────────┘
                              ⊕        ← Main FAB (tap to expand)
```

---

### Part 7: Sticky Progress Bar

**What it does:** Always-visible progress indicator at top of viewport showing overall journey completion.

**Implementation:**
- Create `StickyProgressBar.tsx` component
- Fixed position at top when scrolling past hero
- Shows: Current stage name + X/Y tasks + progress bar
- Uses Intersection Observer to detect when to show/hide

**Files to create:**
- `src/components/journey/StickyProgressBar.tsx`

**Files to modify:**
- `src/components/journey/JourneyBentoHero.tsx` - Add StickyProgressBar with ref

**Visual:**
```text
┌────────────────────────────────────────────┐
│ Final Prep  ━━━━━━━━━━━━░░░░  3/5 complete │
└────────────────────────────────────────────┘
```

---

### Part 8: Dark Mode Textures

**What it does:** Improve sticky note appearance in dark mode with proper textures and contrast.

**Implementation:**
- Update `StickyNoteCard.tsx` with dark mode variants
- Use darker paper colors that still feel "papery"
- Adjust pin/clip colors for visibility
- Ensure text remains readable
- Add subtle noise texture overlay

**Files to modify:**
- `src/components/journey/StickyNoteCard.tsx` - Add dark mode color mappings
- `src/index.css` - Add paper texture patterns for dark mode

**Dark Mode Color Palette:**
```text
Paper backgrounds (dark mode):
- pre_registration: #2A2520 (warm dark brown)
- pre_travel: #2D2618 (amber-tinted dark)
- final_prep: #332B1C (gold-tinted dark)
- online_forge: #2A2618 (cream-tinted dark)
- physical_forge: #302A1E (warm sepia dark)
- post_forge: #2B2519 (champagne-tinted dark)

Pin gradient: #FFBC3B → #D38F0C (same, high contrast)
Text: #E8E0D4 (warm cream)
```

---

### Database Changes

**Add DELETE policy for user_journey_progress** (fixes the ticking issue from earlier):

```sql
CREATE POLICY "Users can delete their own progress"
ON user_journey_progress
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

---

### File Summary

**New Files (8):**
| File | Purpose |
|------|---------|
| `src/components/journey/SwipeableTaskItem.tsx` | Swipe gesture for task completion |
| `src/components/journey/StickyNoteBottomSheet.tsx` | Mobile bottom sheet drawer |
| `src/components/journey/StreakBadge.tsx` | Streak counter display |
| `src/components/journey/FloatingActionButton.tsx` | Quick actions FAB |
| `src/components/journey/StickyProgressBar.tsx` | Fixed progress indicator |
| `src/components/journey/PullToRefreshWrapper.tsx` | Pull-to-refresh container |
| `src/hooks/useStreak.ts` | Streak calculation logic |
| `src/hooks/usePullToRefresh.ts` | Pull-to-refresh touch handling |

**Modified Files (5):**
| File | Changes |
|------|---------|
| `src/components/journey/JourneyBentoHero.tsx` | Integrate all new features, horizontal carousel on mobile |
| `src/components/journey/StickyNoteCard.tsx` | Dark mode textures, carousel-ready sizing |
| `src/components/journey/StickyNoteDetailModal.tsx` | Swipeable task rows |
| `src/components/journey/index.ts` | Export new components |
| `src/index.css` | Swipe animations, FAB animations, dark mode textures |

**Database Migration (1):**
- Add DELETE policy to `user_journey_progress`

---

### Implementation Order

1. **Database migration** - Fix the DELETE policy first
2. **Dark mode textures** - Quick visual improvement
3. **Bottom sheet drawer** - Better mobile interaction
4. **Horizontal carousel** - Transform mobile layout
5. **Swipe-to-complete** - Add gesture support
6. **Streak counter** - Motivation feature
7. **Pull-to-refresh** - Native feel
8. **Sticky progress bar** - Always-visible status
9. **Floating action button** - Quick actions

---

### Mobile-First Considerations

All implementations follow these principles:
- Touch targets minimum 44x44px
- Safe area padding for notched devices
- Smooth 60fps animations using CSS transforms
- No blocking of main thread during gestures
- Graceful degradation on older devices
- Works with bottom navigation bar spacing

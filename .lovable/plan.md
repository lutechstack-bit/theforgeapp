

# Fix: Smooth Mobile Roadmap Experience

## Problems Identified

Based on the screenshots and code analysis:

### Problem 1: Highlights Button Hidden in Scroll
The "Highlights" button is placed **at the end** of a horizontally scrollable navigation bar. On mobile, users must scroll all the way right to discover it - most never will. This is why Past Moments, Student Work, and Stay Locations are inaccessible on mobile.

### Problem 2: Navigation Bar Layout Is Clunky
The QuickActionsBar tries to fit too many items in a single horizontal scroll, creating a "clumsy" feel. The sticky positioning and glass effect may also cause visual artifacts on mobile Safari.

### Problem 3: No Dedicated Mobile Highlights Access
Unlike the Home page (which has `RoadmapBentoBox` with tap-to-open cards), the Roadmap page relies on a hidden button that users can't find.

---

## Solution: Two-Tier Mobile Navigation

### Architecture Change
Create a cleaner mobile experience with:
1. **Simplified Tab Bar** - Only essential navigation tabs (Journey, Prep, Equipment, Rules)
2. **Floating Highlights Button** - A prominent, always-visible FAB for Highlights
3. **Direct Bento Cards (Alternative)** - Show highlights as tappable cards below the main content

---

## Implementation Plan

### Part 1: Create Floating Highlights Button

**New File:** `src/components/roadmap/FloatingHighlightsButton.tsx`

A fixed-position floating button that:
- Only shows on mobile/tablet (`lg:hidden`)
- Positioned at bottom-right, above the bottom nav bar
- Uses a sparkle icon with the primary brand color
- Opens the `MobileHighlightsSheet` when tapped
- Has a subtle pulse animation to draw attention

```text
┌─────────────────────────────────────────┐
│  Journey Content...                     │
│                                         │
│                                         │
│                                   [✨]  │  ← Floating button
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  Home  Community  Learn  Events  Profile│  ← Bottom nav
└─────────────────────────────────────────┘
```

### Part 2: Clean Up QuickActionsBar

**File:** `src/components/roadmap/QuickActionsBar.tsx`

Changes:
- Remove the `mobileHighlightsButton` prop entirely
- Remove the border-separated highlights section
- Keep only the core navigation tabs
- Add `flex-wrap` on mobile for better layout if there are many tabs

```text
Before (scrollable, hidden button):
[Journey] [Prep] [Equipment] [Rules] [Gallery] [Films] | [✨ Highlights] →

After (clean, no highlights in bar):
[Journey] [Prep] [Equipment] [Rules] [Gallery] [Films]
```

### Part 3: Update MobileHighlightsSheet

**File:** `src/components/roadmap/MobileHighlightsSheet.tsx`

Changes:
- Add controlled state props (`open`, `onOpenChange`) for external triggering
- Improve the sheet content layout for better mobile scrolling
- Ensure the sheet has proper safe-area padding for notched devices

### Part 4: Integrate in RoadmapLayout

**File:** `src/components/roadmap/RoadmapLayout.tsx`

Changes:
- Remove `mobileHighlightsButton` prop from QuickActionsBar
- Add the new `FloatingHighlightsButton` component at the layout level
- Pass the edition ID for content filtering

---

## Visual Result

### Mobile Roadmap After Fix

```text
┌─────────────────────────────────────────┐
│  Forge Creators · Edition 24            │  ← Hero
│  15 Days • Goa • Dec 25                 │
├─────────────────────────────────────────┤
│ [Journey] [Prep] [Equipment] [Rules]    │  ← Clean tabs
├─────────────────────────────────────────┤
│                                         │
│  📅 Your Journey                        │
│  ┌─────────────────────────────────────┐│
│  │ Day 1: Opening Day                 ││
│  │ Dec 25 • Goa • 9:00 AM            ││
│  └─────────────────────────────────────┘│
│  ┌─────────────────────────────────────┐│
│  │ Day 2: Story Fundamentals          ││
│  │ ...                                 ││
│  └─────────────────────────────────────┘│
│                                         │
│                                   [✨]  │  ← Floating button
│                                         │
├─────────────────────────────────────────┤
│  Home  Community  Learn  Events  Profile│
└─────────────────────────────────────────┘
```

### When Floating Button Tapped

```text
┌─────────────────────────────────────────┐
│ ━━━━━                                   │  ← Drag handle
│        Forge Highlights                 │
├─────────────────────────────────────────┤
│  ┌─ 📸 Past Moments ───────────────────┐│
│  │  [◀] Photo 1/8 [▶]                  ││
│  │  [Image Preview]                    ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─ 🎬 Student Work ───────────────────┐│
│  │  [◀] Video 1/5 [▶]                  ││
│  │  [YouTube Embed]                    ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─ 📍 Stay Locations ─────────────────┐│
│  │  [◀] Location 1/3 [▶]               ││
│  │  [Image Preview]                    ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/roadmap/FloatingHighlightsButton.tsx` | **Create** - New floating button component |
| `src/components/roadmap/RoadmapLayout.tsx` | Integrate FAB, remove mobileHighlightsButton |
| `src/components/roadmap/QuickActionsBar.tsx` | Remove mobileHighlightsButton prop and code |
| `src/components/roadmap/MobileHighlightsSheet.tsx` | Add controlled open state support |

---

## Technical Details

### Floating Button Component

```typescript
// FloatingHighlightsButton.tsx
const FloatingHighlightsButton: React.FC<{ editionId?: string }> = ({ editionId }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      {/* Floating button - above bottom nav (h-16 + safe area) */}
      <button
        onClick={() => setIsOpen(true)}
        className="
          fixed bottom-24 right-4 z-40 lg:hidden
          p-4 rounded-full
          bg-gradient-to-br from-primary to-accent
          shadow-lg shadow-primary/30
          animate-pulse-soft
          active:scale-95 transition-transform
        "
        aria-label="View Forge Highlights"
      >
        <Sparkles className="w-5 h-5 text-primary-foreground" />
      </button>
      
      {/* Bottom sheet with sidebar content */}
      <MobileHighlightsSheet
        editionId={editionId}
        open={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  );
};
```

### Updated MobileHighlightsSheet Props

```typescript
interface MobileHighlightsSheetProps {
  editionId?: string;
  trigger?: React.ReactNode;
  open?: boolean;           // NEW: External control
  onOpenChange?: (open: boolean) => void;  // NEW: External control
}
```

### Pulse Animation (if not exists)

```css
@keyframes pulse-soft {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(1.05); }
}

.animate-pulse-soft {
  animation: pulse-soft 2s ease-in-out infinite;
}
```

---

## Accessibility Considerations

1. **Touch Target**: FAB is 48x48px minimum (meets WCAG guidelines)
2. **ARIA Label**: Clear description "View Forge Highlights"
3. **Focus Management**: Sheet opens with focus on close button
4. **Keyboard Navigation**: ESC closes the sheet
5. **Motion**: Respects `prefers-reduced-motion` for animations

---

## Expected Results

1. **Easy Discovery**: Floating sparkle button is always visible on mobile
2. **One-Tap Access**: Opens bottom sheet with all sidebar content instantly
3. **Clean Navigation**: Tab bar is simplified without the hidden Highlights button
4. **Consistent UX**: Same content accessible on mobile as desktop, just different presentation
5. **Smooth Feel**: Premium animations and transitions match the rest of the app


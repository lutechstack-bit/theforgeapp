

# Fix: Mobile PWA Issues - Sticky Notes, Personal Note, and Sidebar Highlights

## Issues Identified from Screenshots

### Issue 1: Sticky Note Card Stack - Overlapping/Glitchy Swipe
**Screenshots 1 & 2** show multiple cards overlapping awkwardly during swipe transitions. The cards are stacking incorrectly, with visible "Coming soon" overlays from background cards bleeding through.

**Root Cause:** The `StickyNoteCardStack` component has issues with:
- Cards not clipping properly within their container
- Background cards visible and overlapping the foreground
- Transform calculations creating visual artifacts on mobile Safari
- Touch events potentially conflicting with parent scroll

---

### Issue 2: Personal Note Card Missing on Mobile
The `PersonalNoteCard` is only rendered in the **desktop grid layout** (`!isMobile` section). Looking at JourneyBentoHero.tsx:
- Lines 261-385: Desktop layout includes `<PersonalNoteCard />`
- Lines 388-479: Mobile layout (StickyNoteCardStack) does **NOT** include PersonalNoteCard

---

### Issue 3: Sidebar Highlights Not Visible in PWA
**Screenshots 4 & 5** show the sidebar content (Past Moments, Student Work, Stay Location) working on desktop but missing on mobile.

**Root Cause:** In `RoadmapLayout.tsx`:
- Lines 91-96: Sidebar is hidden with `hidden lg:block`
- Lines 82-84: `MobileHighlightsSheet` is passed to `QuickActionsBar` as a trigger button
- BUT the trigger button (Highlights) may not be clearly visible or the sheet content may not render properly

The home page uses `RoadmapBentoBox` which shows these items as compact cards - this should work on mobile. The issue appears to be on the Roadmap page specifically.

---

## Solution Plan

### Part 1: Fix Sticky Note Card Stack Swipe

**File:** `src/components/journey/StickyNoteCardStack.tsx`

1. **Use Embla Carousel** instead of custom swipe implementation for reliable touch handling
2. If keeping custom implementation:
   - Add `overflow-hidden` to container to clip background cards
   - Reduce visible background cards from 2 to 1
   - Add `touch-pan-x` for better touch handling
   - Reduce rotation and offset values for less visual clutter
   - Add `will-change: transform` for GPU acceleration
   - Prevent touch events from bubbling up
   - Add haptic feedback on successful swipe

**Key Changes:**
```typescript
// Container with proper clipping
<div 
  ref={containerRef}
  className="relative min-h-[320px] overflow-hidden touch-pan-x"
  style={{ touchAction: 'pan-x' }}
  // ... handlers
>

// Limit visible cards to 1 in each direction
const isVisible = Math.abs(offset) <= 1;

// Reduce visual clutter
const baseRotation = offset * 1; // Was 2
const baseTranslateX = offset * 4; // Was 8
const baseTranslateY = Math.abs(offset) * 4; // Was 6
const scale = 1 - Math.abs(offset) * 0.05;
const opacity = 1 - Math.abs(offset) * 0.4;
```

---

### Part 2: Add Personal Note Card to Mobile View

**File:** `src/components/journey/JourneyBentoHero.tsx`

Add `PersonalNoteCard` below the `StickyNoteCardStack` in the mobile section:

```tsx
{/* Mobile: Stacked Card UI */}
{isMobile && (
  <>
    <StickyNoteCardStack
      stages={allOrderedStages}
      currentIndex={effectiveMobileIndex}
      onStageChange={setMobileCurrentIndex}
    >
      {/* ... existing children */}
    </StickyNoteCardStack>
    
    {/* Personal Note - Mobile placement */}
    <PersonalNoteCard compact className="mt-4" />
  </>
)}
```

---

### Part 3: Fix Mobile Highlights Sheet Visibility

**File:** `src/components/roadmap/QuickActionsBar.tsx`

Improve the Highlights button visibility:

```tsx
{/* Mobile Highlights Button */}
{mobileHighlightsButton && (
  <div className="lg:hidden flex-shrink-0">
    {mobileHighlightsButton}
  </div>
)}
```

**File:** `src/components/roadmap/MobileHighlightsSheet.tsx`

Improve trigger visibility with a more prominent button:

```tsx
<SheetTrigger asChild>
  {trigger || (
    <Button 
      variant="outline" 
      size="sm" 
      className="gap-2 bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
    >
      <Sparkles className="w-4 h-4" />
      Highlights
    </Button>
  )}
</SheetTrigger>
```

Also ensure the sheet content scrolls properly and renders the sidebar content.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/journey/StickyNoteCardStack.tsx` | Fix swipe mechanics, reduce visual artifacts, better touch handling |
| `src/components/journey/JourneyBentoHero.tsx` | Add PersonalNoteCard to mobile layout section |
| `src/components/roadmap/QuickActionsBar.tsx` | Improve mobile highlights button visibility |
| `src/components/roadmap/MobileHighlightsSheet.tsx` | More prominent trigger button styling |

---

## Visual Before/After

### Mobile Journey Section (After Fix)

```text
┌─────────────────────────────────────────┐
│  Good morning! 👋        🔥 7-day      │
│  10 days until Forge     Stage 1 of 6  │
├─────────────────────────────────────────┤
│  📢 Announcement Banner                 │
├─────────────────────────────────────────┤
│  [●1] [○2] [○3] [○4] [○5] [○6]          │  ← Stage Nav
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐│
│  │ 📋 Pre-Registration          1/6   ││  ← Single clean card
│  │ ──────────────────────────────────── ││    (no background overlap)
│  │ [✓] Complete KYF Form               ││
│  │ [ ] Book your travel                ││
│  │ Tap to see all 6 tasks              ││
│  └─────────────────────────────────────┘│
│  ●  ○  ○  ○  ○  ○                       │  ← Dot indicators
├─────────────────────────────────────────┤
│  ┌─ 📝 My Notes ───────────────────────┐│  ← Personal Note (NEW)
│  │  Tap to add a personal note...      ││
│  └─────────────────────────────────────┘│
├─────────────────────────────────────────┤
│  [View Roadmap]   [Open Community]      │  ← Quick Actions
└─────────────────────────────────────────┘
```

### Roadmap Mobile (After Fix)

```text
┌─────────────────────────────────────────┐
│  Journey  Prep  Equipment  [✨Highlights]│  ← Visible button
└─────────────────────────────────────────┘
     When tapped, opens bottom sheet with:
     - Past Moments carousel
     - Student Work carousel
     - Stay Location carousel
```

---

## Technical Details

### 1. Card Stack Touch Improvements

```typescript
// Prevent default on touch move to avoid scroll interference
const handleTouchMove = useCallback((e: React.TouchEvent) => {
  if (!isDragging) return;
  
  const currentX = e.touches[0].clientX;
  const diff = currentX - startXRef.current;
  
  // Only prevent default if horizontal swipe detected
  if (Math.abs(diff) > 10) {
    e.preventDefault();
  }
  
  setDragOffset(diff);
}, [isDragging]);

// Use passive: false for touchmove to allow preventDefault
useEffect(() => {
  const container = containerRef.current;
  if (!container) return;
  
  const options = { passive: false };
  container.addEventListener('touchmove', handleTouchMoveNative, options);
  
  return () => {
    container.removeEventListener('touchmove', handleTouchMoveNative);
  };
}, []);
```

### 2. GPU Acceleration for Smoother Animations

```typescript
style={{
  transform: `translateX(${translateX}px) translateY(${baseTranslateY}px) rotate(${rotation}deg) scale(${scale})`,
  zIndex,
  opacity: offset === 0 ? 1 : opacity,
  willChange: 'transform, opacity',
  backfaceVisibility: 'hidden',
}}
```

---

## Expected Results

1. **Smooth Card Swiping**: Single card visible with minimal background peek, clean transitions
2. **Personal Note Visible**: Rose-colored note card appears below journey stack on mobile
3. **Highlights Accessible**: Prominent button in Roadmap nav opens bottom sheet with all sidebar content


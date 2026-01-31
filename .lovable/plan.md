

# Fix Carousel Cards Overflowing Into Section Headers

## Problem
On the Learn page (both mobile and web), carousel cards visually overflow/overlap into the section headers above them. This affects:
- "Pre Forge Sessions" section
- "More from LevelUp" section  
- "Continue Watching" section

## Root Cause
The base `CarouselContent` component already includes built-in classes:
- `py-4 -my-4` (for hover glow effect overflow)
- `-ml-4` (for horizontal offset)

But the consuming files add these same classes AGAIN, doubling the negative margins and causing excessive upward overflow.

## Solution
Remove the duplicate `-ml-4 py-4 -my-4` classes from all consuming files since the base component already handles this.

---

## Files to Modify

### 1. `src/pages/Learn.tsx` (line 146)
```tsx
// Current (duplicate classes)
<CarouselContent className="-ml-4 py-4 -my-4">

// Fixed (no duplicate)
<CarouselContent>
```

### 2. `src/components/learn/ContinueWatchingCarousel.tsx` (line 53)
```tsx
// Current
<CarouselContent className="-ml-4 py-4 -my-4">

// Fixed
<CarouselContent>
```

### 3. `src/components/learn/LearnCarousel.tsx` (line 59)
```tsx
// Current
<CarouselContent className="-ml-4 py-4 -my-4">

// Fixed
<CarouselContent>
```

### 4. `src/components/learn/PremiumVideoCarousel.tsx` (line 63)
```tsx
// Current
<CarouselContent className="-ml-4 py-4 -my-4">

// Fixed
<CarouselContent>
```

---

## Visual Result

**Before (Mobile & Web):**
```text
┌─────────────────────────────────────────┐
│ Pre Forge Sessions          [View All] │
│ Filmmaking fundamentals...              │
│ ┌─────────────┬─────────────┐           │  ← Cards overlapping text
│ │   CARD 1    │   CARD 2    │           │
```

**After (Mobile & Web):**
```text
┌─────────────────────────────────────────┐
│ Pre Forge Sessions          [View All] │
│ Filmmaking fundamentals...              │
│                                         │  ← Proper spacing
│ ┌─────────────┬─────────────┐           │
│ │   CARD 1    │   CARD 2    │           │
```

---

## Summary

| File | Change |
|------|--------|
| `src/pages/Learn.tsx` | Remove `-ml-4 py-4 -my-4` from CarouselContent |
| `src/components/learn/ContinueWatchingCarousel.tsx` | Remove `-ml-4 py-4 -my-4` from CarouselContent |
| `src/components/learn/LearnCarousel.tsx` | Remove `-ml-4 py-4 -my-4` from CarouselContent |
| `src/components/learn/PremiumVideoCarousel.tsx` | Remove `-ml-4 py-4 -my-4` from CarouselContent |

This fix applies to both mobile and web views since the base carousel component handles all viewport sizes consistently.


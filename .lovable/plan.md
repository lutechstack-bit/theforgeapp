

# Smooth Dynamic Text Color Transition for Countdown Timer

## Problem
Currently with 9 days remaining:
- Progress = (90 - 9) / 90 × 100 = **90%**
- All position thresholds (28%, 48%, 68%, 88%) are exceeded by 90%
- Result: All numbers show black text instead of transitioning dynamically

## Goal
Create a **smooth, dynamic transition** where:
- As the gold fill moves across each number, that number changes to black
- Numbers still on the dark background stay cream/light
- The transition should be visually accurate to where the fill actually is

## Solution: Use 30-Day Visual Scale

Change the reference duration from 90 days to **30 days**. This creates a meaningful visual progress that properly aligns with the position thresholds:

### Visual Mapping

| Days Remaining | Progress % | What Shows Black | What Shows Cream |
|----------------|------------|------------------|------------------|
| 30+ days | 0% | Nothing | All numbers |
| 24 days | 20% | City | Days, Hours, Min, Sec |
| 18 days | 40% | City, Days | Hours, Min, Sec |
| 12 days | 60% | City, Days, Hours | Min, Sec |
| 9 days | **70%** | City, Days, Hours, Min | **Sec only** |
| 6 days | 80% | City, Days, Hours, Min | Sec (barely) |
| 0 days | 100% | Everything | Nothing |

### With 9 Days Remaining (Your Current State)

```text
Progress = (30 - 9) / 30 × 100 = 70%

Position thresholds:
- City:    10% → Passed (70 > 10) → BLACK
- Days:    28% → Passed (70 > 28) → BLACK  
- Hours:   48% → Passed (70 > 48) → BLACK
- Minutes: 68% → Passed (70 > 68) → BLACK
- Seconds: 88% → NOT Passed (70 < 88) → CREAM ✓

Visual:
┌─────────────────────────────────────────────────────────────────┐
│ See you in │   09   :   23   :   45   :   12                    │
│ Hyderabad  │  Days     Hours    Min      Sec                    │
│  [BLACK]   │ [BLACK]  [BLACK] [BLACK]  [CREAM]                  │
└─────────────────────────────────────────────────────────────────┘
████████████████████████████████████████████████░░░░░░░░░░░░░░░░░░
                                               ↑
                                           70% mark
```

## Technical Changes

### File: `src/components/home/CompactCountdownTimer.tsx`

**Update lines 60-73** - Replace the progress calculation:

**Current (90-day scale):**
```typescript
const totalDuration = 90 * 24 * 60 * 60 * 1000;
const remaining = end - now;
const elapsed = totalDuration - remaining;
return Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
```

**New (30-day scale for smooth visual alignment):**
```typescript
const progressPercent = useMemo(() => {
  if (!edition?.forge_start_date) return 0;
  
  const now = new Date().getTime();
  const end = new Date(edition.forge_start_date).getTime();
  const remaining = end - now;
  
  if (remaining <= 0) return 100; // Event has started
  
  // Calculate days remaining
  const daysRemaining = remaining / (1000 * 60 * 60 * 24);
  
  // Use 30-day scale for meaningful visual progress
  // This ensures smooth color transitions that align with element positions
  const maxDays = 30;
  const effectiveDays = Math.min(daysRemaining, maxDays);
  const progress = ((maxDays - effectiveDays) / maxDays) * 100;
  
  return Math.max(0, Math.min(100, progress));
}, [edition?.forge_start_date, timeLeft.days]);
```

## Why This Works

The position thresholds are already correct:
- Days: ~28%
- Hours: ~48%  
- Minutes: ~68%
- Seconds: ~88%

The problem is that 90% progress (from 90-day window) exceeds ALL of them.

By using a 30-day window:
- 9 days remaining = 70% progress
- 70% is between Minutes (68%) and Seconds (88%)
- Minutes and everything before it = BLACK
- Seconds = CREAM

As days decrease, the gold fill smoothly advances and each number changes color when the fill reaches it.

## Files to Modify

| File | Change |
|------|--------|
| `src/components/home/CompactCountdownTimer.tsx` | Lines 60-73: Update progress calculation to use 30-day scale |

## Expected Behavior

The gold fill will now align properly with the position thresholds, creating a smooth visual transition where:
- Numbers covered by the gold fill → black text
- Numbers on dark background → cream text
- As days decrease, more numbers turn black one by one


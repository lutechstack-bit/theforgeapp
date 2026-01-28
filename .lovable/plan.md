
# Complete Rewrite: Pixel-Perfect Dynamic Text Contrast

## The Real Problem

The current approach has TWO misaligned systems:
1. **Gold fill width**: Uses `progressPercent` (currently 70% with 9 days)
2. **Text color thresholds**: Uses fixed position estimates (28%, 48%, 68%, 88%)

These don't match because:
- The "City" section width varies by screen size (`sm:w-32 md:w-36`)
- The timer elements use flexbox with gaps, not fixed percentages
- The position estimates were guesses, not actual measurements

## New Approach: Tie Text Color Directly to Fill Position

Instead of calculating separate thresholds, we'll use a **single source of truth** - the `progressPercent` - and adjust the element positions to match what we actually want.

### Solution: Use Days Remaining to Control Both Fill AND Thresholds

Map the countdown directly to element positions:
- **30+ days**: 0% fill → All cream text
- **At each element's position**: That element turns black

The key insight: **Make the position thresholds match the visual fill based on days remaining.**

### New Calculation Logic

```typescript
// Calculate progress as percentage of 30-day window
// 30 days = 0%, 0 days = 100%
const daysRemaining = remaining / (1000 * 60 * 60 * 24);
const maxDays = 30;
const progress = ((maxDays - Math.min(daysRemaining, maxDays)) / maxDays) * 100;

// Define element positions to match visual layout
// These are calibrated so text changes color when fill reaches it
const positions = {
  city: 15,      // City section ends at ~15%
  days: 35,      // Days number center at ~35%
  sep1: 42,      // First separator
  hours: 50,     // Hours number center at ~50%
  sep2: 58,      // Second separator
  minutes: 68,   // Minutes number center at ~68%
  sep3: 78,      // Third separator
  seconds: 88,   // Seconds number center at ~88%
};

// Text turns black when progress passes its position
const daysPassed = progress >= positions.days;
const hoursPassed = progress >= positions.hours;
const minutesPassed = progress >= positions.minutes;
const secondsPassed = progress >= positions.seconds;
```

### Mapping Days to Visual Elements

| Days Remaining | Progress | Fill Ends At | Elements Covered |
|----------------|----------|--------------|------------------|
| 30+ | 0% | Nothing | None (all cream) |
| 20 | 33% | Before Days | City only black |
| 15 | 50% | At Hours | City, Days black |
| 10 | 67% | At Minutes | City, Days, Hours black |
| 9 | 70% | Past Minutes | City, Days, Hours, Min black |
| 5 | 83% | At Seconds | All except Sec black |
| 0 | 100% | End | All black |

### For Your Current State (9 days remaining)

```text
Progress = (30 - 9) / 30 × 100 = 70%

New Thresholds:
- City: 15% → PASSED (70 > 15) → BLACK
- Days: 35% → PASSED (70 > 35) → BLACK
- Hours: 50% → PASSED (70 > 50) → BLACK
- Minutes: 68% → PASSED (70 > 68) → BLACK
- Seconds: 88% → NOT PASSED (70 < 88) → CREAM ✓
```

## Technical Changes

### File: `src/components/home/CompactCountdownTimer.tsx`

1. **Update position thresholds** (lines 85-92) to better match the actual visual layout
2. **Recalibrate the City section threshold** to account for its fixed width
3. **Adjust timer element positions** based on flexbox distribution

**Key Changes:**
- Change `timerStartPercent` from 20 to 15 (City section is narrower)
- Recalculate element positions within the timer section
- Use more accurate position values that match the flex layout

## Files to Modify

| File | Change |
|------|--------|
| `src/components/home/CompactCountdownTimer.tsx` | Lines 83-104: Update position thresholds to match actual visual layout |

## Expected Result

With recalibrated thresholds:
- Gold fill at 70% will cover elements up to ~68% position (Minutes)
- Seconds at 88% will remain on dark background with cream text
- The visual transition will match exactly where the gold fill ends

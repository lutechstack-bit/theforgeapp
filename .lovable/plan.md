
# Fix Countdown Timer Text Color Contrast

## Problem
The countdown timer numbers are all showing in black text even when the right portion of the timer (seconds area) should show light/cream text on the dark background. This happens because:

1. The progress percentage calculation is based on a fixed 90-day duration, making it ~90% complete when 9 days remain
2. All threshold checks (`daysPassed`, `hoursPassed`, etc.) return `true` since 90% > all thresholds (30%, 45%, 60%, 75%)
3. Result: All numbers show `text-black` instead of transitioning based on the visual gold fill position

## Reference Behavior (from your 3rd screenshot)
- Numbers on the **gold-filled area** (left) = dark/black text
- Numbers on the **dark unfilled area** (right) = white/cream text
- The transition follows the visual progress fill position

## Solution
Change the color logic to match the visual progress fill position rather than fixed percentage thresholds. The text color should be determined by whether the gold fill has visually reached each number's position.

## Technical Changes

### File: `src/components/home/CompactCountdownTimer.tsx`

**Current Logic (broken):**
```typescript
const daysPassed = progressPercent > 30;  // Fixed threshold
const hoursPassed = progressPercent > 45;
const minutesPassed = progressPercent > 60;
const secondsPassed = progressPercent > 75;
```

**Fixed Logic:**
Calculate the visual position of each element and compare against the progress fill width.

**Implementation approach:**
1. Remove the fixed percentage thresholds
2. Calculate approximate visual positions for each timer element within the container:
   - City section: 0-20% of container width
   - Days: ~25-35%
   - Hours: ~40-55%
   - Minutes: ~60-75%
   - Seconds: ~80-95%

3. Update `isPassed` for each element based on whether `progressPercent` has reached that element's position

**New calculation:**
```typescript
// Visual position estimates for each element (as % of container width)
// The timer section starts at ~20% (after the "See you in" section)
const timerStartPercent = 20;
const timerWidth = 80; // Timer takes up ~80% of remaining space

// Each unit occupies roughly equal space in the timer section
const daysPosition = timerStartPercent + (timerWidth * 0.1);   // ~28%
const hoursPosition = timerStartPercent + (timerWidth * 0.35); // ~48%
const minutesPosition = timerStartPercent + (timerWidth * 0.6); // ~68%
const secondsPosition = timerStartPercent + (timerWidth * 0.85); // ~88%

const cityPassed = progressPercent > 10;
const daysPassed = progressPercent > daysPosition;
const hoursPassed = progressPercent > hoursPosition;
const minutesPassed = progressPercent > minutesPosition;
const secondsPassed = progressPercent > secondsPosition;
```

4. Ensure the progress gradient fill width matches the visual layout

## Expected Result
- When progress is at ~90%, the gold fill covers most of the timer
- Seconds area (at ~88% position) may still be on dark background with cream text
- As the Forge date approaches (higher progress %), more sections show black text on gold
- When looking at the timer, text color matches what's visually behind it

## Files to Modify
| File | Change |
|------|--------|
| `src/components/home/CompactCountdownTimer.tsx` | Update threshold calculations to match visual element positions |

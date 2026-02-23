

# Journey Summary Card: Show Day Title Instead of "Day X/Y"

## What Changes

Update the Journey card in `RoadmapSummaryCards.tsx` to remove the "Day 1/6" label entirely and instead show:

1. **Main text**: The current day's title in bold (e.g., "Direction & Storytelling")
2. **Subtitle**: Formatted date and time from `currentDay.date` and `currentDay.session_start_time` (e.g., "Feb 11 at 08:00 AM")
3. **Progress**: Replace dot indicators with a segmented progress bar (small horizontal bars -- colored for completed/current, muted for upcoming)

If no current day exists, fall back to showing a generic "Journey" label.

## File Modified

| File | Change |
|------|--------|
| `src/components/roadmap/RoadmapSummaryCards.tsx` | Rewrite Journey card content section (lines 50-74) |

## Technical Details

The Journey card content replaces:
- `journeyDayLabel` ("Day 1/6") removed entirely
- `currentDay.title` becomes the bold heading
- `currentDay.date` formatted with `date-fns` format as subtitle, plus `currentDay.session_start_time` if available
- Dot progress replaced with segmented bars: `h-1.5 flex-1 rounded-full` per bootcamp day, colored by status


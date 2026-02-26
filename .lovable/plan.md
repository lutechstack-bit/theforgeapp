

# Replace Numbered Schedule Items With Activity Icons

## Problem
The `SessionDetailCard` (the outside card on homepage) shows schedule items with numbered circles (1, 2, 3). The `DayDetailModal` (opened via "View full details") shows the same items with contextual icons (coffee cup for breakfast, utensils for lunch, etc.). You want the outside card to match the modal's icon approach.

## Change

**File: `src/components/home/SessionDetailCard.tsx`** (lines 96-113)

- Import `getScheduleIcon` from `@/lib/roadmapIcons`
- Replace the numbered circle (`<span>{idx + 1}</span>`) with `getScheduleIcon(item.activity, 'sm')` — same function already used in the `DayDetailModal`
- Remove the `{item.time}:` prefix text, show just the activity name (matching the modal's cleaner look)
- Keep the same layout structure (icon + text in a row)


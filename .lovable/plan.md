

# Fix Community Sessions: Click Action + Rename

## Two Issues

1. **Cards not clickable**: The `LevelUpCourseCard` in the community sessions section has no click handler — clicking does nothing. The fix is to add an `onClick` wrapper that navigates to `/learn/{id}`, the same as other course cards.

2. **Wrong label**: The section title says "Online Sessions" but should say "Community Sessions".

## Files Changed

| File | Change |
|---|---|
| `src/pages/Learn.tsx` (line 192) | Rename "Online Sessions" → "Community Sessions" |
| `src/pages/Learn.tsx` (line 197) | Add `onClick={() => handleCardClick(session)}` to the wrapper `<div>` around each `LevelUpCourseCard` |

## Technical Details

Both changes are in the same block (lines 191-200). The wrapper div gets a click handler that calls the existing `handleCardClick` function, which navigates to `/learn/${content.id}` — the course detail page. The `LevelUpCourseCard` component itself needs a `cursor-pointer` style which it already has, so the click will bubble up from the card to the wrapper div.


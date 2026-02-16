

# Fix Proficiency Grid Label Overflow

## Problem
The skill labels ("Screenwriting", "Cinematography") are overflowing into the first radio button column because the label column uses `minmax(80px, 1fr)` -- giving it the same width as each radio button column. Longer labels like "Cinematography" (14 characters) need more space.

## Fix

### ProficiencyGrid.tsx
Change the grid template so the label column gets proportionally more space:

- **Current**: `minmax(80px, 1fr) repeat(5, 1fr)` -- label gets 1/6 of the width
- **New**: `minmax(110px, 1.5fr) repeat(5, 1fr)` -- label gets ~1.4x the space of each radio column

This gives "Cinematography" enough room without requiring horizontal scroll. The radio columns will be slightly narrower but still have plenty of space for the 24-28px buttons.

Apply to both the header row (line 32) and skill rows (line 52).

## Files Changed

| File | Change |
|------|--------|
| `src/components/onboarding/ProficiencyGrid.tsx` | Update grid template columns from `minmax(80px, 1fr)` to `minmax(110px, 1.5fr)` on lines 32 and 52 |

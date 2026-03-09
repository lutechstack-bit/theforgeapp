

# Duration Picker with Arrow Controls

## Change

Replace the single text input for duration (lines 561-587 in `AdminLearn.tsx`) with a three-field picker showing **Hours**, **Minutes**, and **Seconds** side by side, each with up/down arrow buttons.

### File: `src/pages/admin/AdminLearn.tsx` (lines 561-587)

Replace the current duration input block with:

- Three inline segments: **H**, **M**, **S** — each with a numeric input and `ChevronUp` / `ChevronDown` buttons
- Derive `h`, `m`, `s` from `form.duration_minutes * 60` (total seconds)
- Each arrow click increments/decrements by 1, clamped: hours 0–60, minutes 0–59, seconds 0–59
- On any change, recompute `totalMins = h * 60 + m + (s >= 30 ? 1 : 0)` and update `form.duration_minutes`
- Styled compactly to fit in the existing grid column with labels "H", "M", "S" below each segment
- Import `ChevronUp`, `ChevronDown` from `lucide-react` (likely already imported)

Visual layout per segment:
```text
  [▲]
 [ 05 ]
  [▼]
   M
```

All three segments sit horizontally under the "Duration" label.



## Goal (match your reference exactly)
Make the countdown bar behave like the reference image:

- The bar has **two background colors** (filled vs remaining).
- **Only the number that the progress edge crosses** becomes split-color.
- Numbers fully on one side stay **one solid color** (no “every digit is half/half”).

## What’s wrong with the current implementation
Right now `SplitText` applies `clip-path` **inside each number’s own box**:

- `clipPath: inset(... ${progressPercent}%)` uses percentages relative to *that text element’s width*.
- So every number is split at the same “% of itself”, which is why all numbers look half/half.

That’s not how the reference works. The split must be based on the **global progress edge position across the whole bar**.

## Correct approach (global clip, not per-number clip)
Render the countdown content **twice**, perfectly overlapping:

1) **Layer A (Fill side)**  
   - Text color for filled side (e.g., white)
   - Clip to show only the filled region: **0% → progress%**

2) **Layer B (Remaining side)**  
   - Text color for remaining side (e.g., dark)
   - Clip to show only the remaining region: **progress% → 100%**

Because both layers are clipped using the **full bar width**, only the text that crosses the progress edge will appear split.

### Visual logic (global)
```text
Full bar width (100%)
|<------ filled (progress%) ------>|<------ remaining ------>|
| white text layer visible         | hidden                  |
| hidden                           | dark text layer visible |
```

## Implementation details (what I will change)

### File to update
- `src/components/home/CompactCountdownTimer.tsx`

### 1) Remove per-element SplitText
- Delete `SplitText`, and remove `progressPercent` props from `TimeUnit` + `Separator`.
- `TimeUnit` becomes a simple “value + label” renderer with normal text classes.

### 2) Introduce a single “content renderer” used by both layers
Create a small internal component (same file), e.g.:

- `CountdownContent({ tone, showBorders })`
  - `tone="fill"` → text classes for filled side (e.g., `text-white`, labels `text-white/70`)
  - `tone="base"` → text classes for remaining side (e.g., `text-black`, labels `text-black/70`)
  - `showBorders` to prevent doubled borders (only one layer draws borders)

This ensures both layers have identical layout so they align pixel-perfectly.

### 3) Make the bar backgrounds match the reference (using Forge palette)
To match the reference behavior (dark filled area + light remaining area):

- Base background: `bg-forge-cream` (light)
- Filled background overlay: `bg-forge-charcoal` (dark) with width = progress%

(We keep your gold border/glow so it still feels like Forge.)

### 4) Clip the TWO content layers globally using the same progress value
Use one source of truth for progress via a CSS variable so the fill width and both clip-paths never drift:

- On the outer wrapper set: `style={{ ['--p' as any]: `${progressPercent}%` }}`

Then:

- Filled text layer clip:
  - `clip-path: inset(0 calc(100% - var(--p)) 0 0)`
- Remaining text layer clip:
  - `clip-path: inset(0 0 0 var(--p))`

### 5) Layer order (important)
- Background base (cream)
- Filled background (charcoal) with width `var(--p)`
- Remaining text layer (dark text) clipped to remaining region
- Filled text layer (white text) clipped to filled region (overlay)

Only the overlay (filled) layer gets `pointer-events-none`. The “base” layer remains the main DOM copy.

### 6) Optional: crisp progress edge line (like the screenshot)
Add a 1px vertical divider on top at the progress edge:
- `left: var(--p)` with a subtle translucent line

This makes the split edge feel intentional and “exactly like” the reference.

## Why this will finally match the reference
- The split is now computed against the **whole bar**, not each number.
- Therefore:
  - Numbers fully inside filled area are 100% white.
  - Numbers fully inside remaining area are 100% dark.
  - Only the number intersected by the progress edge shows a split mid-digit.

## Testing checklist (what you should verify after I implement)
1) Resize desktop ↔ mobile: only one number (near the edge) should split.
2) Try a few progress values:
   - 10%: split happens near the left, most numbers dark
   - 50%: split near the middle
   - 90%: split near the right, most numbers white
3) Confirm no “double border” (if you see thicker borders, we’ll ensure only one layer draws borders).

## Notes / safety
- This approach is stable with flex layouts and responsive gaps, because it doesn’t rely on guessed positions.
- It’s also deterministic: clip is tied to the same progress value used by the fill.


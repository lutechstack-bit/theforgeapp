

# Differentiate Forge vs LevelUp Sections on Learn Page

## Approach
Instead of a hard divider line, use a **background color shift** and a **full-width "More from LevelUp" banner header** to create a natural visual break. The Forge sections stay on the default dark background, and the LevelUp sections sit inside a slightly different-toned container that feels like a new "zone" on the page.

## What Changes

### Forge Zone (top -- no changes needed)
Upcoming Sessions, Continue Watching, and Pre Forge Sessions stay as-is on the default `bg-background` (pure black). They already feel cohesive.

### LevelUp Zone (bottom -- wrapped in a tinted container)
Starting from "More from LevelUp" downward (including Masterclasses and Explore Programs):
- Wrap in a full-bleed container with a subtle warm-neutral background (`bg-white/[0.03]`) and rounded top corners
- Add top padding with a small **"More from LevelUp"** branded header strip -- a compact row with the LevelUp name in a slightly different typographic style (uppercase tracking-wide, muted color) to signal a context switch
- This replaces the current "More from LevelUp" section title -- the branded strip becomes the zone header, and the carousel title changes to just the content description

### Visual Result
```text
[Default black background]
  Learn (page header)
  Upcoming Online Sessions
  Continue Watching
  Pre Forge Sessions

[Subtle lighter background zone with rounded top]
  ── MORE FROM LEVELUP ──────────────
  Online Sessions (carousel)
  Learn from the Best (masterclasses)
  Explore Programs (banners)
```

No divider lines. The background shift + branded header naturally creates two distinct zones.

## Technical Details

### File: `src/pages/Learn.tsx`

1. Move the "More from LevelUp" carousel, "Learn from the Best", and "Explore Programs" sections into a new wrapper `div` with classes:
   - `bg-white/[0.03] -mx-4 sm:-mx-5 px-4 sm:px-5 pt-8 pb-4 rounded-t-3xl mt-4`
   - This creates a full-width tinted zone with rounded top corners

2. Add a zone header at the top of this wrapper:
   - A small row with "MORE FROM LEVELUP" text styled as `text-[11px] font-bold tracking-[0.2em] uppercase text-muted-foreground/60`
   - Optionally a thin gold accent line below it (`w-8 h-0.5 bg-primary/30 rounded-full mt-1`)

3. The existing "More from LevelUp" `CourseCarouselSection` title changes to just "Online Sessions" or "Community Sessions" since the zone header already says "LevelUp"

| File | Change |
|------|--------|
| `src/pages/Learn.tsx` | Wrap LevelUp sections in tinted container with branded zone header; adjust carousel title |


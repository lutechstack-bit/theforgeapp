
# Fix Profile Page: Font, Spacing, Overflow & Consistency Issues

## Problems Identified (from screenshots)

1. **Font mismatch**: The hero name uses `font-serif` (Cormorant Garamond) which clashes with the rest of the app that uses **OpenSauceOne** exclusively. The `font-mono` labels also look foreign.
2. **Overflow issues**: The bento grid uses `auto-rows-[80px]` with fixed row spans, causing content to overflow when tiles don't have enough vertical space (visible in Practice, Influences tiles).
3. **Excessive padding/spacing**: Tiles have tight `py-3 sm:py-4` padding that doesn't match the rest of the app's spacing conventions.
4. **Hero is too tall** (520px on desktop) with wasted empty space — the gradient backdrop dominates without enough content density.
5. **The `font-mono` micro-labels** (8px, tracking 2.5px) feel disconnected from the app's sans-serif design language.

## Plan

### 1. `src/components/profile/BentoProfileHero.tsx` — Fix fonts & reduce height
- Change hero name from `font-serif` to `font-sans` (OpenSauceOne) with `font-bold` weight
- Keep the last name in `text-primary` but remove `<em>` italic style
- Reduce hero height: `h-[320px] sm:h-[360px] lg:h-[400px]`
- Keep cinematic gradient, grain, and accent lines as-is (they look good)

### 2. `src/components/profile/BentoTile.tsx` — Fix label fonts & padding
- Change header labels from `font-mono text-[8.5px] tracking-[2.5px]` to `font-sans text-[10px] tracking-[1.5px] font-medium` — consistent with app's monospace-free design
- Increase body padding slightly for breathing room

### 3. `src/pages/Profile.tsx` — Fix grid overflow
- Change `auto-rows-[80px]` to `auto-rows-auto` so tiles size to their content naturally
- Remove fixed `row-span-*` from all tiles — let them flow as auto-height cards
- This eliminates ALL overflow issues since content determines tile height
- Keep the 12-column grid for side-by-side layout

### 4. All Bento Tile Components — Remove `row-span-*`, fix fonts
Update each tile to:
- Remove `row-span-3`, `row-span-4`, `row-span-2` classes (replaced by auto height)
- Change any `font-mono` usage inside tiles to `font-sans` with appropriate sizing
- Change any `font-serif` usage to `font-sans`
- Fix the MBTI tile: use `font-sans font-bold text-5xl` instead of `font-serif`
- Fix the About tile: use regular `font-sans text-sm` instead of `font-serif italic`

### 5. `src/components/profile/BentoMBTITile.tsx` — Consistent fonts
- MBTI type: `font-sans font-bold text-4xl sm:text-5xl text-primary` (no serif)

### 6. `src/components/profile/BentoAboutTile.tsx` — Consistent fonts
- Bio text: `text-sm text-muted-foreground leading-relaxed` (no serif/italic)

### Files changed:
- `src/pages/Profile.tsx` — grid fix (auto-rows-auto, remove row spans)
- `src/components/profile/BentoProfileHero.tsx` — font + height fix
- `src/components/profile/BentoTile.tsx` — header label font fix
- `src/components/profile/BentoAboutTile.tsx` — remove serif
- `src/components/profile/BentoMBTITile.tsx` — remove serif
- `src/components/profile/BentoGeneralTile.tsx` — remove font-mono labels
- `src/components/profile/BentoProficiencyTile.tsx` — remove font-mono
- `src/components/profile/BentoPracticeTile.tsx` — remove font-mono
- `src/components/profile/BentoInfluencesTile.tsx` — remove font-mono
- `src/components/profile/BentoPersonalTile.tsx` — remove font-mono
- `src/components/profile/BentoShareTile.tsx` — minor alignment fix

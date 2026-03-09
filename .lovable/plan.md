

# Bento Portfolio Profile Page Redesign

## Summary
Replace the current stacked glass-card Profile page with a cinematic hero + bento grid layout matching the reference design. All existing data hooks and modals stay unchanged — this is a pure UI rebuild.

## New Files (8 components)

### `src/components/profile/BentoProfileHero.tsx`
Cinematic hero section replacing `ProfileHero`:
- Layered radial gradient background with subtle `heroShift` animation (brightness/saturation pulse)
- SVG grain overlay (`mix-blend-mode: overlay`, 55% opacity)
- Two diagonal accent lines (gold, semi-transparent, rotated 18deg)
- Bottom fade gradient to `--background`
- Centered: avatar (110px, primary border, initials fallback with edit dot), full name in large serif italic, cohort label with animated pulse dot
- Props: `profile`, `edition`, `isOwner`, `onEdit`

### `src/components/profile/BentoTile.tsx`
Reusable tile wrapper:
- Props: `label: string`, `icon: string`, `className?: string`, `onEdit?: () => void`, `animationDelay?: number`, `children`
- Header: monospace uppercase label + icon + edit button
- Body: padded content area
- Hover: border glow transition (`border-primary/12` → `border-primary/25`)
- Staggered fade-in via `animation-delay` style prop

### `src/components/profile/BentoAboutTile.tsx`
- Serif italic bio display (`font-serif` via Google Fonts "Cormorant Garamond")
- Empty state: "Add a bio to tell your story..."
- Grid span: 8 cols, 3 rows

### `src/components/profile/BentoGeneralTile.tsx`
- Monospace labels (Certificate Name, Occupation, Instagram) from KY data
- Grid span: 4 cols, 3 rows

### `src/components/profile/BentoProficiencyTile.tsx`
- Animated gold gradient progress bars
- Maps levels: beginner→25%, intermediate→50%, advanced→75%
- FORGE: 4 skills (Screenwriting, Direction, Cinematography, Editing)
- FORGE_WRITING: 2 skills (Writing, Story & Voice)
- FORGE_CREATORS: uses same 4 as FORGE
- Grid span: 7 cols, 4 rows

### `src/components/profile/BentoMBTITile.tsx`
- Large serif MBTI type (e.g., "INFJ") with personality subtitle
- Grid span: 5 cols, 4 rows

### `src/components/profile/BentoPracticeTile.tsx`
- Writing types as pill chips (primary active state) for writers
- Emergency contact info rows below
- Grid span: 7 cols, 3 rows

### `src/components/profile/BentoInfluencesTile.tsx`
- Top 3 movies/writers as tag pills with 📖/🎬 prefix
- Chronotype display
- Grid span: 5 cols, 3 rows

## Modified Files

### `src/pages/Profile.tsx` — Full rewrite
Structure:
1. `<BentoProfileHero>` — full-width cinematic hero
2. **Action strip** — horizontal flex with two chips (KY Form status + Perks link), styled with `bg-card border-primary/12`
3. **Bento grid** — `grid grid-cols-12 auto-rows-[80px] gap-3.5` containing:
   - About (col-span-8, row-span-3)
   - General Details (col-span-4, row-span-3)
   - Proficiency (col-span-7, row-span-4)
   - MBTI (col-span-5, row-span-4)
   - Practice (col-span-7, row-span-3)
   - Influences (col-span-5, row-span-3)
   - Works (col-span-8, row-span-3) — reuses `WorksSection` content inside `BentoTile`
   - Badges (col-span-4, row-span-2) — reuses `CommunityBadges` logic inside `BentoTile`
   - Personal Details (col-span-5, row-span-2) — DOB, age, language from KY data
   - Share Portfolio (col-span-12, row-span-2) — reuses `SharePortfolio` logic inside `BentoTile`
4. Existing modals preserved: `ProfileEditSheet`, `AddWorkModal`, `AlertDialog`

**Responsive**: `md:grid-cols-8` for tablet, `grid-cols-1` for mobile with all tiles `col-span-full`. Hero height reduces on mobile.

### `src/index.css` — Add bento utilities
```css
/* Bento Profile Animations */
@keyframes heroShift {
  0% { filter: brightness(1) saturate(1); }
  100% { filter: brightness(1.08) saturate(1.15); }
}
@keyframes tileIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.bento-tile-animate {
  opacity: 0;
  animation: tileIn 0.45s ease forwards;
}
```

### `tailwind.config.ts` — Add serif font
Add `fontFamily.serif: ['Cormorant Garamond', 'serif']` to theme.extend, and import the Google Font in `index.html`.

### `index.html` — Add Google Font link
```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&display=swap" rel="stylesheet">
```

### `src/components/profile/index.ts` — Update exports
Add all new Bento components to barrel exports.

## Design Tokens Mapping
Reference gold/black maps to existing theme:
- `var(--gold)` → `text-primary`, `border-primary`
- `var(--surface)` → `bg-card`
- `var(--border)` → `border-primary/12` (default), `border-primary/25` (hover)
- `var(--text)` → `text-foreground`
- `var(--text-dim)` → `text-muted-foreground`
- Grain, gradients, accent lines use inline styles

## What stays unchanged
- All data hooks (`useAuth`, `useProfileData`, `useUserWorks`, `usePublicPortfolio`)
- `ProfileEditSheet` — edit buttons on each tile open it with `scrollToSection` param
- `AddWorkModal`, `AlertDialog` for work CRUD
- `PrintableProfile` for PDF download


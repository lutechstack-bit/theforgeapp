

# Add Amber Glow Border to All Learn Section Cards

## What Changes

Apply the same amber `#FFBF00` glow border effect (currently on ProgramBanners) to all card types across the Learn page and the Alumni Showcase on Home:

1. **Pre Forge Session cards** (`LearnCourseCard` — both landscape and portrait layouts)
2. **LevelUp Community Session cards** (`LevelUpCourseCard`)
3. **Masterclass cards** (`MasterclassCard`)
4. **Alumni Showcase cards** (`AlumniShowcaseSection`)

## Approach

Each card gets a wrapper `div` (or updated outer element) with:
- `rounded-2xl p-[1.5px]` (thin border)
- Default: `border` is subtle — `from-[#FFBF00]/15 via-[#FFBF00]/5 to-[#FFBF00]/15`
- **On hover**: brightens to `from-[#FFBF00]/50 via-[#FFBF00]/25 to-[#FFBF00]/50` with `shadow-[0_0_20px_rgba(255,191,0,0.3)]`
- `transition-all duration-300`

The inner content uses `rounded-[13px] overflow-hidden` to nest cleanly inside the border.

```text
Normal state:          Hover state:
┌─ faint amber ──┐     ┌─ bright amber ─┐
│ ┌────────────┐ │     │ ┌────────────┐ │
│ │  card img  │ │     │ │  card img  │ │
│ └────────────┘ │     │ └────────────┘ │
└────────────────┘     └───✧ glow ✧────┘
```

## Files Changed

| File | Change |
|---|---|
| `src/components/learn/LearnCourseCard.tsx` | Wrap both landscape and portrait card containers in amber glow border div; remove old `border-border/30` |
| `src/components/learn/LevelUpCourseCard.tsx` | Wrap the card div in amber glow border div |
| `src/components/learn/MasterclassCard.tsx` | Wrap the outer card div in amber glow border div; remove old shadow classes |
| `src/components/home/AlumniShowcaseSection.tsx` | Wrap each alumni film card in amber glow border div |

## Technical Detail

### LearnCourseCard (landscape mode, lines 47-58)
- Wrap the outer `div` in a new glow container: `rounded-2xl p-[1.5px] bg-gradient-to-r from-[#FFBF00]/15 via-[#FFBF00]/5 to-[#FFBF00]/15 hover:from-[#FFBF00]/50 hover:via-[#FFBF00]/25 hover:to-[#FFBF00]/50 hover:shadow-[0_0_20px_rgba(255,191,0,0.3)] transition-all duration-300`
- Inner image container: change `rounded-2xl` to `rounded-[13px]`, remove `border border-border/30 group-hover:border-primary/30`

### LearnCourseCard (portrait mode, lines 64-94)
- Same glow wrapper around the outer `div`
- Inner thumbnail div: change `rounded-xl` to `rounded-[11px]`, remove `border border-border/30 group-hover:border-primary/30`

### LevelUpCourseCard (lines 9-17)
- Wrap the card div in glow container
- Inner div: change `rounded-2xl` to `rounded-[13px]`

### MasterclassCard (lines 22-45)
- Wrap the outer div in glow container
- Remove existing `shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-primary/10` (replaced by amber glow)
- Inner div: change `rounded-2xl` to `rounded-[13px]`

### AlumniShowcaseSection (lines 75-109)
- Wrap each card div in glow container
- Inner `aspect-video` div: change `rounded-xl` to `rounded-[11px]`

No database or backend changes needed.


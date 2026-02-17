

# Retheme to Strict Greyscale Color System

## Overview
Theme-only change to `src/index.css` CSS variables. Zero layout, spacing, typography, component structure, or logic changes. All color tokens remapped to a strict 8-value greyscale palette with zero accent colors.

## Palette

| Hex | HSL | Role |
|-----|-----|------|
| #000000 | 0 0% 0% | App shell, darkest surfaces |
| #1A1A1A | 0 0% 10% | Primary backgrounds |
| #2E2E2E | 0 0% 18% | Elevated surfaces, cards, sidebars, modals |
| #5C5C5C | 0 0% 36% | Secondary text, icons, inactive/disabled states |
| #8A8A8A | 0 0% 54% | Placeholders, dividers, borders |
| #D4D4D4 | 0 0% 83% | Input fields, disabled backgrounds, subtle surfaces |
| #F0F0F0 | 0 0% 94% | Section backgrounds, alternate rows |
| #FFFFFF | 0 0% 100% | Primary text, high-contrast labels |

## Variable Remapping

```text
--background:            0 0% 10%      (#1A1A1A — primary bg)
--foreground:            0 0% 100%     (#FFFFFF — primary text)

--card:                  0 0% 18%      (#2E2E2E — elevated card)
--card-foreground:       0 0% 100%     (#FFFFFF)

--popover:               0 0% 18%      (#2E2E2E — modals/drawers)
--popover-foreground:    0 0% 100%

--primary:               0 0% 100%     (#FFFFFF — primary buttons: white bg)
--primary-foreground:    0 0% 0%       (#000000 — black text on white btn)

--secondary:             0 0% 18%      (#2E2E2E — secondary btn bg)
--secondary-foreground:  0 0% 100%     (#FFFFFF)

--muted:                 0 0% 18%      (#2E2E2E)
--muted-foreground:      0 0% 54%      (#8A8A8A — placeholder/disabled)

--accent:                0 0% 94%      (#F0F0F0 — subtle highlight)
--accent-foreground:     0 0% 0%       (#000000)

--destructive:           0 0% 36%      (#5C5C5C — greyscale error, no red)
--destructive-foreground:0 0% 100%

--border:                0 0% 54%/0.3  (#8A8A8A at low opacity)
--input:                 0 0% 83%      (#D4D4D4 — input bg)
--ring:                  0 0% 100%     (#FFFFFF — focus ring)

--forge-yellow:          0 0% 100%     (neutralized)
--forge-gold:            0 0% 100%     (neutralized)
--forge-orange:          0 0% 100%     (neutralized)
--forge-cream:           0 0% 94%      (#F0F0F0)
--forge-charcoal:        0 0% 0%

--glow-primary:          0 0% 100%
--glow-secondary:        0 0% 83%
--gradient-start:        0 0% 18%
--gradient-end:          0 0% 10%
--surface-elevated:      0 0% 18%     (#2E2E2E)
--surface-glass:         0 0% 10%     (#1A1A1A)

--shadow-glow:           0 0 40px hsl(0 0% 100% / 0.08)
--shadow-card:           0 4px 24px hsl(0 0% 0% / 0.5)
--shadow-elevated:       0 8px 32px hsl(0 0% 0% / 0.7)

--sidebar-background:    0 0% 0%      (#000000 — darkest)
--sidebar-foreground:    0 0% 100%
--sidebar-primary:       0 0% 100%    (#FFFFFF)
--sidebar-primary-foreground: 0 0% 0%
--sidebar-accent:        0 0% 18%     (#2E2E2E)
--sidebar-accent-foreground: 0 0% 94% (#F0F0F0)
--sidebar-border:        0 0% 18%
--sidebar-ring:          0 0% 100%
```

## Key Decisions
- **Zero accent colors**: All `forge-gold`, `forge-yellow`, `forge-orange` tokens neutralized to white/greyscale. No amber, no tints.
- **Destructive goes greyscale**: Red removed entirely per "zero tints" constraint. Destructive uses #5C5C5C to remain visually distinct via shade.
- **Primary buttons are white-on-black**: Strongest contrast pair in the palette, making CTAs clearly distinguishable.
- **Input fields use #D4D4D4**: Light grey background provides clear affordance for editable fields against dark card surfaces.
- **Focus ring is pure white 2px**: Maximum visibility for keyboard navigation, meeting WCAG requirements.
- **Border uses #8A8A8A at reduced opacity**: Subtle dividers that don't compete with content.
- **Glow/shadow effects neutralized**: Shadow-glow uses faint white instead of amber. Card and elevated shadows remain dark.

## Files Changed

| File | Change |
|------|--------|
| `src/index.css` | Remap all CSS custom properties in `:root` / `.theme-forge` block (lines 64-126) to strict greyscale values. Zero hue, zero saturation across every token. |

No other files need changes — all components consume these CSS variables via Tailwind.


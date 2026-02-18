

# Redesign Color System: Strict 60-30-10 Palette

## Overview
A theme-only change to `src/index.css` CSS variables. No layout, spacing, typography, component structure, or logic changes. Every color token is remapped to exactly 6 hex values.

## Palette Mapping

| Role | Hex | HSL | Usage |
|------|-----|-----|-------|
| Base (60%) | #000000 | 0 0% 0% | All backgrounds, app shell, modals, sidebars |
| Primary text | #FFFFFF | 0 0% 100% | Headings, high-contrast labels, foreground |
| Cards/inputs | #E5E5E5 | 0 0% 90% | Card surfaces as borders, input borders, dividers |
| Secondary text | #BDBDBD | 0 0% 74% | Secondary labels, muted foreground |
| Disabled text | #8A8A8A | 0 0% 54% | Tertiary/disabled text, placeholders |
| Accent (10%) | #FFBF00 | 45 100% 50% | CTAs, active tabs, focus rings, badges, links |

## Variable Remapping (in `:root`)

```text
--background:            0 0% 0%       (black)
--foreground:            0 0% 100%     (white)

--card:                  0 0% 5%       (near-black, slight elevation via shade)
--card-foreground:       0 0% 100%     (white)

--popover:               0 0% 5%       (same as card)
--popover-foreground:    0 0% 100%

--primary:               45 100% 50%   (FFBF00 accent)
--primary-foreground:    0 0% 0%       (black text on accent)

--secondary:             0 0% 8%       (dark surface)
--secondary-foreground:  0 0% 90%      (E5E5E5)

--muted:                 0 0% 10%      (dark muted bg)
--muted-foreground:      0 0% 54%      (8A8A8A disabled grey)

--accent:                45 100% 50%   (FFBF00)
--accent-foreground:     0 0% 0%

--destructive:           0 75% 55%     (keep red for errors - functional necessity)
--destructive-foreground:0 0% 100%

--border:                0 0% 15%      (subtle dark border)
--input:                 0 0% 8%       (dark input bg)
--ring:                  45 100% 50%   (accent ring)

--forge-yellow:          45 100% 50%   (FFBF00)
--forge-gold:            45 100% 50%   (FFBF00, unified)
--forge-orange:          45 100% 50%   (FFBF00, unified)
--forge-cream:           0 0% 100%     (white replaces cream)
--forge-charcoal:        0 0% 0%

--glow-primary:          45 100% 50%
--glow-secondary:        45 100% 50%
--gradient-start:        45 100% 50%
--gradient-end:          45 100% 40%   (slightly darker amber for gradient depth)

--surface-elevated:      0 0% 8%
--surface-glass:         0 0% 5%

--shadow-glow:           0 0 40px hsl(45 100% 50% / 0.2)
--shadow-card:           0 4px 24px hsl(0 0% 0% / 0.5)
--shadow-elevated:       0 8px 32px hsl(0 0% 0% / 0.7)

--sidebar-background:    0 0% 2%
--sidebar-foreground:    0 0% 100%
--sidebar-primary:       45 100% 50%
--sidebar-primary-foreground: 0 0% 0%
--sidebar-accent:        0 0% 8%
--sidebar-accent-foreground: 0 0% 90%
--sidebar-border:        0 0% 12%
--sidebar-ring:          45 100% 50%
```

## Key Decisions
- **Destructive red preserved**: Error/destructive states (#DC4545-ish) are a functional necessity for accessibility -- not a decorative color. Users need to distinguish errors from normal UI.
- **Card bg stays 0 0% 5%**: Pure black cards on pure black background would be invisible. 5% grey gives elevation without introducing a new color.
- **Forge tokens unified**: `forge-gold`, `forge-orange`, and `forge-yellow` all map to #FFBF00 since only one accent is allowed.
- **Gradient-end at 40% lightness**: Provides subtle depth in gradients while staying within the amber family.

## Files Changed

| File | Change |
|------|--------|
| `src/index.css` | Remap all CSS custom properties in `:root` block (lines 63-130) to use the strict 6-value palette. Update shadow values to reference new accent HSL. |

No other files need changes -- all components consume these CSS variables via Tailwind.

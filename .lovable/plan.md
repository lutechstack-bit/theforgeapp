

# Add Amber Glow Borders to Program Banners

## What Changes

All three program banners in the "Explore Programs" section will get an amber/yellow gradient glow border that brightens on hover. Since all three use the `imageUrl` code path, the change is in the image-mode `<a>` wrapper.

## Approach

Use a wrapper `div` with an amber gradient background and `p-[2px]` to create a glowing border effect. Apply `shadow-[0_0_15px_rgba(255,191,0,0.3)]` for ambient glow, increasing to `shadow-[0_0_25px_rgba(255,191,0,0.5)]` on hover. The inner content keeps `rounded-2xl overflow-hidden` so the image sits cleanly inside the glowing frame.

```text
┌─ amber gradient border (2px) ──────────┐
│ ┌─ image ────────────────────────────┐ │
│ │                                    │ │
│ │      [banner image]                │ │
│ │                                    │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
  ~~~ amber glow shadow underneath ~~~
```

## File Changed

| File | Change |
|---|---|
| `src/components/learn/ProgramBanner.tsx` (lines 23-37) | Wrap the `<a>` tag in a glow container `div` with amber gradient border and hover-brightened shadow |

## Technical Detail

The image-mode return block (lines 23-37) changes to:

```tsx
<div className="group rounded-2xl p-[2px] bg-gradient-to-r from-[#FFBF00]/40 via-[#FFBF00]/20 to-[#FFBF00]/40 shadow-[0_0_15px_rgba(255,191,0,0.2)] hover:shadow-[0_0_25px_rgba(255,191,0,0.45)] hover:from-[#FFBF00]/60 hover:via-[#FFBF00]/35 hover:to-[#FFBF00]/60 transition-all duration-300">
  <a
    href={ctaUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="block w-full rounded-[14px] overflow-hidden aspect-[1280/465] active:scale-[0.99]"
  >
    <img ... />
  </a>
</div>
```

The same glow treatment is also applied to the gradient-fallback mode (lines 44-64) for consistency, wrapping the existing `div` in the same glow container.

Uses the palette accent color `#FFBF00` at varying opacities for the gradient border and shadow glow.


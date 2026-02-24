

# Make the App Responsive Across All Screen Sizes

## Problem

On larger displays (1440px+, ultrawide), content is constrained to narrow max-widths (`max-w-3xl` = 768px, `max-w-5xl` = 1024px), leaving large empty margins on both sides. The app needs to scale gracefully from mobile (320px) to large desktops (1920px+).

## Strategy

Upgrade the max-width tier for each page type so content fills more of the available space on large screens, while keeping the single-column reading experience intact on medium screens. Use responsive max-width classes so pages stay narrow on tablets but expand on desktops.

**Tier system:**
- **Reading/feed pages** (Home, Profile, Updates, Perks): `max-w-3xl` → `max-w-3xl lg:max-w-5xl xl:max-w-6xl`
- **Grid/browse pages** (Learn, Events, Community): `max-w-5xl` → `max-w-5xl lg:max-w-6xl xl:max-w-7xl`
- **Roadmap layout**: `max-w-3xl` → `max-w-3xl lg:max-w-5xl xl:max-w-6xl`
- **Event Detail**: `max-w-5xl` → `max-w-5xl lg:max-w-6xl`

On larger screens, some sections can also adopt multi-column grids (e.g., Batchmates, Alumni Showcase, Travel & Stay cards) to use the extra width meaningfully instead of just stretching single-column cards.

## Files Changed

| File | Change |
|---|---|
| `src/pages/Home.tsx` | `max-w-3xl` → `max-w-3xl lg:max-w-5xl xl:max-w-6xl` on the main content wrapper |
| `src/pages/Profile.tsx` | `max-w-3xl` → `max-w-3xl lg:max-w-5xl xl:max-w-6xl` on both the skeleton and main wrapper |
| `src/pages/Updates.tsx` | `max-w-3xl` → `max-w-3xl lg:max-w-5xl xl:max-w-6xl` |
| `src/pages/Perks.tsx` | `max-w-4xl` → `max-w-4xl lg:max-w-5xl xl:max-w-6xl` |
| `src/pages/Learn.tsx` | `max-w-5xl` → `max-w-5xl lg:max-w-6xl xl:max-w-7xl` |
| `src/pages/Events.tsx` | `max-w-5xl` → `max-w-5xl lg:max-w-6xl xl:max-w-7xl` |
| `src/pages/EventDetail.tsx` | `max-w-5xl` → `max-w-5xl lg:max-w-6xl` (3 occurrences) |
| `src/pages/Community.tsx` | Add responsive max-width if currently unconstrained, or widen existing |
| `src/components/roadmap/RoadmapLayout.tsx` | `max-w-3xl` → `max-w-3xl lg:max-w-5xl xl:max-w-6xl` |
| `src/pages/PublicPortfolio.tsx` | `max-w-3xl` → `max-w-3xl lg:max-w-5xl` (3 occurrences: header, main, footer) |

## Technical Details

- All changes are CSS class updates only -- no structural or logic changes
- The responsive approach (`lg:max-w-5xl xl:max-w-6xl`) means mobile and tablet layouts stay exactly as they are today; only screens ≥1024px and ≥1280px get wider content
- Horizontal card carousels (Learn, Alumni Showcase) automatically benefit from wider containers since they get more visible cards
- The SideNav offset (`md:ml-64` / `md:ml-[72px]`) in `AppLayout.tsx` remains unchanged -- the wider max-widths work within the remaining space after the sidebar


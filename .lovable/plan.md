

# Move Hero Carousel to Top with Profile Overlay

## What Changes

### 1. Home page layout reorder (`src/pages/Home.tsx`)
- Remove the "Hey {firstName}" greeting block (or move it below the carousel as a small inline text)
- Move `<HeroBanner />` to be the **first element** in the page, before countdown
- Place `<CompactCountdownTimer />` **after** the hero banner

### 2. Hero Banner full-width styling (`src/components/home/HeroBanner.tsx`)
- Remove `rounded-2xl` so it stretches edge-to-edge within the content area
- Use negative margins (`-mx-4 sm:-mx-6 md:-mx-8`) to break out of the page container padding, making it feel "full bleed"
- Optionally reduce aspect ratio slightly for a more cinematic top banner feel

### 3. Profile overlay on carousel (`src/components/layout/AppLayout.tsx` + `src/pages/Home.tsx`)
- On the **Home route only**, make the sticky top bar transparent/overlay so the profile button sits on top of the carousel image
- Add a route check: when on `/`, render the TopProfileDropdown with `absolute` positioning and transparent background instead of the solid background bar
- This gives the effect of the profile avatar floating over the hero image

### Files to change

| File | Change |
|------|--------|
| `src/pages/Home.tsx` | Reorder: HeroBanner first → CountdownTimer → rest. Remove "Hey {firstName}" block. |
| `src/components/home/HeroBanner.tsx` | Remove rounded corners, add negative margins for full-bleed look. |
| `src/components/layout/AppLayout.tsx` | On home route (`/`), make the top profile bar transparent/absolute so it overlays the carousel. |


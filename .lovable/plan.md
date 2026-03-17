

# Hero Banner Section with Autoplay Image Slideshow

## What we're building
A cinematic hero banner placed directly below the countdown timer, featuring:
- Background images cycling in autoplay with crossfade transitions
- Dark overlay with centered text: "Welcome to **the Forge**" where "the Forge" has an animated amber gradient (like the "Immersive" reference)
- A "Start your Journey" CTA that smooth-scrolls to the Journey section
- Images managed from the backend via a new `homepage_hero_slides` table
- Recommended image size: **1920x800px** (landscape, 2.4:1 aspect ratio)

## Database

**New table: `homepage_hero_slides`**
```sql
create table public.homepage_hero_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  order_index integer default 0,
  is_active boolean default true,
  cohort_type text default 'FORGE',
  created_at timestamptz default now()
);
alter table public.homepage_hero_slides enable row level security;
create policy "Anyone can read active slides" on public.homepage_hero_slides for select using (true);
```

Seed 3-4 sample placeholder images (use Unsplash URLs or existing `/public/images/levelup/` images as placeholders).

## New Components

### `src/components/home/HeroBanner.tsx`
- Fetches slides from `homepage_hero_slides` table (filtered by cohort, ordered by `order_index`)
- Uses a `useState` index that auto-increments every ~5s
- Images rendered as absolute-positioned `<img>` tags with crossfade via opacity transitions
- Dark gradient overlay (bottom-heavy) for text legibility
- Text block centered: "Welcome to" in white, "the Forge" with animated gradient text
- The gradient animation: a `background-size: 200%` amber-to-gold linear gradient with `background-position` animating left-to-right infinitely
- "Start your Journey" button styled with amber accent, on click scrolls to `#journey-section`
- Aspect ratio: roughly 2.4:1 on desktop, taller (16:9) on mobile
- Falls back to sample images if no DB data

## Home.tsx Changes
- Import `HeroBanner`
- Add `id="journey-section"` to the Journey Timeline wrapper
- Insert `<HeroBanner />` between the countdown timer and onboarding steps
- Register a new `homepage_sections` entry with key `hero_banner` (or just render it always for now)

## File Changes

| File | Change |
|------|--------|
| `src/components/home/HeroBanner.tsx` | New — hero banner with autoplay slideshow + animated gradient text |
| `src/pages/Home.tsx` | Add HeroBanner below timer, add `id="journey-section"` to journey section |
| Migration | New `homepage_hero_slides` table with sample data |

## Gradient Text Animation (CSS)
```css
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```
Applied via Tailwind arbitrary values or added to `index.css`.


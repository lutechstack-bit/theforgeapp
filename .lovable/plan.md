

# Alumni Showcase: Seed Data + Minimalistic Redesign

## Summary
Seed the `alumni_showcase` table with Writing (4 book covers) and Creators (4 Vimeo reels) content, redesign the card component to be minimalistic (no overlay text), add Vimeo embed support, and ensure the cohort simulator drives the query so admins can test all three views.

## Changes

### 1. Copy uploaded book cover images
Save the 4 uploaded images to `public/images/alumni/`:
- `Ishwariya_1.png`, `Neelima_1.png`, `Sunny_1.png`, `Yuvraj_1.png`

### 2. Seed database with 8 rows
Insert into `alumni_showcase`:

**Writing (media_type='image'):**
- "Ocean Eyes, Starry Skies" by Ishwariya — thumbnail: `/images/alumni/Ishwariya_1.png`, redirect: Amazon link
- Book by Neelima — thumbnail: `/images/alumni/Neelima_1.png`
- Book by Sunny — thumbnail: `/images/alumni/Sunny_1.png`
- Book by Yuvraj — thumbnail: `/images/alumni/Yuvraj_1.png`

**Creators (media_type='reel'):**
- "The Joy of Being" — media_url: `https://player.vimeo.com/video/1173914736`
- "Bhringraj Hair Oil" — media_url: `https://player.vimeo.com/video/1173914672`
- "Project Goa" — media_url: `https://player.vimeo.com/video/1173914637`
- "Vaksana Farms" — media_url: `https://player.vimeo.com/video/1173914704`

### 3. Redesign `AlumniShowcaseSection.tsx`
- **Remove** dark vignette gradient overlay and overlay text from cards
- **Place** title + author **below** the card image as clean text
- **Add Vimeo support** to `getEmbedUrl` — detect `vimeo.com` URLs and append `?autoplay=1`
- **Vertical video dialog** for Creators reels — use `aspect-[9/16] max-h-[80vh]` instead of `aspect-video`
- **Writing click** — open `redirect_url` in new tab, or lightbox if none
- **Play icon** — subtle centered play button only for video/reel types, no overlay gradient
- Clean rounded cards, subtle hover scale, mobile-responsive snap carousel

### 4. Cohort simulator compatibility
Already works: `Home.tsx` uses `useEffectiveCohort()` to get `effectiveCohortType`, which the alumni query filters on. When an admin switches cohort via the floating switcher, the query key `['alumni-showcase', userCohortType]` changes, triggering a refetch for the simulated cohort. No additional wiring needed.

## Files

| Action | File |
|--------|------|
| Copy | 4 images → `public/images/alumni/` |
| Migration | Insert 8 rows into `alumni_showcase` |
| Edit | `src/components/home/AlumniShowcaseSection.tsx` — minimalistic redesign + Vimeo support |


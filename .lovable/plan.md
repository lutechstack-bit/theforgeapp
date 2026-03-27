

# Forge App — MP4 Explainer / Marketing Video

## Concept
A 25-second cinematic motion graphics video showcasing Forge's core features: Community, Roadmap, Learn, Events, Perks, and Profile. Dark editorial aesthetic with the Forge amber/primary accent color. Designed for social media, onboarding emails, and landing page hero.

## Creative Direction
- **Aesthetic**: Cinematic Minimal — dark backgrounds (#1a1a1a), amber/gold primary accent, clean sans-serif typography
- **Motion**: Smooth spring-based reveals, wipe transitions between scenes, subtle parallax
- **Fonts**: Inter (body) + Playfair Display (hero headlines) via `@remotion/google-fonts`
- **Motifs**: Rounded card shapes echoing the app UI, golden glow accents, the Forge logo as a recurring anchor

## Scene Breakdown (~25s at 30fps = 750 frames)

| Scene | Duration | Content |
|-------|----------|---------|
| 1. Logo Reveal | 3s (90f) | Forge logo scales in with glow, tagline "Where Dreamers Become Doers" fades in |
| 2. Home & Journey | 4s (120f) | Mockup cards showing the home dashboard, journey timeline, progress tracking |
| 3. Roadmap & Prep | 4s (120f) | Day-by-day roadmap cards, equipment checklist, packing list visuals |
| 4. Community & Events | 4s (120f) | Chat bubbles, batchmate cards, event cards animate in |
| 5. Learn & Grow | 4s (120f) | Course cards, masterclass thumbnails, video player UI mockup |
| 6. Profile & Perks | 3s (90f) | Bento profile grid, perks cards with brand logos |
| 7. Closing CTA | 3s (90f) | "Your creative journey starts here" + Forge logo + LevelUp branding |

## Technical Plan

### Files to create (all under `remotion/`)
- `remotion/src/index.ts` — registerRoot entry
- `remotion/src/Root.tsx` — Composition registration (1920x1080, 30fps, 750 frames)
- `remotion/src/MainVideo.tsx` — TransitionSeries wiring all scenes
- `remotion/src/scenes/LogoReveal.tsx`
- `remotion/src/scenes/HomeJourney.tsx`
- `remotion/src/scenes/RoadmapPrep.tsx`
- `remotion/src/scenes/CommunityEvents.tsx`
- `remotion/src/scenes/LearnGrow.tsx`
- `remotion/src/scenes/ProfilePerks.tsx`
- `remotion/src/scenes/ClosingCTA.tsx`
- `remotion/src/components/MockCard.tsx` — Reusable animated card component
- `remotion/src/components/GlowBackground.tsx` — Persistent dark gradient + floating amber accents
- `remotion/scripts/render-remotion.mjs` — Programmatic render script
- `remotion/tsconfig.json`

### Assets
- Copy `forge-logo.png` and `levelup-logo-white.png` from `src/assets/` to `remotion/public/images/`

### Rendering
- Setup: `bun init`, install Remotion deps, fix compositor binary
- Render via programmatic script to `/mnt/documents/forge-explainer.mp4`
- QA via `bunx remotion still` at key frames

### No changes to the main webapp codebase


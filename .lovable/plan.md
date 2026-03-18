

# Add Cinematic Hero Banners to Network, Perks, and Learn Pages

Extend the cinematic hero treatment (from `RoadmapHero`) to three more pages using a shared reusable component.

## Changes

| File | Change |
|------|--------|
| `src/components/shared/CinematicHero.tsx` | **New** — Reusable hero with layered radial gradients, grain texture, geometric accent lines, icon glow ring. Props: `icon`, `title` (ReactNode for highlighting), `subtitle`, `badge?` |
| `src/pages/Learn.tsx` | Replace the plain `<h1>Learn</h1>` header (~line 153) with `<CinematicHero icon={BookOpen} title={<>Develop Your <span>Craft</span></>} subtitle="Sessions, masterclasses & more" badge="Learning" />` |
| `src/pages/Perks.tsx` | Replace the flat icon+text header (~line 25-33) with `<CinematicHero icon={Gift} title={<>Your <span>Perks</span></>} subtitle="We partner with the industry's best..." badge="Exclusive Access" />` |
| `src/components/community/CollaboratorDirectory.tsx` | Add `<CinematicHero icon={Users} title={<>Find Your <span>Collaborators</span></>} subtitle="Connect with creators who share your vision" badge="Creative Network" />` at the top of the directory |

The `CinematicHero` component will mirror `RoadmapHero`'s visual DNA: amber radial gradients, grain overlay, 4px primary left border, and a glowing icon — but in a compact, props-driven package.


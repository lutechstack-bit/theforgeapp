

# Redesign RoadmapHero — Cinematic Look

## Problem
The current hero is a plain card with basic text — looks flat and uninspiring, especially the POST_FORGE state ("Your The Forge Legacy").

## Design
Replace with a cinematic, full-width hero similar to the BentoProfileHero style:
- **Layered radial gradients** (amber/gold tones) with grain texture overlay
- **Geometric accent lines** for depth
- **Bottom fade** into the page background
- Taller height (~200px) with centered content
- Trophy icon with a subtle glow ring for POST_FORGE
- Star with pulse animation for DURING_FORGE
- Rocket with floating animation for PRE_FORGE
- Bigger, bolder typography with the cohort name using the primary accent color
- Fix the awkward "Your The Forge Legacy" text — just show `{cohortName} Legacy`

## Changes

| File | Change |
|------|--------|
| `src/components/roadmap/RoadmapHero.tsx` | Full redesign with layered gradients, grain overlay, geometric lines, larger typography, icon glow effects |

Single file change — no other dependencies needed.


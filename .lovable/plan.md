

# Explore Programs: Online/Offline Toggle with Cohort-Aware Forge Banners

## Overview
Add a pill toggle under "Explore Programs" to switch between **Online Programs** (existing LevelUp banners) and **Offline Residencies** (Forge banners). The Offline tab excludes the user's own cohort — e.g., a Filmmaking student sees only Writing and Creators Forge banners.

## Changes

### `src/pages/Learn.tsx`
- Add `useState` for `programTab: 'online' | 'offline'` (default `'online'`)
- Import `useEffectiveCohort` to get `effectiveCohortType`
- In the "Explore Programs" section, add a pill toggle (same amber style as Chat/Network toggle) above the banners
- **Online Programs tab**: show the 3 existing LevelUp banners (Breakthrough Filmmaking, Video Editing Academy, Creator Academy) — no changes
- **Offline Residencies tab**: show Forge banners filtered by cohort:
  - Define 3 Forge residency entries: Filmmaking (`FORGE`), Writing (`FORGE_WRITING`), Creators (`FORGE_CREATORS`)
  - Filter out the entry matching `effectiveCohortType`
  - Forge Filmmaking uses the uploaded banner image (`/images/programs/forge-filmmaking.png`)
  - Writing and Creators use placeholder `ProgramBanner` with gradient + text (user will add images later)

### Asset
- Copy `user-uploads://banners11.jpg` → `public/images/programs/forge-filmmaking.png`

## Files
| Action | File |
|--------|------|
| Copy | uploaded banner → `public/images/programs/forge-filmmaking.png` |
| Edit | `src/pages/Learn.tsx` — add toggle + cohort-filtered Offline Residencies tab |


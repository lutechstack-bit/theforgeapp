

# Redesign Top Profile Icon as a Tab-Style Button

## Current State
The top-right corner has a circular avatar with a dropdown menu (TopProfileDropdown). It's a simple round avatar with a ring.

## Proposed Design
Replace the circular avatar with a **pill/tab-shaped button** that shows:
- User's avatar (small, left side)
- User's first name
- Cohort label (e.g. "Forge Writing" or "Forge Creators"), and for POST_FORGE users: "Forge Community Member"
- Gold (#FFBF00) outline border
- Glow effect on hover (`shadow-[0_0_15px_hsl(var(--primary)/0.5)]`)

The dropdown menu functionality stays the same.

## Changes

### `src/components/layout/TopProfileDropdown.tsx`
- Replace the round avatar button trigger with a pill-shaped tab button
- Import `useEffectiveCohort` to get the cohort type and edition data
- Import `useAuth` for forge mode calculation
- Compute the cohort label: map `cohort_type` to display name, override to "Forge Community Member" when `forgeMode === 'POST_FORGE'`
- Layout: `flex items-center gap-2` with avatar (h-7 w-7), name text, and a smaller cohort subtitle
- Styling: `rounded-full border border-primary/60 bg-white/5 px-3 py-1.5` with `hover:shadow-[0_0_20px_hsl(var(--primary)/0.5)] hover:border-primary` transition

### `src/components/layout/AppLayout.tsx`
- No structural changes needed; the sticky header row already accommodates the dropdown


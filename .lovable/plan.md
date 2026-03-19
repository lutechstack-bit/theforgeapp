

# Community Section — Premium Redesign

The Refero MCP subscription has expired (needs renewal at [refero.design/mcp/upgrade](https://refero.design/mcp/upgrade)). I used Contra's talent directory as the primary design reference instead.

## Design Reference: Contra Discover

Contra uses a horizontal card layout with: portfolio thumbnail on the left, avatar + name + availability badge + location inline, skill tags as removable chips, "Get in touch" CTA button, and generous whitespace. Key takeaway: each card feels like a mini-portfolio, not a data row.

## Changes

### 1. CreativeCard — Premium Upgrade (`CreativeCard.tsx`)
- Increase padding from `p-4` to `p-5`
- Larger avatar: `w-14 h-14` (from 12)
- Add subtle `hover:shadow-lg hover:shadow-primary/5 hover:border-primary/40` glow on hover
- Occupation pills: slightly higher contrast with `bg-primary/8 text-primary border-primary/20`
- Intro text in italic for visual distinction
- Add works count badge if > 0 (e.g., "3 works")
- Increase gap between sections from `space-y-3` to `space-y-3.5`

### 2. GigCard — Premium Upgrade (`GigCard.tsx`)
- Add a 3px colored left border strip based on pay type (emerald = paid, amber = revenue share, muted = credit)
- Show poster avatar + name at the bottom (data already available but not rendered)
- Increase padding to `p-5`
- Add hover glow matching CreativeCard
- Make role pills use the same styling as occupation pills for consistency

### 3. GigsBoard — CTA & Empty State (`GigsBoard.tsx`)
- Replace dashed-border "Post a Gig" CTA with a solid card style matching the "Join the creative network" banner pattern (left accent border, icon, description text)
- Taller search bar: `py-3` with inner shadow `shadow-inner`
- Better empty state: larger icon, two-line copy with more personality

### 4. CreativesDirectory — Search & Spacing (`CreativesDirectory.tsx`)
- Taller search bar matching GigsBoard (`py-3`)
- Add subtle inner shadow for depth
- Better empty state with illustration-style messaging

### 5. Community Page — Tab Polish (`Community.tsx`)
- Add count badges to tab pills (e.g., "Creatives (12)", "Gigs (3)") by passing counts from child components or querying totals
- Slightly larger tab pill padding for better touch targets on mobile

## Files to Edit
1. `src/components/community/CreativeCard.tsx`
2. `src/components/community/GigCard.tsx`
3. `src/components/community/GigsBoard.tsx`
4. `src/components/community/CreativesDirectory.tsx`
5. `src/pages/Community.tsx`

## What Won't Change
- All data fetching, filtering, and functional logic stays identical
- No database changes
- No new components


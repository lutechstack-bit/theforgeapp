

# Update Roadmap Journey Toggle to Match Homepage Style

## Problem
The Roadmap page (`RoadmapJourney.tsx`) uses a grey segmented control (`bg-muted` with `bg-background` active state), while the homepage uses amber pill-style buttons (`bg-primary` active, transparent inactive with border). The user wants the same amber toggle style on both pages, fully visible on mobile without overflow.

## Changes

### `src/pages/roadmap/RoadmapJourney.tsx`

**Lines 212-237** — Replace the grey segmented control with the homepage's amber pill-style toggle:

```tsx
// FROM (grey segmented):
<div className="bg-muted rounded-full p-1 flex">
  <button className={cn('flex-1 py-2 ...', activeTab === 'online' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground')}>

// TO (amber pills, matching homepage):
<div className="flex flex-wrap gap-2">
  <button className={cn('flex-1 min-w-0 px-3 py-2 text-sm rounded-full border transition-all duration-200 text-center',
    activeTab === 'online' ? 'bg-primary text-primary-foreground border-primary font-medium' : 'bg-transparent text-muted-foreground border-border hover:border-foreground/30')}>
```

Same change for both the "Online Sessions" and "Goa Bootcamp" buttons. The `flex-wrap` and `min-w-0` ensure no overflow on mobile — buttons will shrink equally within the row.


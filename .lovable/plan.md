

# In-App Product Tour for Students

## Overview
Build a guided product tour that highlights key app features when a student first logs in — similar to what you see in tools like Notion, Slack, or mobile apps. Tooltips will step through the main navigation areas (Home, Community, Roadmap, Learn, Profile) with descriptions.

## Approach: Custom Tour Component (no external library)
Since the app already uses shadcn/ui and has a clean component architecture, I'll build a lightweight custom tour system using Popover-style tooltips with a backdrop overlay — no heavy dependencies needed.

## Database Change
Add a `has_seen_tour` boolean column (default `false`) to the `profiles` table. Once the user completes or dismisses the tour, it's set to `true` so they never see it again.

## New Files

### 1. `src/components/tour/AppTour.tsx`
- Full-screen semi-transparent backdrop overlay (`bg-black/50 z-[100]`)
- Spotlight cutout around the current target element (using `getBoundingClientRect`)
- Tooltip card positioned near the spotlight with: title, description, step indicator (1/5), Next/Skip buttons
- Steps config array targeting:
  1. **Home tab** (bottom nav / side nav) — "This is your Home base"
  2. **Community tab** — "Connect with your batchmates"
  3. **Roadmap tab** — "Track your journey & tasks"
  4. **Learn tab** — "Watch sessions & courses"
  5. **Profile dropdown** — "Manage your profile here"
- Auto-scrolls to each element, applies a `z-[101]` highlight ring
- On finish/skip: calls `supabase.from('profiles').update({ has_seen_tour: true })`

### 2. `src/components/tour/tourSteps.ts`
- Array of step definitions: `{ targetSelector, title, description, position }`

## Modified Files

### 3. `src/components/layout/AppLayout.tsx`
- Import and render `<AppTour />` conditionally when `profile?.has_seen_tour === false`
- Pass profile and a callback to mark tour complete

### 4. Database migration
- `ALTER TABLE profiles ADD COLUMN has_seen_tour boolean DEFAULT false;`

## Tour UX
- Appears only on first login after profile setup is complete
- Glass-morphism tooltip card matching the app's dark aesthetic
- "Skip Tour" always visible, "Next" advances, final step shows "Got it!"
- Mobile: targets bottom nav items; Desktop: targets side nav items (responsive targeting)

## Files Summary
1. **New:** `src/components/tour/AppTour.tsx`
2. **New:** `src/components/tour/tourSteps.ts`
3. **Edit:** `src/components/layout/AppLayout.tsx`
4. **Migration:** Add `has_seen_tour` column to `profiles`


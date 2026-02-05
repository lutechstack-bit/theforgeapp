
# Prep Section: Prominent Homepage Card with Cohort-Specific Content

## Summary
Elevate the Prep checklist visibility by adding a dedicated card on the Homepage, positioned immediately after the Journey section. Filter out "Mindset & Wellness" and "Script Preparation" categories from display. Use a horizontal progress bar (not a progress ring) to match the app's existing design language.

---

## Key Design Decisions

### Why NOT a Progress Ring?
1. **Inconsistent with app design language** - The app uses horizontal progress bars throughout:
   - `OnboardingChecklist` → horizontal progress bar
   - `TaskStageCard` → horizontal progress bar in headers
   - `PrepChecklistSection` → horizontal progress bar
2. **Too complex for the card layout** - A ring takes up significant vertical space
3. **Horizontal bar is more scannable** - Users can quickly see progress at a glance

### Recommended Alternative: Horizontal Progress Strip
A clean card with:
- **Left**: Icon (ClipboardCheck) + Title + Subtitle
- **Center**: Horizontal progress bar with `X/Y complete` label
- **Right**: Chevron to navigate to full checklist

This matches the `OnboardingChecklist` header pattern already used in the app.

---

## Cohort-Specific Content Reminder

The prep content already varies by cohort via the `prep_checklist_items` table:
- **Filmmakers (FORGE)**: Script prep, technical, packing
- **Writers (FORGE_WRITING)**: Writing prep, technical, packing
- **Creators (FORGE_CREATORS)**: Content prep, technical, packing

The `useRoadmapData` hook already filters by `userCohortType`, so the Homepage card will automatically show cohort-relevant progress.

---

## Implementation Plan

### File 1: Create `src/components/home/PrepHighlightCard.tsx` (NEW)

A warm-styled card that surfaces Prep checklist status on the Homepage.

```text
Layout (Mobile-First):
┌─────────────────────────────────────────────────────┐
│  ┌────┐                                             │
│  │ 📋 │  Prep Checklist          [ View → ]        │
│  └────┘  Get ready for Forge                        │
│                                                     │
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░  5/8 complete              │
└─────────────────────────────────────────────────────┘
```

**Features**:
- Uses `card-warm` styling (gold-tinted gradient background)
- Gold icon (`ClipboardCheck` or `Luggage` in `text-primary`)
- Horizontal progress bar (`<Progress />` component)
- "X/Y complete" text label
- Tap navigates to `/roadmap/prep`
- Empty state: "Get Started →" CTA if 0% progress

**Props**:
```typescript
interface PrepHighlightCardProps {
  totalItems: number;
  completedItems: number;
  progressPercent: number;
}
```

---

### File 2: Update `src/hooks/useRoadmapData.ts`

Add a computed `prepProgress` object that:
1. **Filters out excluded categories** (`mindset`, `script_prep`)
2. **Calculates progress** on visible items only
3. **Exposes summary** for Homepage consumption

**New Return Values**:
```typescript
// Add to useRoadmapData return
prepProgress: {
  totalItems: number;
  completedItems: number;
  progressPercent: number;
  hasData: boolean;
}
```

**Filter Logic**:
```typescript
const EXCLUDED_PREP_CATEGORIES = ['mindset', 'script_prep'];

const visiblePrepItems = useMemo(() => {
  if (!prepItems) return [];
  return prepItems.filter(item => !EXCLUDED_PREP_CATEGORIES.includes(item.category));
}, [prepItems]);

const prepProgress = useMemo(() => {
  const total = visiblePrepItems.length;
  const completed = visiblePrepItems.filter(item => completedIds.has(item.id)).length;
  return {
    totalItems: total,
    completedItems: completed,
    progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
    hasData: total > 0,
  };
}, [visiblePrepItems, completedIds]);
```

---

### File 3: Update `src/components/roadmap/PrepChecklistSection.tsx`

Apply the same category filter so the Roadmap/Prep page is consistent with Homepage.

**Changes**:
1. Add `EXCLUDED_CATEGORIES` constant
2. Filter items before grouping by category
3. Remove `mindset` and `script_prep` from `categoryConfig` object (cleanup)

```typescript
const EXCLUDED_CATEGORIES = ['mindset', 'script_prep'];

// Early in component, before groupedItems:
const visibleItems = items.filter(item => !EXCLUDED_CATEGORIES.includes(item.category));

// Then use visibleItems instead of items for all calculations
```

---

### File 4: Update `src/pages/Home.tsx`

Add the `PrepHighlightCard` component after `HomeJourneySection`.

**Position in Layout**:
```tsx
{/* Journey Section */}
<HomeJourneySection />

{/* NEW: Prep Checklist Card */}
{prepProgress?.hasData && (
  <PrepHighlightCard 
    totalItems={prepProgress.totalItems}
    completedItems={prepProgress.completedItems}
    progressPercent={prepProgress.progressPercent}
  />
)}

{/* Existing Carousels */}
<ContentCarousel title="Meet Your Mentors" ... />
```

This ensures Prep is visible immediately after Journey, without scrolling through all carousels.

---

## Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/components/home/PrepHighlightCard.tsx` | CREATE | New Homepage card component |
| `src/hooks/useRoadmapData.ts` | MODIFY | Add `prepProgress` computed object with filtering |
| `src/components/roadmap/PrepChecklistSection.tsx` | MODIFY | Filter out mindset/script_prep categories |
| `src/pages/Home.tsx` | MODIFY | Import and render PrepHighlightCard after Journey |

---

## Visual Design Specifications

### PrepHighlightCard Styling
- **Container**: `card-warm rounded-xl p-4` (matches Rules accordion cards)
- **Icon wrapper**: `p-2.5 rounded-lg bg-primary/15 border border-primary/20`
- **Icon**: `Luggage` or `ClipboardCheck` in `text-primary`
- **Title**: `text-foreground font-semibold`
- **Subtitle**: `text-xs text-muted-foreground`
- **Progress bar**: `<Progress className="h-2" />` with gold fill
- **Count label**: `text-sm text-muted-foreground` → "5/8 complete"
- **CTA**: Gold text with chevron → navigates to `/roadmap/prep`

### Responsive Behavior
- **Mobile**: Full-width card, stacked layout if needed
- **Desktop**: Same full-width within main content column

---

## Expected Outcome

1. **Prep is visible on Homepage** - Users see their prep progress immediately after Journey
2. **Cohort-specific content** - Each cohort sees only their relevant categories
3. **Consistent design** - Uses horizontal progress bar like rest of app
4. **Clean filtering** - Mindset & script_prep categories hidden from view
5. **One-tap access** - Card navigates to full `/roadmap/prep` checklist

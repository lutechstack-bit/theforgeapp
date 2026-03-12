

# Fix KYC & KYW Proficiency + Scroll Issues

## Problem
1. **KYC and KYW proficiency steps** use `type: 'proficiency'` (long vertical radio lists) instead of `type: 'proficiency-grid'` (compact matrix) like KYF.
2. **Scroll is broken** — the card content overflows the viewport instead of scrolling internally because the height chain (`h-full` / `min-h-0`) is missing between `KYSectionForm` → `KYFormCardStack` → `KYFormCard`.

## Changes

### 1. `src/components/kyform/KYSectionConfig.ts`

**KYC proficiency step (lines 331-353)** — replace three `proficiency` fields with one `proficiency-grid`:
```ts
fields: [
  {
    key: 'proficiency_grid',
    type: 'proficiency-grid',
    label: 'Rate your proficiency',
    skills: [
      { key: 'proficiency_content_creation', label: 'Content Creation' },
      { key: 'proficiency_storytelling', label: 'Storytelling' },
      { key: 'proficiency_video_production', label: 'Video Production' },
    ],
    levels: ['Beginner', 'Amateur', 'Ok', 'Good', 'Pro'],
  },
],
```

**KYW proficiency step (lines 461-474)** — replace two `proficiency` fields with one `proficiency-grid`:
```ts
fields: [
  {
    key: 'proficiency_grid',
    type: 'proficiency-grid',
    label: 'Rate your proficiency',
    skills: [
      { key: 'proficiency_writing', label: 'Writing' },
      { key: 'proficiency_story_voice', label: 'Story & Voice' },
    ],
    levels: ['Beginner', 'Amateur', 'Ok', 'Good', 'Pro'],
  },
],
```

### 2. Scroll fix — `src/pages/KYSectionForm.tsx` (line 284)

Change card area from `flex items-center` to `flex flex-col` with full height constraint:
```
- flex-1 flex items-center px-4 pb-16
+ flex-1 flex flex-col px-4 pb-24 min-h-0
```

### 3. Scroll fix — `src/components/kyform/KYFormCardStack.tsx`

- Line 43: `relative w-full max-h-full` → `relative w-full h-full min-h-0`
- Line 75: `relative z-10 h-auto max-h-full` → `relative z-10 h-full min-h-0`
- Line 87: `absolute inset-0 z-20 h-auto max-h-full` → `absolute inset-0 z-20 h-full min-h-0`

### 4. Scroll fix — `src/components/kyform/KYFormCard.tsx` (line 27)

Add `h-full min-h-0` to root container so `overflow-y-auto` on inner content actually triggers:
```
- relative rounded-3xl overflow-hidden flex flex-col max-h-full
+ relative rounded-3xl overflow-hidden flex flex-col h-full min-h-0
```

These four file changes make all three cohort proficiency steps use the same compact grid UI and fix the scroll so no form content is cut off.


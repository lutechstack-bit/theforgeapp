

# App Bloat Audit — Unused Code & Optimization Opportunities

## 1. Completely Unused Component Files (safe to delete)

These files are **never imported anywhere** in the codebase:

| File | Lines | Notes |
|------|-------|-------|
| `src/components/community/CollaboratorRequestModal.tsx` | ~65 | Never imported |
| `src/components/community/ContactPitchModal.tsx` | ? | Never imported |
| `src/components/community/CreativeCard.tsx` | ? | Never imported |
| `src/components/community/CreativeDetailModal.tsx` | ? | Never imported |
| `src/components/community/CollaboratorCard.tsx` | ? | Never imported |
| `src/components/community/GigCard.tsx` | ? | Never imported |
| `src/components/community/GigPostForm.tsx` | ? | Never imported |
| `src/components/community/MemberCard.tsx` | ? | Never imported |
| `src/components/community/OccupationPillSelector.tsx` | ? | Never imported |
| `src/components/community/HighlightsCard.tsx` | ? | Never imported |
| `src/components/home/WhatYouCanDoHere.tsx` | 142 | Never imported |
| `src/components/events/PastProgramCard.tsx` | ? | Never imported |
| `src/components/learn/PremiumVideoCard.tsx` | ? | Never imported |
| `src/components/learn/VideoProgressBar.tsx` | ? | Never imported |
| `src/components/learn/CourseCard.tsx` | ? | Never imported (LearnCourseCard is used instead) |
| `src/components/profile/SharePortfolio.tsx` | ? | Never imported |
| `src/components/profile/CommunityBadges.tsx` | ? | Never imported |

**Total: ~17 dead component files**

## 2. Unused Type/Utility Files

| File | Notes |
|------|-------|
| `src/types/html2pdf.d.ts` | Never referenced via import (html2pdf is imported directly) |

## 3. Major Bundle Bloat: `import * as LucideIcons`

**5 files** import the **entire** lucide-react library (~1,000+ icons, ~200KB+) as a wildcard namespace:

- `src/components/roadmap/NightlyRitualSection.tsx`
- `src/pages/admin/AdminJourneyStages.tsx`
- `src/components/journey/StickyNoteBottomSheet.tsx`
- `src/components/journey/StickyNoteCard.tsx`
- `src/components/journey/StickyNoteDetailModal.tsx`

These should use a dynamic icon resolver pattern instead of `import * as LucideIcons`.

## 4. `remotion/` Directory

The `remotion/` folder (video generation project) is **completely separate** — not imported by the main app. It ships its own `node_modules` and does NOT affect the webapp bundle. However, it adds ~50+ files to the git repo that are irrelevant to the webapp. Consider moving it to a separate repo or adding it to `.gitignore` for the main build.

## Proposed Cleanup Plan

### Step 1: Delete 17 unused component files
Remove all files listed in section 1 above. Zero risk — they have no imports.

### Step 2: Delete unused type file
Remove `src/types/html2pdf.d.ts`.

### Step 3: Replace `import * as LucideIcons` with dynamic icon map
In each of the 5 files, replace the wildcard import with a small lookup map of only the icons actually used from the admin-configured icon names. This alone could save ~150-200KB from the bundle.

### Step 4: (Optional) Move `remotion/` out of main repo
Add `remotion/` to the build ignore list or move to a separate repository.

### Summary
- **~18 dead files** to delete
- **5 files** with wildcard lucide imports bloating the bundle by ~200KB
- No database changes needed
- No functional impact — all deletions are unused code


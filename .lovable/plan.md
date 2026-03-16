

# Mobile Responsiveness Audit and Fixes

After thoroughly reviewing the codebase, the app already has strong mobile foundations: bottom nav for mobile, side nav for desktop, `page-container` with responsive padding, `safe-area` insets, `100dvh`, and responsive Tailwind classes throughout. The gaps are targeted, not wholesale.

## Issues Found and Fixes

### 1. Community Page — Tab pills overflow on small screens
The Chat | Batchmates | Network toggle uses fixed `px-5` padding that can overflow on 320px screens.
- **Fix**: Reduce pill padding on mobile (`px-3 sm:px-5`), add `text-xs sm:text-sm`, and make the container scrollable with `overflow-x-auto` as a safety fallback.
- **File**: `src/pages/Community.tsx`

### 2. Profile Page — Bento grid single-column on mobile is fine, but action strip overflows
The action strip (`flex gap-2.5`) with KY Form and Perks links can overflow on narrow screens.
- **Fix**: Add `flex-wrap` and `overflow-x-auto` to the action strip container. Reduce text size on mobile.
- **File**: `src/pages/Profile.tsx`

### 3. EventDetail — Two-column grid doesn't stack well on mobile
The grid `md:grid-cols-[minmax(0,380px)_1fr]` is fine, but the sticky breadcrumb header text can truncate awkwardly and the "Share Event" button label is hidden on mobile but the button itself is small.
- **Fix**: Minor padding/spacing adjustments for the breadcrumb bar on mobile.
- **File**: `src/pages/EventDetail.tsx`

### 4. CourseDetail — Container class missing max-width constraint
Uses raw `container` class without the app's standard max-width. Sidebar layout can feel cramped.
- **Fix**: Add `max-w-6xl xl:max-w-7xl mx-auto` to match other browse pages. Ensure `pb-24` on the main container for bottom nav clearance.
- **File**: `src/pages/CourseDetail.tsx`

### 5. Updates Page — TabsList wraps awkwardly on mobile
`TabsList` has `flex-wrap h-auto` which can create multi-row tabs that look broken. Four tabs on a 320px screen get cramped.
- **Fix**: Use `overflow-x-auto scrollbar-hide` instead of `flex-wrap`, with `shrink-0` on each trigger. Or reduce font size on mobile.
- **File**: `src/pages/Updates.tsx`

### 6. VideoPlayerModal — Sidebar takes too much space on mobile
The modal is `max-w-5xl w-[95vw]` with a flex-col/row layout. On mobile, the sidebar's `max-h-[40vh]` after a `aspect-video` player means very little content is visible.
- **Fix**: On mobile, reduce sidebar max-height to `max-h-[30vh]` and tighten padding.
- **File**: `src/components/learn/VideoPlayerModal.tsx`

### 7. Learn Page — LevelUp zone negative margins can clip on mobile
The `-mx-4 sm:-mx-5` on the LevelUp zone wrapper can cause horizontal overflow if not properly contained.
- **Fix**: Ensure the parent has `overflow-x-clip` (already present on the page container, just verify).
- **File**: `src/pages/Learn.tsx` — already has `overflow-x-clip`, no change needed.

### 8. BatchmatesDirectory — Grid gap too tight on very small screens
Uses `grid-cols-2` on mobile which is good, but cards may need slightly smaller gap on 320px.
- **Fix**: Change `gap-3` to `gap-2 sm:gap-3`.
- **File**: `src/components/community/BatchmatesDirectory.tsx`

### 9. Dialog/Drawer modals — Ensure all use Drawer on mobile
`BatchmateDetailSheet` already uses Drawer on mobile (good pattern). Verify `EventRegistrationModal` does the same — it uses Dialog only, which can be less mobile-friendly but still functional.
- **Fix**: Swap `EventRegistrationModal` to use Drawer on mobile for better touch UX.
- **File**: `src/components/events/EventRegistrationModal.tsx`

### 10. Global — Touch feedback and tap targets
Many interactive elements already have `active:scale-95 tap-feedback`. A few components (filter pills in CollaboratorDirectory, tab triggers in Updates) lack explicit `active:scale-95` for native-feel feedback.
- **Fix**: Add `active:scale-95` to filter pills and tab-like buttons across Community and Updates.
- **Files**: `src/components/community/CollaboratorDirectory.tsx`, `src/pages/Updates.tsx`

## File Summary

| Action | File |
|--------|------|
| Edit | `src/pages/Community.tsx` — responsive tab pills |
| Edit | `src/pages/Profile.tsx` — action strip overflow |
| Edit | `src/pages/CourseDetail.tsx` — max-width + mobile spacing |
| Edit | `src/pages/Updates.tsx` — tab overflow + touch feedback |
| Edit | `src/components/learn/VideoPlayerModal.tsx` — mobile sidebar height |
| Edit | `src/components/community/BatchmatesDirectory.tsx` — grid gap |
| Edit | `src/components/events/EventRegistrationModal.tsx` — Drawer on mobile |
| Edit | `src/components/community/CollaboratorDirectory.tsx` — touch feedback |

No database changes needed.


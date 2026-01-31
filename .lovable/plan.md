
Goal
- Stop carousel cards from visually “bleeding” into the section subtitle/header area (and into the next section) on both mobile and desktop.

What’s happening (root cause)
- The shared carousel implementation (`src/components/ui/carousel.tsx`) applies `py-4 -my-4` on the inner flex container.
- The negative vertical margin (`-my-4`) effectively pulls the carousel content upward and downward by 16px each, which can:
  - Remove the intended gap between the section subtitle and the cards (so the cards look like they overlap/overflow into the text).
  - Reduce spacing between stacked sections (so the next section header can sit too close to the previous carousel).
- We already removed “duplicate” classes in the Learn page components, but the base component still has `-my-4`, so the issue can still remain.

Fix approach (safe + consistent for mobile + web)
- Update the base CarouselContent styling to remove negative vertical margins entirely.
- Keep overflow visible (so the gold glow is not clipped), but stop using negative margins that cause layout overlap.

Implementation steps
1) Update the shared carousel component
   - File: `src/components/ui/carousel.tsx`
   - Change CarouselContent’s inner container classes:
     - From:
       - `className={cn("flex py-4 -my-4", ...)}`
     - To:
       - `className={cn("flex py-4", ...)}`
   - Also remove the vertical-orientation negative margin for consistency:
     - From:
       - `orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col"`
     - To:
       - `orientation === "horizontal" ? "-ml-4" : "flex-col"`
   - Keep:
     - `overflow-x-auto overflow-y-visible scrollbar-hide` so hover glows remain visible.

2) Verify the Learn page layout (mobile + desktop)
   - Route: Learn page (where “Pre Forge Sessions” and “More from LevelUp” sections are)
   - Confirm:
     - The subtitle text above each carousel no longer gets visually collided with by the cards.
     - The gap between the first carousel and the “More from LevelUp” header looks clean.
     - Continue Watching section (if present) also has correct spacing.

3) Regression check (hover + arrows)
   - Hover on cards (desktop) to confirm:
     - Gold glow still shows without being clipped.
     - Glow does not overlap the subtitle text anymore (because we now keep real vertical spacing).
   - On mobile:
     - Swipe scroll still works smoothly.
     - Arrow buttons (when shown) remain centered and not floating into headers.

Why this fixes both mobile and web
- The overlap is caused by a layout calculation (negative margins), not a breakpoint-specific CSS issue.
- Removing the negative margins makes spacing consistent across all viewport sizes.

Files touched
- `src/components/ui/carousel.tsx` (primary fix)

Acceptance criteria
- No carousel cards overlap/cover the section subtitle/header on Learn.
- No carousel area crowds into the next section header.
- Hover glow remains visible and premium-looking.

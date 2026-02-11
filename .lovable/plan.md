

# Fix Overflow and Add Premium Arrow Navigation

## Problems
1. The scroll containers extend beyond the viewport on the right side, causing visible overflow/clipping on the last card.
2. No arrow controls to navigate between cards -- the user wants premium styled prev/next buttons.

## Solution

### 1. Fix Overflow
The `-mx-4 px-4` trick on scroll containers is causing the right-side overflow because the negative margin extends the container but `overflow-x-clip` on the parent clips it inconsistently. The fix is to keep the scroll containers within the padded content area and remove the negative margin hack entirely.

### 2. Add Premium Arrow Buttons
Add sleek, semi-transparent circular arrow buttons (left/right) that appear on the edges of each carousel section. These will use `useRef` to programmatically scroll the container by one card width on click. The buttons will:
- Use a glassmorphism style (backdrop-blur, semi-transparent background)
- Have a gold/primary accent on hover
- Be hidden on mobile (touch scrolling is natural there) and visible on `md:` screens and above
- Auto-hide when scrolled to the start/end

### 3. Apply to All Carousel Sections
Extract a reusable `ScrollableCardRow` component that wraps any horizontal card list with:
- Native smooth scroll + snap
- Left/right premium arrow buttons (desktop only)
- Proper containment (no overflow issues)

## Technical Details

### `src/components/learn/ScrollableCardRow.tsx` (NEW)
- A reusable wrapper component accepting `children`
- Uses `useRef` for the scroll container and `useState` to track scroll position
- Renders left/right `ChevronLeft`/`ChevronRight` buttons with glassmorphism styling
- Scrolls by ~300px on each click with `scrollBy({ behavior: 'smooth' })`
- Buttons hidden when at scroll start/end via `onScroll` listener
- Hidden on mobile (`hidden md:flex`)

### `src/pages/Learn.tsx`
- Import and use `ScrollableCardRow` in `CourseCarouselSection` and the Masterclass section
- Remove the `-mx-4 px-4` negative margin hack from scroll containers
- Remove the gradient fade overlay div (arrows replace this affordance)

### `src/components/learn/UpcomingSessionsSection.tsx`
- Same treatment: wrap session cards in `ScrollableCardRow`
- Remove `-mx-4 px-4` and gradient overlay

| File | Action |
|------|--------|
| `src/components/learn/ScrollableCardRow.tsx` | CREATE -- Reusable scroll container with premium arrows |
| `src/pages/Learn.tsx` | UPDATE -- Use ScrollableCardRow, remove overflow hacks |
| `src/components/learn/UpcomingSessionsSection.tsx` | UPDATE -- Use ScrollableCardRow, remove overflow hacks |




# Group Courses by Section Type on "All" Tab

## Problem
When "All" filter is active, community sessions and pre-forge sessions are mixed together in a flat grid sorted only by `order_index`. This looks messy — different card aspect ratios (portrait vs landscape) are interleaved.

## Solution
When `activeFilter === 'all'`, render two grouped sections with section headers instead of one flat grid:

1. **Community Sessions** section — portrait cards in a 3-col grid
2. **Pre Forge Sessions** section — landscape cards in a 3-col grid

When a specific filter is active (Pre Forge or Community), show just that section's cards in a flat grid as before.

## File Changes

| File | Change |
|------|--------|
| `src/pages/AllCourses.tsx` | Split "all" view into two grouped sections with headers |

### Implementation Detail

```tsx
// When activeFilter === 'all', split into groups:
const communityCourses = courses.filter(c => c.section_type === 'community_sessions');
const preForgeCourses = courses.filter(c => c.section_type === 'bfp_sessions');

// Render two sections with headers:
// "Community Sessions" header + grid of portrait cards
// "Pre Forge Sessions" header + grid of landscape cards
```

Each section gets a small heading label (e.g., styled like the existing `border-l-3 border-primary pl-3` pattern) and its own grid. When a specific tab is selected, it remains a single flat grid.


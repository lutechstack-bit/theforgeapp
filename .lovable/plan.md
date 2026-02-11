

# Fix Masterclass Section Visibility

## Problem

The "Learn from the Best" masterclass section is nested inside a conditional that checks `courses.length === 0`. If the database has no `learn_content` rows, the masterclass cards (which are hardcoded and don't depend on database data) are hidden behind an empty state message.

Additionally, confirming that Anthony's redirect URL (`https://www.leveluplearning.in/anthony`) is already correctly set.

## Change

### `src/pages/Learn.tsx`

Move the "Learn from the Best" section **outside** the `courses.length` conditional block so it always renders regardless of whether other course data exists. The masterclass data is hardcoded, so it should never be hidden by the empty state.

Specifically:
- Extract the masterclass `<section>` block (lines 184-207) from inside the conditional
- Place it after the conditional block so it always appears at the bottom of the page
- This ensures all 7 masterclass cards (including Anthony -> `https://www.leveluplearning.in/anthony`) are always visible and clickable

### Files Summary

| File | Action |
|------|--------|
| `src/pages/Learn.tsx` | Move masterclass section outside conditional |


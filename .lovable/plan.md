

# Fix: Admin Content Scrolling / Cut-off Issue

## Problem
The admin panel content — particularly the payment edit dialog — gets cut off at smaller viewport heights (660px). The `DialogContent` has no max-height constraint or internal scroll, so when its content exceeds the viewport, users cannot reach the bottom fields or the Save button.

Additionally, admin pages with long tables may have similar scroll issues within the main content area.

## Changes

### 1. `src/components/ui/dialog.tsx` — Add max-height + scroll to DialogContent
- Add `max-h-[85vh] overflow-y-auto` to the `DialogContent` component so all dialogs become scrollable when they exceed viewport height.

### 2. `src/pages/admin/AdminPayments.tsx` — Ensure edit dialog is scrollable
- Add `max-h-[85vh] overflow-y-auto` class to the edit payment `DialogContent` specifically, in case the global fix needs to be more targeted.
- This ensures the grant toggle, all form fields, balance summary, and Save button are always accessible.

### Technical Details
The `DialogContent` in `dialog.tsx` currently uses `fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]` positioning with no height constraint. Adding `max-h-[85vh] overflow-y-auto` ensures content scrolls within the dialog rather than being clipped by the viewport edge.


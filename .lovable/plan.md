

# Fix: Breathing Space & Responsive Polish for Community/Network

## Problem
The Community page's content is pressed tight against the top edge — no padding-top between the app chrome and the Chat/Network toggle. The layout also needs to be consistently comfortable across mobile (320px+), tablet, and desktop.

## Changes

### `src/pages/Community.tsx`
- Add `pt-4 sm:pt-5 md:pt-6` to the main container for top breathing room (both the loading skeleton and the main view)
- Add `max-w-6xl mx-auto w-full` to center content on wide screens and prevent ultra-wide stretching
- Increase the gap slightly: `gap-3 sm:gap-4`

### `src/components/community/CollaboratorDirectory.tsx`
- Add `gap-4` instead of `gap-3` for more breathing room between sections
- Grid gap: `gap-4` instead of `gap-3`

### `src/components/community/CollaboratorCard.tsx`
- No structural changes — already has `p-5` and good spacing

## Files
| Action | File |
|--------|------|
| Edit | `src/pages/Community.tsx` — add top padding + max-width centering |
| Edit | `src/components/community/CollaboratorDirectory.tsx` — increase gaps |


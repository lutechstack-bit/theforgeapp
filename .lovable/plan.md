

# Premium UI Revamp — Creative Network

## Problems
1. Chat/Network toggle is tiny (`text-xs`, `px-4 py-1.5`) — easy to miss on mobile
2. CollaboratorDirectory renders its own "Creative Network" header + inbox button inside a `flex-col h-full` that fights with the parent's `flex-1 min-h-0` — inbox button gets clipped
3. Cards are visually flat — thin borders, small avatars, cramped spacing
4. No visual hierarchy between the CTA banner, search, filters, and grid
5. The grid wrapper uses `flex-1 overflow-y-auto` creating nested scroll containers

## Solution

### `src/pages/Community.tsx`
- Make the toggle bigger: `px-5 py-2 text-sm` with proper height
- When Network is active, show the `CollaboratorInbox` button inline in the toggle row (right side) — pulled OUT of the directory component
- Pass inbox visibility up so it's always visible in the top bar

### `src/components/community/CollaboratorDirectory.tsx`
- Remove the header row entirely (the "Creative Network" title + inbox) — the page-level toggle already identifies the view, and inbox moves to the parent
- Keep a single-line stats bar: `"{count} creators · {activeFilter}" `
- Search: dark bg with proper contrast, rounded-lg, larger padding
- Filter pills: slightly bigger (`px-3.5 py-2 text-xs`), with right-fade gradient mask for scroll hint
- Grid: remove `flex-1 overflow-y-auto` wrapper — use natural page scroll with `pb-24` for bottom nav clearance
- CTA banner: amber left border accent, tighter layout

### `src/components/community/CollaboratorCard.tsx`
- Larger avatar: `w-14 h-14` with thicker ring (`ring-[3px]`)
- Name text: `text-base font-bold` (was `text-sm font-semibold`)
- Intro quote: slightly larger, `text-sm` with better line-height
- Occupation pills: amber-tinted active style, slightly more padding
- Edition badge: full-width row with icon
- Contact button: full-width, amber bg, proper height (`h-10`)
- Portfolio button: outline with subtle amber tint
- Card: more padding (`p-5`), stronger hover state with amber border glow
- Add a subtle separator between content and actions

### `src/components/community/CollaboratorInbox.tsx`
- No structural changes — just ensure the trigger button renders properly when placed in the Community page header row

### `src/components/community/CollaboratorRequestModal.tsx`
- No changes needed — already clean

## Files Summary
| Action | File |
|--------|------|
| Edit | `src/pages/Community.tsx` — bigger toggle, inbox in header row |
| Edit | `src/components/community/CollaboratorDirectory.tsx` — remove header, fix scroll, polish layout |
| Edit | `src/components/community/CollaboratorCard.tsx` — premium card redesign |


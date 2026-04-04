

# Fix: True Full-Screen Zoom Meeting Experience

## Problem
From your screenshots, three issues are visible:
1. The Zoom video renders in a constrained box (~1090px) that doesn't fill the full viewport width — leaving black dead space on the right
2. The Zoom toolbar (Mute, Video, Participants, Chat, etc.) is cut off at the bottom and only visible by scrolling
3. The custom header bar wastes 57px of vertical space and adds visual noise compared to the native Zoom experience (reference screenshots 3-5)

**Root cause:** The Zoom Meeting SDK's "Component View" renders its internal elements with hardcoded inline styles. The current CSS overrides target the wrong selectors and the `position: relative !important` rule breaks the SDK's absolute positioning model. Additionally, the 57px header pushes the container down, causing the toolbar to overflow below the viewport.

## Changes — `src/pages/LiveSession.tsx`

### 1. Remove the header bar, go full-screen like native Zoom
Instead of a 57px header with "Live" badge and "Leave Meeting" button, overlay a small floating leave button in the top-right corner (like Zoom's "End" button). This gives the SDK the full `100vh` to work with — no offset, no toolbar cutoff.

```text
Current layout:
┌─────────────────────────────┐
│ [Live] Title    [Leave]     │ ← 57px header
├─────────────────────────────┤
│                             │
│  Zoom SDK (constrained)     │
│                             │
│  ── toolbar cut off ──      │ ← overflows below viewport
└─────────────────────────────┘

Proposed layout:
┌─────────────────────────────┐
│                    [Leave]  │ ← floating overlay button
│                             │
│     Zoom SDK (full screen)  │
│                             │
│  [Mute][Video][Chat][...]   │ ← toolbar visible
└─────────────────────────────┘
```

### 2. Fix CSS overrides — target the right SDK elements
The SDK creates a `suspension-window` element with absolute positioning and fixed dimensions. Current overrides set `position: relative !important` which breaks the SDK layout. Replace with:
- Target `#ZOOM_WEB_SDK_SELF_DEFINED` (the SDK's own root ID)
- Force the `suspension-window` to `left: 0 !important; top: 0 !important; width: 100% !important; height: 100% !important`
- Do NOT override `position` — the SDK needs absolute positioning internally

### 3. Lock body scroll when in meeting
Add `overflow: hidden` to `document.body` when `isInMeeting` is true to prevent page scrolling that pushes the toolbar out of view.

### 4. Init with full viewport dimensions (no header offset)
Since we're removing the header, init sizing becomes simply `window.innerWidth` x `window.innerHeight`. The `updateVideoOptions` call on resize also uses the full viewport.

### 5. Handle the `connection-change` "Closed" event
When the meeting ends or the user leaves from within Zoom's own UI, detect `state === 'Closed'` and reset `zoomClient` to null, returning to the pre-join UI.

## Mobile
Mobile already redirects to the native Zoom app — no changes needed there. The reference screenshots (4 and 5) confirm this is the right approach for mobile.

## Summary of code changes
- **One file**: `src/pages/LiveSession.tsx`
  - Replace the header overlay with a floating "Leave" button
  - Fix CSS override selectors (target `suspension-window`, `#ZOOM_WEB_SDK_SELF_DEFINED`)
  - Remove `position: relative !important` override
  - Init with full `window.innerWidth` x `window.innerHeight` (no 57px subtraction)
  - Add body overflow lock via useEffect when `isInMeeting`
  - Listen for `connection-change` `Closed` state to auto-exit




# Fix: Full-Screen Zoom Meeting Embed Experience

## Problem
The Zoom Meeting SDK renders as a small floating popup (default "Component View" behavior) instead of filling the page. This is because `client.init()` is called without `customize.video` sizing options, so Zoom uses its tiny default dimensions.

## Changes

### 1. `src/pages/LiveSession.tsx` — Full-screen embedded Zoom layout

**Init with custom video sizing:**
- Pass `customize.video.viewSizes.default` with the container's full width/height to `client.init()`
- Set `isResizable: true` so it adapts
- Use a `ResizeObserver` on the container to call `client.updateVideoSize()` when the viewport changes

**Layout changes when meeting is active:**
- When `zoomClient` is set (meeting joined), switch to a full-viewport layout:
  - Hide the session header, countdown cards, and other content
  - Show only a minimal top bar with session title + "Leave" button
  - Make the zoom container fill remaining screen height (`h-[calc(100vh-60px)]`)
- When not in a meeting, show the current UI as-is

**Key code in `client.init()`:**
```typescript
const rect = container.getBoundingClientRect();
await client.init({
  zoomAppRoot: container,
  language: 'en-US',
  patchJsMedia: true,
  leaveOnPageUnload: true,
  customize: {
    video: {
      isResizable: true,
      viewSizes: {
        default: {
          width: Math.max(rect.width, 900),
          height: Math.max(rect.height, 600),
        },
        ribbon: {
          width: 300,
          height: 700,
        },
      },
    },
    meetingInfo: ['topic', 'host', 'mn', 'pwd', 'telPwd', 'invite', 'participant', 'dc', 'enctype'],
    toolbar: {
      buttons: [
        { text: 'Custom Button', className: 'CustomButton', onClick: () => {} },
      ],
    },
  },
});
```

**Container styling when active:**
```tsx
// When zoomClient is active, go full-screen
<div className="fixed inset-0 z-50 bg-background flex flex-col">
  {/* Minimal header bar */}
  <div className="flex items-center justify-between px-4 py-3 border-b">
    <h2 className="font-semibold truncate">{session.title}</h2>
    <Button variant="destructive" size="sm" onClick={handleLeave}>
      Leave Meeting
    </Button>
  </div>
  {/* Zoom fills remaining space */}
  <div ref={zoomContainerRef} id="zoom-meeting-container" 
       className="flex-1 w-full" />
</div>
```

**Add leave handler:**
```typescript
const handleLeave = () => {
  if (zoomClient) {
    try { zoomClient.leaveMeeting(); } catch {}
  }
  setZoomClient(null);
};
```

### 2. Files changed
- `src/pages/LiveSession.tsx` — customize init sizing, full-viewport active meeting layout, leave button, resize observer


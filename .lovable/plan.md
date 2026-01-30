
# Fix Fullscreen Button for Mobile (iOS/In-App Browsers)

## Summary
The fullscreen button is visible on mobile but doesn't work when tapped. This fix adds proper iOS Safari and WebView (WhatsApp, Instagram, etc.) support for the fullscreen functionality.

---

## Root Causes Identified

| Issue | Impact |
|-------|--------|
| **Missing legacy iframe attributes** | iOS Safari/WebViews require `webkitallowfullscreen` and `mozallowfullscreen` on Vimeo iframes |
| **Using `document.querySelector`** | Unreliable; should use React refs instead |
| **No iOS fullscreen fallbacks** | `element.requestFullscreen()` often fails on iOS; need `webkitRequestFullscreen()` and `webkitEnterFullscreen()` |
| **No user feedback** | When fullscreen fails, user gets no indication |

---

## Solution

### 1. Add iOS-compatible iframe attributes
```tsx
<iframe
  ref={vimeoIframeRef}
  src={embedUrl}
  allowFullScreen
  webkitallowfullscreen="true"  // iOS Safari
  mozallowfullscreen="true"     // Legacy Firefox
  ...
/>
```

### 2. Use proper React refs
Replace `document.querySelector('.vimeo-container')` with:
- `vimeoContainerRef` for the container div
- `vimeoIframeRef` for the iframe element

### 3. Multi-stage fullscreen with iOS fallbacks
```tsx
const handleVimeoFullscreen = async () => {
  try {
    // 1. Try iframe.requestFullscreen()
    // 2. Fallback: iframe.webkitRequestFullscreen()
    // 3. Fallback: container.requestFullscreen()
    // 4. Fallback: container.webkitRequestFullscreen()
  } catch (err) {
    toast.error("Fullscreen isn't available. Try opening in Safari/Chrome.");
  }
};
```

### 4. Add user feedback via toast
When fullscreen isn't supported (common in WhatsApp/Instagram in-app browsers), show a helpful message.

---

## Technical Changes

### File: `src/components/learn/SecureVideoPlayer.tsx`

**1. Add sonner import (line 1-10)**
```tsx
import { toast } from 'sonner';
```

**2. Add new refs (after line 76)**
```tsx
const vimeoContainerRef = useRef<HTMLDivElement>(null);
const vimeoIframeRef = useRef<HTMLIFrameElement>(null);
```

**3. Update `toggleFullscreen` for native videos (lines 363-371)**
Add iOS fallbacks using `webkitRequestFullscreen()` and `webkitEnterFullscreen()`.

**4. Replace entire Vimeo section (lines 478-508)**
- Use refs instead of `document.querySelector`
- Add `webkitallowfullscreen` and `mozallowfullscreen` to iframe
- Implement multi-stage fullscreen with try/catch and toast feedback

---

## Expected Behavior After Fix

| Platform | Behavior |
|----------|----------|
| **iPhone Safari** | Fullscreen works reliably |
| **iPhone in-app browser (WhatsApp)** | Either works or shows helpful toast message |
| **Android Chrome** | Works as before |
| **Desktop** | Works as before (hover-to-reveal) |

---

## Important Note
After the fix is implemented, you'll need to **Publish** the changes for them to appear on your phone (since you're testing the Published site).



## Update Marker.io Script

Replace the deferred loading Marker.io script with the standard synchronous snippet for immediate widget availability on all pages.

---

## Current Issue

The current implementation in `index.html` defers Marker.io loading by 2 seconds after page load. This delays when the feedback widget becomes visible.

---

## Change Required

**File:** `index.html` (lines 16-32)

Replace the current deferred script:
```html
<!-- Marker.io Widget - Deferred loading to prevent boot blocking -->
<script>
  // Defer Marker.io loading until after app boot
  window.addEventListener('load', function() {
    setTimeout(function() {
      ...
    }, 2000);
  });
</script>
```

With the standard snippet:
```html
<!-- Marker.io Widget -->
<script>
  window.markerConfig = {
    project: '696f7d063702deb92d871f48', 
    source: 'snippet'
  };
  !function(e,r,a){if(!e.__Marker){e.__Marker={};var t=[],n={__cs:t};["show","hide","isVisible","capture","cancelCapture","unload","reload","isExtensionInstalled","setReporter","clearReporter","setCustomData","on","off"].forEach(function(e){n[e]=function(){var r=Array.prototype.slice.call(arguments);r.unshift(e),t.push(r)}}),e.Marker=n;var s=r.createElement("script");s.async=1,s.src="https://edge.marker.io/latest/shim.js";var i=r.getElementsByTagName("script")[0];i.parentNode.insertBefore(s,i)}}(window,document);
</script>
```

---

## Why This Works

The `MarkerProvider` component (already in `App.tsx` at the root level inside `BrowserRouter`) will:
1. Detect when `window.Marker` becomes available
2. Automatically call `window.Marker.show()` to display the widget
3. Sync user reporter data when authenticated
4. Update custom data with current path on every page

Since `MarkerProvider` is rendered at the app root level (outside of any route-specific components), the widget will be visible on all pages including:
- Public routes (auth, forgot-password, portfolio)
- Onboarding flows (profile-setup, KY forms)
- Main app pages (home, community, learn, events, etc.)
- Admin pages

---

## Files to Change

1. `index.html` - Replace deferred Marker.io script with standard synchronous snippet



# Fix Hidden Journey Tab - Auto-Scroll to Active Tab

## Problem

When navigating to the Rules page (or any tab beyond the visible area), the ScrollArea stays at that scroll position. When you return to the Roadmap page, the "Journey" tab is cut off on the left because the scroll position was preserved.

---

## Solution

Add auto-scroll behavior that scrolls the active tab into view whenever the route changes. This ensures the currently selected tab is always visible.

---

## Technical Changes

### File: `src/components/roadmap/QuickActionsBar.tsx`

**1. Add useRef and useEffect hooks**
```tsx
import React, { useRef, useEffect } from 'react';
```

**2. Create a ref for each button and scroll active into view**

Add a ref to track button elements and scroll the active one into view on route change:

```tsx
const activeButtonRef = useRef<HTMLButtonElement>(null);

useEffect(() => {
  // Scroll the active tab into view when route changes
  if (activeButtonRef.current) {
    activeButtonRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  }
}, [location.pathname]);
```

**3. Attach ref to active button**
```tsx
<button
  ref={active ? activeButtonRef : null}
  key={section.id}
  onClick={() => navigate(section.path)}
  ...
>
```

---

## Behavior After Fix

| Scenario | Before | After |
|----------|--------|-------|
| Load Journey page | Journey visible | Journey visible |
| Navigate to Rules | Rules visible, Journey cut off | Rules visible, Journey cut off |
| Navigate back to Journey | Journey still cut off! | **Journey scrolls into view** |
| Page reload on Rules | Journey cut off | **Rules centered, Journey accessible** |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/roadmap/QuickActionsBar.tsx` | Add useEffect to auto-scroll active tab into view |

---

## Result

The active tab will always be visible and centered in the scroll area, making it clear which section the user is currently viewing.

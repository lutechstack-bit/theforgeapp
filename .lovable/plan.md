

# Fix Admin Sidebar Scrolling Issue

## Problem

The admin sidebar navigation has **20 items** but lacks overflow scrolling. On smaller screens, items like "Stay Locations" (item #10) may be cut off and inaccessible.

**Current Code (line 72):**
```tsx
<nav className="flex-1 p-4 space-y-1">
```

This doesn't allow scrolling when content overflows.

---

## Solution

Add `overflow-y-auto` to the navigation container so all items are accessible via scroll.

---

## File to Modify

| File | Line | Change |
|------|------|--------|
| `src/components/admin/AdminLayout.tsx` | 72 | Add `overflow-y-auto` to nav element |

---

## Code Change

```tsx
// Before (line 72)
<nav className="flex-1 p-4 space-y-1">

// After
<nav className="flex-1 p-4 space-y-1 overflow-y-auto">
```

---

## Result

After this fix, you'll be able to scroll through all 20 admin navigation items and easily find **Stay Locations** between "Roadmap Sidebar" and "Equipment".


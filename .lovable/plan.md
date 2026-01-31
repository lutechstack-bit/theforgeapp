
# Fix: Edit My Responses Button Overlapping Sidebar

## Problem

The "Edit My Responses" floating button on the `/my-kyform` page overlaps with the sidebar navigation on desktop when scrolling. This happens because:

1. The button container uses `left-0 right-0` - spanning full viewport width
2. The button has `z-50` which is higher than the sidebar's `z-40`
3. On desktop, the main content is offset by the sidebar width, but the fixed button ignores this offset

## Current Code (Lines 419-433)

```tsx
{/* Floating Edit Button */}
<div className="fixed bottom-20 md:bottom-6 left-0 right-0 px-4 z-50">
  <div className="max-w-2xl mx-auto">
    <Button ...>
      Edit My Responses
    </Button>
  </div>
</div>
```

## Solution

Adjust the button's positioning to respect the sidebar width on desktop:

1. **Change `left-0` to account for sidebar width on desktop** - use `md:left-[72px]` (collapsed) or consider the sidebar context
2. **Lower the z-index** to `z-30` so it stays below the sidebar (`z-40`)
3. **Better approach**: Use the same offset pattern as the main content layout

The cleanest fix is to:
- Keep `left-0` for mobile (no sidebar)
- Add `md:left-64` or use CSS variable for the sidebar offset
- This ensures the button stays within the content area, not under the sidebar

Since the layout uses `md:ml-64` (or `md:ml-[72px]` when collapsed) for the main content, the fixed button should match this pattern.

## Proposed Fix

```tsx
{/* Floating Edit Button */}
<div className="fixed bottom-20 md:bottom-6 left-0 md:left-64 right-0 px-4 z-30">
  <div className="max-w-2xl mx-auto">
    <Button 
      className="w-full h-14 text-base font-semibold bg-gradient-to-r from-primary to-accent 
                 text-primary-foreground shadow-[0_0_30px_rgba(255,188,59,0.3)] 
                 hover:shadow-[0_0_40px_rgba(255,188,59,0.5)] transition-all duration-300
                 rounded-xl border border-primary/30"
      onClick={() => navigate(getFormRoute())}
    >
      <Edit className="w-5 h-5 mr-2" />
      Edit My Responses
    </Button>
  </div>
</div>
```

## Key Changes

| Property | Before | After |
|----------|--------|-------|
| `left` | `left-0` | `left-0 md:left-64` |
| `z-index` | `z-50` | `z-30` |

## Why This Works

- **Mobile (`left-0`)**: No sidebar, button spans full width - works correctly
- **Desktop (`md:left-64`)**: Button container starts after the 256px sidebar, matching the main content offset
- **Lower z-index (`z-30`)**: Button stays below sidebar (z-40), preventing visual overlap

## Alternative: Use Sidebar Context

For a more robust solution that handles collapsed/expanded states, we could use the `useSidebar` hook:

```tsx
const { collapsed } = useSidebar();

<div className={cn(
  "fixed bottom-20 md:bottom-6 left-0 right-0 px-4 z-30 transition-all duration-300",
  collapsed ? "md:left-[72px]" : "md:left-64"
)}>
```

This would dynamically adjust based on sidebar state, but requires importing the context.

## Visual Result

```text
Before (broken):
┌──────────────────────────────────────────┐
│ Sidebar │ Content                        │
│         │                                │
│   ┌─────┴────────────────────────────────┤
│   │   [Edit My Responses Button]   ←Overlaps!
└───┴──────────────────────────────────────┘

After (fixed):
┌──────────────────────────────────────────┐
│ Sidebar │ Content                        │
│         │                                │
│         │   [Edit My Responses Button]   │
│         └────────────────────────────────┤
└──────────────────────────────────────────┘
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/MyKYForm.tsx` | Update floating button container positioning (line 420) |

## Recommendation

Use the simpler static fix (`md:left-64`) since the sidebar is rarely collapsed on this page, and it's a cleaner solution without additional context dependencies. The button will be properly positioned within the content area on desktop.

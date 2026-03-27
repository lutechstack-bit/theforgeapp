

# Fix KPI Popup Not Scrolling — Shows Only 5 of 8 Users

## Problem
The popup dialog's inner `div` has `max-h-[360px] overflow-y-auto`, but the `DialogContent` (from shadcn) applies its own max-height (`max-h-[85vh]`) and internal padding that limits visible space. The overflow-y-auto on a plain div can also fail to create a proper scroll container in some dialog layouts.

## Fix — `src/pages/admin/AdminActivity.tsx`

**Replace the plain scrollable div with the `ScrollArea` component** and increase the max-height to adapt to viewport:

### Line 314 change:
```tsx
// Before
<div className="max-h-[360px] overflow-y-auto space-y-2">
  {kpiUsers.map(...)}
</div>

// After
<ScrollArea className="max-h-[60vh]">
  <div className="space-y-2 pr-3">
    {kpiUsers.map(...)}
  </div>
</ScrollArea>
```

### Add import:
Add `ScrollArea` to imports from `@/components/ui/scroll-area`.

**Single file, two-line change. No database changes.**


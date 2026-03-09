

# Add Tooltip to Reorder Button in Admin Learn

## Change

Wrap the `GripVertical` drag handle div in `AdminLearn.tsx` (line 748-755) with a `Tooltip` component showing "Drag to reorder" on hover.

**File: `src/pages/admin/AdminLearn.tsx`**
- Import `Tooltip, TooltipTrigger, TooltipContent, TooltipProvider` from `@/components/ui/tooltip`
- Wrap the existing drag handle `<div>` with `<Tooltip>` + `<TooltipTrigger asChild>` and add a `<TooltipContent>` with text "Drag to reorder"
- Ensure the parent or page has a `<TooltipProvider>` wrapping the content

Single file, ~5 lines changed.


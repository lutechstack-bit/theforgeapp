

# Fix: "Post a Gig" — Switch from Sidebar Sheet to Dialog Popup + Fix Field Overlap

## Problems Identified

1. **Sidebar Sheet instead of Dialog**: The form uses `Sheet` (slides in from right) instead of a centered `Dialog` popup.
2. **Field overlap**: The floating-label inputs inside the narrow Sheet cause label/placeholder text to collide with each other, especially for the Budget/Duration 2-column grid.

## Changes

### 1. Rewrite `src/components/community/GigPostForm.tsx`

- Replace `Sheet`/`SheetContent`/`SheetHeader`/`SheetTitle` imports with `Dialog`/`DialogContent`/`DialogHeader`/`DialogTitle` from `@/components/ui/dialog`.
- Use `DialogContent` with `className="sm:max-w-xl max-h-[85vh] overflow-y-auto"` for a centered, scrollable popup.
- Add proper spacing (`space-y-5`) and padding (`p-6`) to prevent field collapse.
- For the Budget/Duration grid row, use `gap-4` instead of `gap-3` to give breathing room.
- Ensure all `FloatingInput` and `FloatingTextarea` fields have consistent `bg-secondary/50` and no extra `placeholder` prop that conflicts with the floating label's `placeholder=" "` mechanism (the `placeholder` on FloatingInput is passed through to the underlying Input which already uses `placeholder=" "` — the extra placeholder props on Budget/Duration/Location/Contact are being ignored by the floating label but could cause confusion).

### 2. Specific field fixes

- Remove `placeholder` props from `FloatingInput` calls (the floating label handles the hint text via the `label` prop — the extra placeholder creates a double-text effect when the field is empty but not focused).
- Instead, put hint text into the `label` itself, e.g. `label="Budget (e.g. ₹5,000/day)"` or keep labels clean and rely on the floating pattern.

### Files Modified
- `src/components/community/GigPostForm.tsx` — rewrite Sheet → Dialog, fix spacing

No database changes needed. No new files.


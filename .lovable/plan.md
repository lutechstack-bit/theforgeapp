

# Add Drag-and-Drop Reordering to Admin Learn Table

## What we're building
A drag handle (`GripVertical` icon) in the Actions column of the Learn content table. Press-and-hold the handle to drag rows and reorder them. The new `order_index` values persist to the database so the order reflects on both the user-facing Learn page and the ContentSidebar (Workshop panel on course detail).

## Changes: `src/pages/admin/AdminLearn.tsx`

1. **Import `GripVertical`** from lucide-react (line 34).

2. **Add drag state** — two `useState` values: `dragIndex` and `dragOverIndex` (both `number | null`).

3. **Add reorder mutation** — on drop, recompute `order_index` for all items in the current tab's filtered list, then batch-update via `Promise.all` of individual `.update({ order_index })` calls. Invalidate both `admin-learn-content` and `learn_content` query keys so the user-facing Learn page + ContentSidebar pick up the new order immediately.

4. **Make each `TableRow` a drag target** — add `onDragOver` (prevent default + set `dragOverIndex`) and `onDrop` handlers. Add a visual indicator (e.g. `border-t-2 border-primary`) when `dragOverIndex` matches the row.

5. **Add `GripVertical` button in Actions column** (line ~687, next to Pencil and Trash2):
   - `draggable` on the button
   - `onDragStart` sets `dragIndex`
   - `onDragEnd` clears state
   - `cursor-grab` styling

6. **ContentSidebar already reads `order_index`** — the sibling query in `CourseDetail.tsx` (line 91) orders by `order_index`, so reordering in admin automatically updates the Workshop sidebar order. No changes needed there.

## Why no other files change
- The Learn page fetches content ordered by `order_index`.
- ContentSidebar receives siblings already sorted by `order_index`.
- Both reflect the new order without code changes.


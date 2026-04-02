

# Fix: "New Session" Dialog Crash

## Root Cause
Two issues in `AdminLiveSessions.tsx` are causing the crash:

1. **`<SelectItem value="">None</SelectItem>`** (line 378) — Radix UI Select does not allow empty string values. This throws a runtime error that the ErrorBoundary catches, showing "Something went wrong."

2. **Missing `DialogDescription`** — Radix UI logs a console error when `DialogContent` has no `DialogDescription`, which can contribute to rendering issues.

## Fix

### File: `src/pages/admin/AdminLiveSessions.tsx`

1. Change `<SelectItem value="">None</SelectItem>` to `<SelectItem value="none">None</SelectItem>` and handle the mapping in the save mutation (convert `"none"` back to `null`).

2. Add a `DialogDescription` import and include it in the dialog header for accessibility.

3. Apply the same fix to the Edition select if it can also have an empty value — use a sentinel value like `"none"` instead of `""`.

### Changes Summary
- Replace empty-string `SelectItem` values with `"none"` sentinel
- Map `"none"` → `null` in the save mutation for `learn_content_id` and `edition_id`
- Add `DialogDescription` to the dialog

No other files need changes.


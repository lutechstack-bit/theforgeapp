

# Fix: Timezone Offset Bug in Live Sessions

## Problem
The `datetime-local` input produces a string like `2026-04-02T15:30` (no timezone). When saved to a `timestamptz` column, Supabase interprets it as **UTC**. When displayed back, `new Date()` converts UTC to local time (IST = UTC+5:30), so 3:30 PM becomes 9:00 PM.

## Fix in `AdminLiveSessions.tsx`

**When saving** (lines 110-111): Convert the local datetime string to a proper ISO string with timezone offset before sending to Supabase.

```typescript
start_at: new Date(payload.start_at).toISOString(),
end_at: new Date(payload.end_at).toISOString(),
```

`new Date("2026-04-02T15:30")` interprets the input as **local time** and `.toISOString()` converts it to the correct UTC value (e.g., `2026-04-02T10:00:00.000Z` for IST). When reading back, `new Date()` will correctly convert UTC back to local time for display.

**No changes needed** for `openEdit` or display formatting — they already use `new Date()` which handles UTC→local conversion correctly.

### Files Changed
- `src/pages/admin/AdminLiveSessions.tsx` — 2 lines in `saveMutation`


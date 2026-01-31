

# Remove Cohort Type Badge from Side Navigation

## Problem

The user profile section in the side navigation displays the raw cohort type value (e.g., "FORGE_WRITING", "FORGE_CREATORS") as a badge. This is a technical/internal identifier and shouldn't be shown to users.

## Current Code (Lines 219-223)

```tsx
{edition?.cohort_type && (
  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-0.5 w-fit">
    {edition.cohort_type}
  </Badge>
)}
```

## Solution

Remove the cohort type badge entirely from the user display section. The user's name is sufficient for identification in the navigation.

## File to Modify

| File | Changes |
|------|---------|
| `src/components/layout/SideNav.tsx` | Remove lines 219-223 (the cohort_type Badge) |

## After Change

The user section will show:
- Avatar (with image or initials)
- User's full name
- Chevron arrow

No more "FORGE_WRITING" or similar technical labels.

## Visual Result

```text
BEFORE:
┌─────────────────────────┐
│ [A]  Admin              │
│      FORGE_WRITING   >  │  ← Technical label shown
└─────────────────────────┘

AFTER:
┌─────────────────────────┐
│ [A]  Admin           >  │  ← Clean, just the name
└─────────────────────────┘
```


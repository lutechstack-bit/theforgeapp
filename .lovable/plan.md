

# Dynamic KY Profile Card Heading by Cohort

## Change
Update `src/components/home/KYProfileCard.tsx` to display a cohort-specific heading instead of the hardcoded "Filmmaking Profile".

| Cohort | Heading |
|--------|---------|
| `FORGE` | Filmmaking Profile |
| `FORGE_WRITING` | Writers Profile |
| `FORGE_CREATORS` | Creator Profile |

## File Changes

| File | Change |
|------|--------|
| `src/components/home/KYProfileCard.tsx` | Replace hardcoded `"Filmmaking Profile"` with a helper that maps `cohortType` to the correct label |

Simple inline map — no new files needed.


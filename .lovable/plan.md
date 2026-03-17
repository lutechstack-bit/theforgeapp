

# Update KY Profile Card Heading Copy per Cohort

## Change
Update the heading in `src/components/home/KYProfileCard.tsx` to use cohort-specific "Know Your..." copy:

| Cohort | Current | New |
|--------|---------|-----|
| `FORGE` | Filmmaking Profile | Know Your Filmmaker Profile |
| `FORGE_WRITING` | Writers Profile | Know Your Writer Profile |
| `FORGE_CREATORS` | Creator Profile | Know Your Creator Profile |

## File Changes

| File | Change |
|------|--------|
| `src/components/home/KYProfileCard.tsx` | Update the cohort-to-heading mapping object (line ~39) with the new copy |


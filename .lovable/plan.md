

# Remove Today's Focus Section from Homepage

## Change
Remove the Today's Focus card (lines 124-127) from `src/pages/Home.tsx`. Also remove the unused import of `TodaysFocusCard` and the `useTodaysFocus` hook since they'll no longer be needed on this page.

## File Changes

| File | Change |
|------|--------|
| `src/pages/Home.tsx` | Remove `TodaysFocusCard` import, `useTodaysFocus` hook usage, `focusSection` variable, and the Today's Focus JSX block |


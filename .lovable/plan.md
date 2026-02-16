

# Fix Cramped Country & State Selector

## Problem
The Country & State field currently renders THREE labels stacked together:
1. Parent label: "Country & State *" (from KYSectionFields.tsx)
2. Inner label: "Country *" (from CountryStateSelector)
3. Inner label: "State *" (from CountryStateSelector)

This creates the collapsed, cramped look shown in the screenshot.

## Solution
Remove the inner "Country" and "State" labels from the `CountryStateSelector` component since the parent label "Country & State" already describes the field group. The two select dropdowns will sit side-by-side with just their placeholder text, making the layout cleaner and more spacious.

Also update the placeholder text to be clearer: "Country" and "State" inside the select triggers themselves, so context isn't lost.

## Files Changed

| File | Change |
|------|--------|
| `src/components/onboarding/CountryStateSelector.tsx` | Remove the individual "Country" and "State" Label elements; reduce `space-y-2` to just the select; update placeholders to "Country" and "State" for clarity |

## Result
```text
Country & State *
[  Country  v ]  [  State  v ]
```

Instead of the current:
```text
Country & State *
Country *          State *
[  Select...  v ]  [        v ]
```


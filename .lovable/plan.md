
# Redesign KY Form UI to Match Reference Wireframe

## What Changes

Updating the KY section form UI to match the reference wireframe across all cohorts (FORGE, FORGE_WRITING, FORGE_CREATORS). This is a visual-only change -- no logic, data flow, or field configuration changes. No question number labels.

## Changes by File

### 1. `src/components/kyform/KYFormProgressBar.tsx`
Replace the single continuous progress bar with a segmented bar. Each segment represents one step. Completed segments are orange/gold, current segment is gold (brighter), remaining segments are grey/muted. Small gap between segments.

### 2. `src/pages/KYSectionForm.tsx`
- Redesign bottom navigation:
  - "Back" becomes a plain text button with chevron: `< Back` (no border, no background, muted text)
  - "Next" becomes a cream/off-white pill button with dark text: `Next >` (replacing gold gradient)
  - "Complete" uses the same cream pill style
- Remove "Step X of Y" text from top bar (segmented bar already shows progress)
- Keep section title in top bar

### 3. No changes to `KYSectionFields.tsx`, `KYFormCard.tsx`, `KYFormCardStack.tsx`, or any config/logic files.

## Visual Summary

| Element | Current | New |
|---------|---------|-----|
| Progress bar | Single continuous gradient | Segmented: gold (done), bright gold (current), grey (remaining) |
| Back button | Bordered pill "arrow Back" | Plain text "< Back", no background |
| Next button | Gold gradient pill, dark text | Cream/off-white pill, dark text |
| Complete button | Gold gradient "Complete check" | Cream pill "Complete" |
| Step counter | "Step X of Y" in top bar | Removed |

## Files Modified

| File | Change |
|------|--------|
| `src/components/kyform/KYFormProgressBar.tsx` | Rebuild as segmented progress bar |
| `src/pages/KYSectionForm.tsx` | Bottom nav redesign, remove step counter |

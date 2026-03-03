

# Fix Floating Label Overlap — Adjust Shared Components

## Problem
The floated label sits too close to the typed text, causing visual collision/overlap when the input is focused or filled.

## Fix
Only the **two shared components** need updating — all 19+ files across the app import from these, so the fix propagates everywhere automatically.

### `src/components/ui/floating-input.tsx`
- Input padding: `pt-5 pb-1.5` → `pt-6 pb-1.5` (more room for text below label)
- Min height: `min-h-[3rem]` → `min-h-[3.25rem]`
- Label active position: `top-2.5` → `top-1` (in both `peer-focus:` and `peer-[:not(:placeholder-shown)]:`)

### `src/components/ui/floating-textarea.tsx`
- Textarea padding: `pt-6 pb-2` → `pt-7 pb-2`
- Label active position: `top-1.5` → `top-1` (in both `peer-focus:` and `peer-[:not(:placeholder-shown)]:`)

No other files need changes — every form in the app uses these shared components.


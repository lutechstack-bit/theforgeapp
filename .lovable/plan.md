
## Change Profile Tab from Pill to Rectangle Shape

### Problem
The profile button currently uses `rounded-full` which creates a pill-shaped button. The user wants a rectangular/tab-shaped appearance instead.

### Solution
Change the border radius from `rounded-full` to `rounded-lg` to create a modern rectangular tab with slightly rounded corners.

### Changes

#### `src/components/layout/TopProfileDropdown.tsx` (Line 49)
- Change `rounded-full` → `rounded-lg` in the button className

This gives the profile button a rectangular tab appearance while maintaining the gold outline and hover glow effect.

| File | Change |
|------|--------|
| `src/components/layout/TopProfileDropdown.tsx` | Replace `rounded-full` with `rounded-lg` on line 49 |


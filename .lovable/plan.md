
# Fix Plan: Resolve "Something Went Wrong" ErrorBoundary Crash

## Problem Identified

After login and page refresh, you see the "Something went wrong" error screen. This is caused by a **React Rules of Hooks violation** in the `CompactCountdownTimer.tsx` component.

---

## Root Cause

In `src/components/home/CompactCountdownTimer.tsx`:

**Lines 98-102** have an early return that exits BEFORE hooks are called:
```tsx
if (!edition) {
  return (...);  // ❌ Early return here
}

const progressPercent = useMemo(...)  // These hooks are skipped!
useEffect(...)                        // These hooks are skipped!
```

**React's Rule:** Hooks must be called in the exact same order on every render. You cannot conditionally skip hooks.

**What happens:**
1. First render: `edition` is `null` → early return → `useMemo` and `useEffect` never run
2. Second render: `edition` is available → hooks are now called for the first time
3. React detects inconsistent hook order → throws error
4. ErrorBoundary catches it → shows "Something went wrong"

---

## Solution

Move the hooks BEFORE the early return check. Use conditional logic inside the hooks to handle the null case gracefully.

### Changes to `src/components/home/CompactCountdownTimer.tsx`:

**Before (broken):**
```tsx
if (!edition) {
  return <LoadingPlaceholder />;
}

const progressPercent = useMemo(() => { ... }, [edition]);
useEffect(() => { ... }, [edition]);
```

**After (fixed):**
```tsx
// 1. All hooks FIRST (unconditionally)
const progressPercent = useMemo(() => {
  if (!edition?.forge_start_date) return 0;  // Handle null inside
  // ... calculation
}, [edition?.forge_start_date, timeLeft.days]);

useEffect(() => {
  if (!edition?.forge_start_date) return;  // Handle null inside
  // ... timer logic
}, [edition?.forge_start_date]);

// 2. THEN early return for loading state
if (!edition) {
  return <LoadingPlaceholder />;
}
```

---

## Implementation Details

1. **Move `useMemo` before the early return**
   - Already checks `if (!edition?.forge_start_date) return 0;` inside, so it's safe

2. **Move `useEffect` before the early return**
   - Already checks `if (!edition?.forge_start_date) return;` inside, so it's safe

3. **Keep the early return for rendering** - just move it after the hooks

---

## Files to Change

| File | Change |
|------|--------|
| `src/components/home/CompactCountdownTimer.tsx` | Move hooks before conditional return |

---

## Expected Outcome

1. **No more ErrorBoundary crash** on page refresh
2. Countdown timer shows loading placeholder while waiting for edition
3. Once edition loads, countdown displays correctly
4. All hooks are called consistently on every render

---

## Technical Note

This is a common React pitfall. The rule of hooks exists because React tracks hooks by their call order. When the order changes between renders, React cannot correctly associate state with the right hook, causing undefined behavior and crashes.

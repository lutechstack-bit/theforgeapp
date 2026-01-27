
# Fix: Smooth Mobile Sticky Notes & Task Interactions

## Problems Identified

### Problem 1: SwipeableTaskItem Gesture Lag
The swipe-to-complete gesture on task items feels laggy because:
- Touch handlers aren't memoized with `useCallback`
- No `requestAnimationFrame` for smooth 60fps animation during swipe
- Transition classes conflict during active swiping
- Missing proper touch action CSS to prevent browser scroll interference

### Problem 2: StickyNoteCardStack Jank
The card stack swiping has similar issues:
- Native touch handler dependency array causes re-registration on every render
- Missing velocity-based momentum for natural swipe feel
- Card transform updates aren't optimized

### Problem 3: Task Toggle Delay
When tapping the checkbox to complete/uncomplete a task:
- No optimistic UI update (waits for server response)
- No visual feedback during mutation
- Makes the interaction feel "laggy"

---

## Solution: Performance-Optimized Touch Interactions

### Part 1: Fix SwipeableTaskItem

**File:** `src/components/journey/SwipeableTaskItem.tsx`

Changes:
1. **Use `useCallback`** for all touch handlers to prevent re-creation
2. **Add `requestAnimationFrame`** for smooth transform updates
3. **Improve CSS** with proper `touch-action`, `will-change`, and transform hints
4. **Add velocity tracking** for momentum-based swipe completion
5. **Visual feedback** with scale animation during swipe
6. **Debounce rapid toggles** to prevent double-tapping bugs

```typescript
// Key improvements
const handleTouchMove = useCallback((e: React.TouchEvent) => {
  if (!isSwiping) return;
  
  requestAnimationFrame(() => {
    const deltaX = e.touches[0].clientX - startX.current;
    // Apply resistance for natural feel
    const resistance = deltaX > 0 ? 0.4 : 0.4;
    const dampedDelta = deltaX * resistance;
    setOffsetX(dampedDelta);
  });
}, [isSwiping]);

// CSS improvements
style={{
  touchAction: 'pan-y',
  willChange: isSwiping ? 'transform' : 'auto',
  transform: `translateX(${offsetX}px) scale(${isSwiping ? 0.98 : 1})`,
}}
```

### Part 2: Fix StickyNoteCardStack

**File:** `src/components/journey/StickyNoteCardStack.tsx`

Changes:
1. **Fix effect dependencies** to prevent handler re-registration
2. **Add velocity tracking** for natural momentum
3. **Use `requestAnimationFrame`** for smooth card movement
4. **Improve transform performance** with GPU acceleration hints
5. **Add haptic feedback** on successful swipe

```typescript
// Velocity-based swipe detection
const velocityRef = useRef(0);
const lastTimeRef = useRef(Date.now());

const handleTouchMove = useCallback((e: React.TouchEvent) => {
  const currentX = e.touches[0].clientX;
  const currentTime = Date.now();
  const timeDelta = currentTime - lastTimeRef.current;
  
  if (timeDelta > 0) {
    velocityRef.current = (currentX - lastXRef.current) / timeDelta;
  }
  
  lastXRef.current = currentX;
  lastTimeRef.current = currentTime;
  
  requestAnimationFrame(() => {
    const diff = currentX - startXRef.current;
    setDragOffset(diff);
  });
}, []);
```

### Part 3: Add Optimistic Updates to Task Toggle

**File:** `src/hooks/useStudentJourney.ts`

Changes:
1. **Add optimistic update** to immediately reflect state change
2. **Rollback on error** if server request fails
3. **Debounce rapid toggles** to prevent race conditions

```typescript
const toggleTask = useMutation({
  mutationFn: async ({ taskId, completed }) => {
    // ... existing logic
  },
  // Optimistic update for instant feedback
  onMutate: async ({ taskId, completed }) => {
    await queryClient.cancelQueries({ queryKey: ['user_journey_progress'] });
    
    const previousProgress = queryClient.getQueryData(['user_journey_progress', user?.id]);
    
    // Optimistically update the cache
    queryClient.setQueryData(['user_journey_progress', user?.id], (old: any) => {
      if (completed) {
        return [...(old || []), { task_id: taskId, status: 'completed' }];
      } else {
        return (old || []).filter((p: any) => p.task_id !== taskId);
      }
    });
    
    return { previousProgress };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['user_journey_progress', user?.id], context?.previousProgress);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['user_journey_progress'] });
    queryClient.invalidateQueries({ queryKey: ['user-prep-progress'] });
  },
});
```

### Part 4: Add Visual Feedback & Haptics

**File:** `src/components/journey/SwipeableTaskItem.tsx`

Add vibration feedback on successful swipe:

```typescript
const handleTouchEnd = useCallback(() => {
  setIsSwiping(false);
  
  const didComplete = offsetX >= SWIPE_THRESHOLD && !isCompleted;
  const didUncomplete = offsetX <= -SWIPE_THRESHOLD && isCompleted;
  
  if (didComplete || didUncomplete) {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
    onToggle();
  }
  
  setOffsetX(0);
}, [offsetX, isCompleted, onToggle]);
```

---

## Files to Modify

| File | Action |
|------|--------|
| `src/components/journey/SwipeableTaskItem.tsx` | Optimize touch handlers, add RAF, improve CSS |
| `src/components/journey/StickyNoteCardStack.tsx` | Fix effect dependencies, add velocity tracking |
| `src/hooks/useStudentJourney.ts` | Add optimistic updates to toggleTask mutation |

---

## Technical Details

### SwipeableTaskItem Improvements

```typescript
// Before (causes lag)
const handleTouchMove = (e: React.TouchEvent) => {
  if (!isSwiping) return;
  const deltaX = e.touches[0].clientX - startX.current;
  setOffsetX(boundedDelta); // Direct state update
};

// After (smooth 60fps)
const handleTouchMove = useCallback((e: React.TouchEvent) => {
  if (!isSwiping) return;
  
  // Use RAF for smooth animation
  requestAnimationFrame(() => {
    const deltaX = e.touches[0].clientX - startX.current;
    
    // Elastic resistance for natural feel
    let boundedDelta = deltaX;
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      const excess = Math.abs(deltaX) - SWIPE_THRESHOLD;
      boundedDelta = (deltaX > 0 ? 1 : -1) * (SWIPE_THRESHOLD + excess * 0.2);
    }
    
    setOffsetX(boundedDelta);
  });
}, [isSwiping]);
```

### CSS Performance Hints

```typescript
// Add these to the swiping container
style={{
  touchAction: 'pan-y',
  WebkitOverflowScrolling: 'touch',
  willChange: isSwiping ? 'transform' : 'auto',
  transform: `translateX(${offsetX}px)`,
  transition: isSwiping ? 'none' : 'transform 200ms ease-out',
}}
```

### Optimistic Update Pattern

```typescript
// Immediately show completion state
onMutate: async ({ taskId, completed }) => {
  // Cancel any in-flight queries
  await queryClient.cancelQueries({ queryKey: ['user_journey_progress'] });
  
  // Snapshot previous value
  const previous = queryClient.getQueryData(['user_journey_progress', user?.id]);
  
  // Optimistically update
  queryClient.setQueryData(['user_journey_progress', user?.id], (old) => {
    // Update logic
  });
  
  return { previous };
},
// Rollback if mutation fails
onError: (err, vars, context) => {
  queryClient.setQueryData(['user_journey_progress', user?.id], context.previous);
}
```

---

## Expected Results

1. **Smooth Swiping** - 60fps swipe animations using requestAnimationFrame
2. **Instant Feedback** - Optimistic updates show completion immediately
3. **Natural Feel** - Velocity-based momentum and elastic resistance
4. **Haptic Response** - Subtle vibration on successful swipe
5. **No Double-Toggle** - Debounced handlers prevent rapid-fire bugs
6. **GPU Acceleration** - Proper CSS hints for transform animations

---

## Mobile UX Improvements

- Swipe gesture feels responsive and native
- Checkbox tap immediately shows state change
- Card stack swiping has momentum like iOS
- Pull-to-refresh continues working smoothly
- No conflict between horizontal swipe and vertical scroll

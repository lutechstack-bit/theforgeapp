
# Remove Lock Feature from Pre Forge Sessions

## Summary
Remove all lock/premium gating from the Learn page so all Pre Forge Sessions are accessible to any logged-in user.

---

## Changes Required

### 1. `src/pages/Learn.tsx`

**Change A: Remove lock prop from LearnCourseCard**

At line 163, change:
```tsx
isLocked={item.is_premium && !isFullAccess}
```
To:
```tsx
isLocked={false}
```

**Change B: Remove premium check from card click handler**

At lines 94-100, change:
```tsx
const handleCardClick = (content: LearnContent) => {
  if (content.is_premium && !isFullAccess) {
    setShowUnlockModal(true);
    return;
  }
  navigate(`/learn/${content.id}`);
};
```
To:
```tsx
const handleCardClick = (content: LearnContent) => {
  navigate(`/learn/${content.id}`);
};
```

**Change C: Clean up unused imports and state**

Remove these since they're no longer needed:
- Line 48: `const [showUnlockModal, setShowUnlockModal] = useState(false);`
- Line 49: Remove `isFullAccess` from destructure (keep `user`)
- Lines 249-256: Remove the `UnlockModal` component
- Line 6: Remove `UnlockModal` import
- Line 19: Remove the `PAYMENT_LINK` constant

---

### 2. `src/components/learn/LearnCourseCard.tsx`

**Optional Cleanup:** Since `isLocked` will always be `false`, we could remove the lock-related code entirely:
- Line 3: Remove `Lock` from imports
- Lines 64-71: Remove the lock overlay JSX
- Line 74: Change condition from `duration && !isLocked` to just `duration`

---

## Files Summary

| File | Changes |
|------|---------|
| `src/pages/Learn.tsx` | Remove premium gating logic, unlock modal, and related state |
| `src/components/learn/LearnCourseCard.tsx` | Remove lock overlay code (cleanup) |

## Result
All Pre Forge Sessions will be immediately accessible to any logged-in user without lock icons or payment prompts.

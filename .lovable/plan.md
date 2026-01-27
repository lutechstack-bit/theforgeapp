
# Remove Floating Action Button Widget

## What's Being Removed
The yellow "+" floating action button (FAB) that appears in the bottom-right corner of the app. This button currently expands to show quick actions like "Set Reminder", "Mark Reviewed", and "Roadmap".

## Changes Required

### 1. Remove from JourneyBentoHero
**File:** `src/components/journey/JourneyBentoHero.tsx`

Remove lines 490-494:
```tsx
// DELETE these lines:
{/* Floating Action Button - Available on all devices */}
<FloatingActionButton
  onMarkAsReviewed={handleMarkAsReviewed}
  currentStageName={currentStage?.title}
/>
```

Also remove the import at the top of the file.

### 2. Remove Export
**File:** `src/components/journey/index.ts`

Remove the export line:
```tsx
// DELETE this line:
export { FloatingActionButton } from './FloatingActionButton';
```

### 3. Delete Component File (Optional Cleanup)
**File:** `src/components/journey/FloatingActionButton.tsx`

Delete the entire file as it's no longer needed.

---

## Files to Modify

| File | Action |
|------|--------|
| `src/components/journey/JourneyBentoHero.tsx` | Remove FAB usage and import |
| `src/components/journey/index.ts` | Remove export |
| `src/components/journey/FloatingActionButton.tsx` | Delete file |

## Result
The yellow "+" button will no longer appear anywhere in the app.

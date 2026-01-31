

# Simplify Homepage Journey Header with Personalized Welcome

## What We're Changing

Based on the screenshot, you want to replace the busy stats bar that shows:
- "Starts in" badge with countdown timer
- "Forge Writing · Writers" label
- "14d 11:21:09" countdown
- "6/7" progress indicator

With a clean, personalized welcome:
- "Hi [First Name]"
- "Your Writing Journey Starts Here" (or Filmmaking/Creating based on cohort)

---

## Visual Before → After

```text
BEFORE (current JourneyStats):
┌────────────────────────────────────────────────────────────────┐
│ [Starts in] Forge Writing · Writers  ⏱ 14d 11:21:09  📅 6/7 ━━ │
└────────────────────────────────────────────────────────────────┘

AFTER (clean welcome):
┌────────────────────────────────────────────────────────────────┐
│ Hi Keshav                                                      │
│ Your Writing Journey Starts Here                               │
└────────────────────────────────────────────────────────────────┘
```

---

## Implementation

### File: `src/components/home/HomeJourneySection.tsx`

**Changes:**
1. Replace the `JourneyStats` component with a new inline welcome section
2. Get user's first name from `profile.full_name`
3. Display cohort-specific journey label

**New Welcome UI:**

```tsx
// Get user's first name
const firstName = profile?.full_name?.split(' ')[0] || 'there';

// Get cohort-specific journey type
const getJourneyType = () => {
  switch (userCohortType) {
    case 'FORGE':
      return 'Filmmaking';
    case 'FORGE_CREATORS':
      return 'Creating';
    case 'FORGE_WRITING':
      return 'Writing';
    default:
      return 'Forge';
  }
};

// Replace JourneyStats with:
<div className="mb-6">
  <h1 className="text-2xl font-bold text-foreground">
    Hi {firstName}
  </h1>
  <p className="text-muted-foreground">
    Your {getJourneyType()} Journey Starts Here
  </p>
</div>
```

---

## Design Details

- **Typography**: Clean hierarchy with bold name greeting
- **Spacing**: Compact 1-2 lines, no extra padding
- **Mobile-friendly**: Works on all screen sizes
- **Cohort-aware**: Shows "Filmmaking" / "Creating" / "Writing" based on user's cohort

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/home/HomeJourneySection.tsx` | Replace `JourneyStats` with personalized welcome greeting |

---

## What's Preserved

- The `JourneyStats` component itself remains unchanged (used on full Roadmap page)
- Only the Homepage version gets the simplified welcome
- All other Homepage sections (mentors, alumni, learn, events) remain exactly as-is


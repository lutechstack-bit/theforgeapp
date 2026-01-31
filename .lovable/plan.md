
# Lock Cohort Selection for Admin-Assigned Users

## Summary
Prevent users who were added by admins (with a pre-assigned cohort/edition) from being able to select a different cohort during Profile Setup. The edition picker will be hidden for these users, showing only their assigned cohort in a read-only state.

---

## Current Problem

1. Admin creates user via edge function with specific `edition_id` (e.g., FORGE Filmmaking Batch 5)
2. User's profile is created with `edition_id` set, but `profile_setup_completed = false`
3. When user logs in for the first time, they're directed to ProfileSetup
4. ProfileSetup shows ALL available editions - user can select any cohort
5. User could accidentally (or intentionally) switch to a different cohort than what admin assigned

---

## Solution

In `ProfileSetup.tsx`, check if the user already has an `edition_id` in their profile. If yes:
- **Pre-select** that edition and **lock** it (no ability to change)
- Show a read-only view of their assigned cohort with a "locked" indicator
- Hide the full edition selection grid

---

## Implementation Details

### File: `src/pages/ProfileSetup.tsx`

**1. Detect if user has a pre-assigned edition** (around line 73-83)

```tsx
// Pre-fill name and email from auth/profile data
useEffect(() => {
  if (user) {
    setFormData(prev => ({
      ...prev,
      full_name: user.user_metadata?.full_name || profile?.full_name || prev.full_name,
      email: user.email || prev.email,
      avatar_url: profile?.avatar_url || prev.avatar_url,
      // Pre-fill edition_id if already assigned by admin
      edition_id: profile?.edition_id || prev.edition_id,
    }));
  }
}, [user, profile]);
```

**2. Determine if edition is pre-assigned and locked** (new logic around line 121)

```tsx
const selectedEdition = editions?.find(e => e.id === formData.edition_id);
// Check if user already had an edition assigned (by admin)
const hasPreAssignedEdition = !!profile?.edition_id;
const preAssignedEdition = editions?.find(e => e.id === profile?.edition_id);
```

**3. Conditionally render edition picker** (around lines 285-365)

If user has a pre-assigned edition:
- Show a locked card displaying their assigned cohort
- Include a small lock icon and "Assigned by admin" message
- Don't allow clicking/changing

If no pre-assigned edition:
- Show the full grid of available editions (current behavior)

```tsx
{/* Edition Selection */}
<div className="space-y-4">
  <div className="space-y-1">
    <Label className="text-lg font-semibold">Your Forge Edition</Label>
    {hasPreAssignedEdition ? (
      <p className="text-sm text-muted-foreground">
        You've been enrolled in this program
      </p>
    ) : (
      <p className="text-sm text-muted-foreground">
        Select the program and batch you want to join
      </p>
    )}
  </div>
  
  {editionsLoading ? (
    <LoadingSpinner />
  ) : hasPreAssignedEdition && preAssignedEdition ? (
    {/* Locked edition card - read only */}
    <div className="relative p-5 rounded-2xl border-2 border-primary bg-gradient-to-br from-primary/15 to-primary/5">
      <div className="absolute top-3 right-3 flex items-center gap-1.5 text-xs text-muted-foreground bg-secondary/80 px-2 py-1 rounded-full">
        <Lock className="h-3 w-3" />
        <span>Enrolled</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
          <Icon className="h-7 w-7" />
        </div>
        <div>
          <h3 className="font-bold text-lg">{preAssignedEdition.name}</h3>
          <div className="flex items-center gap-4 mt-1.5">
            <span className="text-sm text-muted-foreground">{preAssignedEdition.city}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary">{cohortLabel}</span>
          </div>
        </div>
      </div>
    </div>
  ) : (
    {/* Full edition grid - selectable (current behavior) */}
    <EditionGrid ... />
  )}
</div>
```

---

## Visual Comparison

**Before (Admin-Added User):**
```text
Choose Your Forge Edition *
Select the program and batch you want to join

[Filmmaking Batch 4 - Chennai]    ← Can click
[Filmmaking Batch 5 - Bangalore]  ← Can click  
[Writing Batch 2 - Mumbai]        ← Can click
[Creators Batch 1 - Hyderabad]    ← Can click
```

**After (Admin-Added User):**
```text
Your Forge Edition
You've been enrolled in this program

┌─────────────────────────────────────┐
│  🔒 Enrolled                        │
│                                      │
│  [🎬] Filmmaking Batch 5 - Bangalore│
│       Filmmaking · Mar 15-22, 2025  │
│                                      │
└─────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/ProfileSetup.tsx` | Add pre-assigned detection, conditional locked edition display, Lock icon import |

---

## User Flow Matrix

| User Type | Has `edition_id`? | Profile Setup Experience |
|-----------|-------------------|--------------------------|
| Self-signup | No | Full edition picker (choose any) |
| Admin-added | Yes | Locked edition card (no choice) |
| Admin-added (no edition) | No | Full edition picker |

---

## Technical Notes

- Uses existing `profile?.edition_id` from AuthContext
- Lock icon imported from lucide-react
- No database changes required
- Validation still requires `edition_id` - it just comes pre-filled for admin-added users
- Users can still update other fields (name, phone, city, avatar)

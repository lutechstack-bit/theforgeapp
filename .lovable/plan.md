
# Mobile Menu UI Overhaul: Seamless Profile Drawer

## Overview

This plan fixes the mobile menu sheet issues including padding problems, alignment issues, and restructures the navigation to be more intuitive with "Profile" instead of "Menu" in the bottom nav.

## Issues Identified

1. **Cohort Badge Showing** - Technical identifiers like "FORGE_WRITING" should be hidden for cleaner UI
2. **Profile Card Alignment** - Avatar and text are not properly aligned/centered
3. **Padding Issues** - Missing safe area handling in the sheet content causing scroll cutoff
4. **Duplicate Close Buttons** - SheetContent has default close button AND custom one
5. **"Menu" Label** - Should be "Profile" to be more intuitive
6. **Navigation Structure** - Needs cleaner spacing and proper safe area padding

---

## Part 1: Bottom Navigation Changes

Rename "Menu" to "Profile" in the bottom navigation bar for clearer user understanding.

**File:** `src/components/layout/BottomNav.tsx`

```text
Current:  "Menu" label
New:      "Profile" label
```

---

## Part 2: Sheet Content Fixes

### 2A: Remove Duplicate Close Button

The `sheet.tsx` component has a default close button, but `MobileMenuSheet` adds its own custom one. Need to suppress the default to avoid duplicate buttons.

**File:** `src/components/ui/sheet.tsx`

- Remove the default `SheetPrimitive.Close` from `SheetContent` component
- Let consumers handle their own close buttons for full control

### 2B: Add Safe Area Handling to Sheet

**File:** `src/components/layout/MobileMenuSheet.tsx`

- Add `safe-area-pt` and `safe-area-pb` classes to the sheet content
- Ensure proper padding at top and bottom for notched devices

---

## Part 3: Profile Card Redesign

Fix alignment issues and remove cohort badge (per brand guidelines).

**File:** `src/components/layout/MobileMenuSheet.tsx`

**Current issues:**
- Avatar and text not properly centered
- Cohort badge visible (should be hidden)
- Profile URL text too small

**Fixes:**
1. Remove `{edition?.cohort_type && (...)}` block (lines 97-101)
2. Center the profile card content horizontally
3. Improve avatar sizing and alignment
4. Make the chevron properly aligned to the right

**New Profile Card Layout:**
```text
┌─────────────────────────────────────────┐
│     ┌──────┐                            │
│     │ AV   │  Name                      │
│     │ ATAR │  theforgeapp.com/u/handle  │
│     └──────┘                        >   │
└─────────────────────────────────────────┘
```

---

## Part 4: Navigation Section Padding Fixes

Fix the navigation area to have proper spacing that works when scrolling.

**File:** `src/components/layout/MobileMenuSheet.tsx`

**Changes:**
1. Add consistent padding to nav container
2. Remove extra border-bottom from profile section
3. Reduce spacing between navigation items
4. Add proper safe area padding at bottom for the brand footer
5. Ensure the footer doesn't get cut off on notched devices

---

## Part 5: Overall Layout Structure

Update the sheet structure for seamless scrolling:

```text
┌─────────────────────────────────────────┐
│  safe-area-pt                           │
├─────────────────────────────────────────┤
│  Header: "Hi, [Name]! 👋"        [X]   │
├─────────────────────────────────────────┤
│  Profile Card (tappable)                │
│  ┌─────────────────────────────────────┐│
│  │ Avatar | Name + Handle           > ││
│  └─────────────────────────────────────┘│
├─────────────────────────────────────────┤
│  Navigation (scrollable flex-1)         │
│  ┌─────────────────────────────────────┐│
│  │ Perks                            > ││
│  │ Roadmap                          > ││
│  │ Learn                            > ││
│  │ Events                           > ││
│  │ Community                        > ││
│  │ About Forge                      > ││
│  │ Admin Panel (if admin)           > ││
│  └─────────────────────────────────────┘│
├─────────────────────────────────────────┤
│  Secondary Actions                      │
│  Settings                           >  │
│  Sign Out                              │
├─────────────────────────────────────────┤
│  Brand Footer (Forge logo)             │
│  safe-area-pb                           │
└─────────────────────────────────────────┘
```

---

## Files to Change

### 1. `src/components/ui/sheet.tsx`

**Changes:**
- Remove the default `SheetPrimitive.Close` button from `SheetContent`
- This allows consumers full control over close button placement

### 2. `src/components/layout/BottomNav.tsx`

**Changes:**
- Rename "Menu" label to "Profile" (line 94)

### 3. `src/components/layout/MobileMenuSheet.tsx`

**Changes:**
- Add safe area classes to SheetContent
- Remove cohort badge from profile card
- Fix profile card alignment (center avatar/text, proper flex layout)
- Update padding values for consistent spacing
- Ensure brand footer has safe area bottom padding
- Reduce excessive padding in sections
- Make scrollable area handle all content properly

---

## Technical Implementation Details

### Sheet Content Safe Area

```tsx
<SheetContent 
  side="right" 
  className="w-[85%] sm:max-w-md p-0 flex flex-col bg-background border-l border-border/50 safe-area-pt safe-area-pb"
>
```

### Updated Profile Card (Aligned)

```tsx
<div className="px-5 py-4">
  <button
    onClick={() => handleNavigation('/profile')}
    className="flex items-center gap-3 w-full p-3 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all duration-200 group"
  >
    <Avatar className="h-12 w-12 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all shrink-0">
      {/* ... */}
    </Avatar>
    <div className="flex-1 text-left min-w-0">
      <p className="font-semibold text-foreground truncate">
        {profile?.full_name || 'User'}
      </p>
      <p className="text-sm text-muted-foreground truncate">
        theforgeapp.com/u/{profile?.instagram_handle || 'profile'}
      </p>
    </div>
    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
  </button>
</div>
```

### Bottom Nav Profile Label

```tsx
<span className={cn(
  "text-[10px] font-medium tracking-wide",
  menuOpen && "font-semibold"
)}>Profile</span>
```

---

## Summary

| Issue | Fix | File |
|-------|-----|------|
| Cohort badge showing | Remove badge display | MobileMenuSheet.tsx |
| Profile alignment | Fix flex layout, add shrink-0 | MobileMenuSheet.tsx |
| Padding issues scrolling | Add safe-area classes | MobileMenuSheet.tsx |
| Duplicate close buttons | Remove default from sheet | sheet.tsx |
| "Menu" label | Rename to "Profile" | BottomNav.tsx |
| Seamless look | Reduce padding, consistent spacing | MobileMenuSheet.tsx |

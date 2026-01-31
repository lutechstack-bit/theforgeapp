
# Admin Cohort Switcher - Floating Button

## Summary
Add a floating cohort switcher button for admins that allows them to preview the app from the perspective of different cohorts (Filmmakers, Writers, Creators). This button will be positioned **above** the existing "View" (FloatingHighlightsButton) and AdminTestingPanel buttons, creating a vertical stack of admin tools.

---

## Current Layout (Bottom-Right Corner)

```text
┌─────────────────────────────┐
│                             │
│            App              │
│                             │
│                             │
│                             │
│             ┌───────────┐   │
│             │  Testing  │ ← bottom-24 (AdminTestingPanel, admin only)
│             └───────────┘   │
│             ┌───────────┐   │
│             │   View    │ ← bottom-24 (FloatingHighlightsButton, mobile only)
│             └───────────┘   │
│  ─────────────────────────  │ ← BottomNav at bottom-0
└─────────────────────────────┘
```

## New Layout (With Cohort Switcher)

```text
┌─────────────────────────────┐
│                             │
│            App              │
│                             │
│                             │
│             ┌───────────┐   │
│             │  Cohort   │ ← bottom-40 (NEW - Admin only)
│             └───────────┘   │
│             ┌───────────┐   │
│             │  Testing  │ ← bottom-24 (AdminTestingPanel)
│             └───────────┘   │
│             ┌───────────┐   │
│             │   View    │ ← bottom-24 (Mobile users only)
│             └───────────┘   │
│  ─────────────────────────  │ ← BottomNav
└─────────────────────────────┘
```

---

## Implementation Approach

### Option 1: Extend AdminTestingContext (Recommended)

Add `simulatedCohortType` to the existing AdminTestingContext so the cohort simulation works alongside the existing forge mode and day simulations.

### Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/contexts/AdminTestingContext.tsx` | Modify | Add `simulatedCohortType` state and setter |
| `src/components/admin/AdminCohortSwitcher.tsx` | Create | New floating button component |
| `src/hooks/useRoadmapData.ts` | Modify | Use simulated cohort when in testing mode |
| `src/pages/Home.tsx` | Modify | Import and render AdminCohortSwitcher |
| `src/components/roadmap/RoadmapLayout.tsx` | Modify | Import and render AdminCohortSwitcher |

---

## Component Design: AdminCohortSwitcher

A floating button positioned at `bottom-40 right-4` (16 units above the testing panel) that:
1. Shows a compact button with the current cohort's icon/logo
2. On click, expands to show all 3 cohort options in a radial/vertical menu
3. Selecting a cohort updates `simulatedCohortType` in context
4. Shows a visual indicator when viewing a different cohort than the user's actual cohort

### Visual Design

**Collapsed State:**
```text
┌─────────────┐
│ 🎬 FORGE    │  ← Shows current/simulated cohort logo + short name
└─────────────┘
```

**Expanded State:**
```text
┌──────────────────────┐
│ View as Cohort       │
├──────────────────────┤
│ ✓ 🎬 Filmmaking      │ ← Active cohort has checkmark
│   ✍️ Writing         │
│   📱 Creators        │
├──────────────────────┤
│ ↻ Reset to My Cohort │
└──────────────────────┘
```

---

## Technical Details

### 1. Extend AdminTestingContext

```tsx
// Add to state
simulatedCohortType: CohortType | null;

// Add setter
setSimulatedCohortType: (cohort: CohortType | null) => void;

// Add to resetToRealTime
simulatedCohortType: null
```

### 2. AdminCohortSwitcher Component

```tsx
// src/components/admin/AdminCohortSwitcher.tsx

import React, { useState } from 'react';
import { Film, PenTool, Users, X, RotateCcw } from 'lucide-react';
import { useAdminTesting } from '@/contexts/AdminTestingContext';
import { useAuth } from '@/contexts/AuthContext';
import { CohortType } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import forgeLogoImg from '@/assets/forge-logo.png';
import forgeWritingLogoImg from '@/assets/forge-writing-logo.png';
import forgeCreatorsLogoImg from '@/assets/forge-creators-logo.png';

const cohortOptions: { type: CohortType; label: string; logo: string; icon: typeof Film }[] = [
  { type: 'FORGE', label: 'Filmmaking', logo: forgeLogoImg, icon: Film },
  { type: 'FORGE_WRITING', label: 'Writing', logo: forgeWritingLogoImg, icon: PenTool },
  { type: 'FORGE_CREATORS', label: 'Creators', logo: forgeCreatorsLogoImg, icon: Users },
];

const AdminCohortSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { simulatedCohortType, setSimulatedCohortType, isTestingMode } = useAdminTesting();
  const { edition } = useAuth();
  
  const actualCohort = edition?.cohort_type as CohortType | undefined;
  const displayedCohort = simulatedCohortType || actualCohort || 'FORGE';
  const isSimulating = simulatedCohortType && simulatedCohortType !== actualCohort;
  
  // ... component rendering
};
```

### 3. Update useRoadmapData Hook

```tsx
// In useRoadmapData.ts
const { simulatedCohortType } = useAdminTestingSafe();

// Use simulated cohort if admin is testing
const userCohortType = isTestingMode && simulatedCohortType 
  ? simulatedCohortType 
  : edition?.cohort_type as CohortType | undefined;
```

### 4. Integration Points

- **Home.tsx**: Add AdminCohortSwitcher alongside FloatingHighlightsButton
- **RoadmapLayout.tsx**: Add AdminCohortSwitcher below the AdminTestingPanel import

---

## Behavior

| User State | Cohort Display | Data Fetched |
|------------|----------------|--------------|
| Regular user | Their cohort | Their cohort's content |
| Admin (no simulation) | Their cohort | Their cohort's content |
| Admin (simulating FORGE_WRITING) | Writing indicator | Writing cohort's content |

---

## Session Persistence

The simulated cohort will be stored in `sessionStorage` alongside other admin testing state, so it persists across page navigations but clears on browser close.

---

## Safety Features

1. Only visible to users with admin role (uses `useAdminCheck`)
2. Clear visual indicator when viewing simulated cohort (colored ring/badge)
3. Quick "Reset to My Cohort" action
4. No actual data changes - simulation is read-only

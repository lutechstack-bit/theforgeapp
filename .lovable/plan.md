
# Admin Roadmap Testing Mode

## Overview
Create a dedicated admin testing feature that allows admins to simulate different forge modes (PRE_FORGE, DURING_FORGE, POST_FORGE) and test the roadmap experience without waiting for actual cohort dates.

---

## Problem Statement

Currently, the forge mode is calculated automatically based on:
- `edition.forge_start_date`
- `edition.forge_end_date`
- Current date via `calculateForgeMode()` in `src/lib/forgeUtils.ts`

This means admins cannot test:
1. **PRE_FORGE state** - How the roadmap looks before the cohort starts
2. **DURING_FORGE state** - How online sessions (Days 1-3) and physical sessions work
3. **POST_FORGE state** - The completed journey archive view
4. **Different day statuses** - Completed, current, upcoming, locked

---

## Solution Architecture

```text
┌─────────────────────────────────────────────────────────────────────┐
│                     ADMIN TESTING PANEL                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐   │
│  │   PRE_FORGE      │  │   DURING_FORGE   │  │   POST_FORGE     │   │
│  │   ○ Selected     │  │   ○              │  │   ○              │   │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Simulate Date: [ 2025-02-15 ]  Simulate Day: [ Day 5 ]        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  [ Apply Simulation ]  [ Reset to Real Time ]                        │
│                                                                      │
│  ⚠️ Testing mode active - Other users see real data                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Part 1: Fix PWA Build Error

**File: `vite.config.ts`**

The build is failing because large assets can't be precached. We need to:
1. Disable the strict error by using `disableDevLogs` and `skipWaiting`
2. Or switch to `injectManifest` mode with better control

```typescript
workbox: {
  globPatterns: ["**/*.{js,css,html,ico,svg,woff2}"],
  globIgnores: ["**/images/mentors/**", "**/assets/*.js"],
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
  // Add this to prevent build failure on large files
  navigateFallback: null,
  runtimeCaching: [
    // Existing config...
    // Add JS bundle caching as runtime instead of precache
    {
      urlPattern: /\.js$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "js-cache",
        expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 },
      },
    },
  ],
},
```

### Part 2: Create Admin Testing Context

**New File: `src/contexts/AdminTestingContext.tsx`**

```typescript
interface AdminTestingState {
  isTestingMode: boolean;
  simulatedForgeMode: 'PRE_FORGE' | 'DURING_FORGE' | 'POST_FORGE' | null;
  simulatedDate: Date | null;
  simulatedDayNumber: number | null;
}

// Context that stores admin simulation settings
// Only applies to the current admin's session
// Uses sessionStorage to persist across page refreshes
```

### Part 3: Create Admin Testing Panel Component

**New File: `src/components/admin/AdminTestingPanel.tsx`**

A floating/dismissible panel that appears on the roadmap page for admins:
- Toggle test mode on/off
- Select forge mode (PRE_FORGE, DURING_FORGE, POST_FORGE)
- Set simulated date picker
- Set current day number slider
- Quick presets: "Day 1 Online", "Day 3 Transition", "Day 7 Physical", "Post-Forge"
- Visual indicator when testing mode is active

### Part 4: Update ForgeMode Calculation

**File: `src/lib/forgeUtils.ts`**

```typescript
export function calculateForgeMode(
  forgeStartDate: string | null | undefined,
  forgeEndDate: string | null | undefined,
  simulatedMode?: 'PRE_FORGE' | 'DURING_FORGE' | 'POST_FORGE' | null,
  simulatedDate?: Date | null
): ForgeMode {
  // If admin has simulation active, use that
  if (simulatedMode) {
    return simulatedMode;
  }
  
  // Use simulated date if provided, otherwise use real time
  const now = simulatedDate || new Date();
  // ... rest of existing logic
}
```

### Part 5: Update AuthContext to Support Testing

**File: `src/contexts/AuthContext.tsx`**

Integrate the admin testing context so `forgeMode` can be overridden:

```typescript
const { simulatedForgeMode, simulatedDate, isTestingMode } = useAdminTesting();

const forgeMode = isTestingMode && isAdmin
  ? calculateForgeMode(edition?.forge_start_date, edition?.forge_end_date, simulatedForgeMode, simulatedDate)
  : calculateForgeMode(edition?.forge_start_date, edition?.forge_end_date);
```

### Part 6: Update useRoadmapData Hook

**File: `src/hooks/useRoadmapData.ts`**

```typescript
const getDayStatus = (day: RoadmapDay): Status => {
  // If admin has simulated day number, calculate status based on that
  if (isTestingMode && simulatedDayNumber !== null) {
    if (day.day_number < simulatedDayNumber) return 'completed';
    if (day.day_number === simulatedDayNumber) return 'current';
    return 'upcoming';
  }
  // ... existing logic
};
```

### Part 7: Add Admin Testing to Roadmap Layout

**File: `src/components/roadmap/RoadmapLayout.tsx`**

```typescript
import { useAdminCheck } from '@/hooks/useAdminCheck';
import AdminTestingPanel from '@/components/admin/AdminTestingPanel';

const RoadmapLayout: React.FC = () => {
  const { isAdmin } = useAdminCheck();
  
  return (
    <div>
      {/* Floating admin panel - only visible to admins */}
      {isAdmin && <AdminTestingPanel />}
      
      {/* Rest of layout... */}
    </div>
  );
};
```

---

## Testing Panel UI Design

```text
┌────────────────────────────────────────────────────────┐
│ 🔧 Admin Testing Mode                            [×]   │
├────────────────────────────────────────────────────────┤
│                                                        │
│ Forge Mode:                                           │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐               │
│ │ PRE      │ │ DURING   │ │ POST     │               │
│ └──────────┘ └──────────┘ └──────────┘               │
│                                                        │
│ Current Day: Day 5 of 14                              │
│ [━━━━━━━●━━━━━━━━━━━━━━━━━━━━━] 5                     │
│                                                        │
│ Quick Presets:                                        │
│ [Online Day 1] [Online Day 3] [Physical Day 5]       │
│ [Physical Day 10] [Last Day] [Post-Forge]            │
│                                                        │
│ ┌──────────────────────────────────────────────────┐  │
│ │ 🟢 Testing mode active                           │  │
│ │ Only YOU see simulated data                      │  │
│ └──────────────────────────────────────────────────┘  │
│                                                        │
│ [Reset to Real Time]                                  │
└────────────────────────────────────────────────────────┘
```

---

## Session-Based Storage (Not Database)

The testing state uses `sessionStorage` instead of database:
- **Pros**: No database changes, instant switching, session-isolated
- **Cons**: Resets on browser close (which is actually a safety feature)

```typescript
// Stored in sessionStorage
{
  "adminTestingMode": {
    "isActive": true,
    "forgeMode": "DURING_FORGE",
    "currentDay": 5,
    "simulatedDate": "2025-02-10T00:00:00Z"
  }
}
```

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `vite.config.ts` | Modify | Fix PWA build error with large assets |
| `src/contexts/AdminTestingContext.tsx` | Create | Context for admin testing state |
| `src/components/admin/AdminTestingPanel.tsx` | Create | Floating testing panel UI |
| `src/lib/forgeUtils.ts` | Modify | Accept simulated mode/date parameters |
| `src/contexts/AuthContext.tsx` | Modify | Integrate admin testing context |
| `src/hooks/useRoadmapData.ts` | Modify | Support simulated day numbers |
| `src/components/roadmap/RoadmapLayout.tsx` | Modify | Add admin testing panel |
| `src/App.tsx` | Modify | Wrap app with AdminTestingProvider |

---

## Expected Testing Scenarios

After implementation, admins can test:

1. **PRE_FORGE View**: See how students experience the countdown and muted UI
2. **Online Sessions (Days 1-3)**: Test the online_forge stage UI
3. **Physical Sessions (Days 4+)**: Test the physical_forge stage UI  
4. **Day Transitions**: Test moving between completed/current/upcoming states
5. **POST_FORGE Archive**: Test the completed journey view

---

## Safety Features

- Testing mode only affects the admin's own view
- Visual indicator always shows when testing mode is active
- "Reset to Real Time" button instantly returns to live data
- Session-based storage ensures no database pollution
- Other users always see real data

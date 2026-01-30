
# Comprehensive Layout Restructure: KY Form Completion + Home Page Widget Layout

## Summary

This plan addresses three main areas:
1. **KY Form Completion Page** - Add a dedicated completion state/page for all KY forms (already exists as `KYFormCompletion` component)
2. **Home Page Widget Consolidation** - Move the announcement banner + KY form reminder into a compact top-right widget, eliminating unused side space
3. **Clean Layout Architecture** - Fix padding/spacing issues for a clean, mobile-first experience

---

## Current State Analysis

| Component | Current Location | Issue |
|-----------|-----------------|-------|
| `AnnouncementBanner` | Inside `JourneyBentoHero`, below greeting | Takes full width, creates visual clutter above sticky notes |
| `KYFormReminderCard` | Not used on Home page | Exists but not integrated with Home layout |
| `KYFormReminderBanner` | Separate component | Not visible in current Home page |
| `CompactCountdownTimer` | Top of Home page | Good position, keep as-is |
| Desktop Layout | `grid-cols-[1fr_320px]` | Side panel has gaps, can be better utilized |

---

## Solution Architecture

### 1. KY Form Completion (Already Exists)

The `KYFormCompletion` component already exists at `src/components/kyform/KYFormCompletion.tsx` and is properly integrated into all three forms:
- `KYFForm.tsx` - Shows completion screen on submit
- `KYCForm.tsx` - Shows completion screen on submit  
- `KYWForm.tsx` - Shows completion screen on submit

**No changes needed** - completion flow is already implemented.

---

### 2. Home Page Widget Consolidation

Create a new **Status Widget Card** for the desktop side panel that combines:
- KY Form reminder (if incomplete)
- Smart announcements (rotating)
- Quick stats/info

**Desktop Layout Restructure:**
```
+------------------------------------------+
|  Compact Countdown Timer (full width)    |
+------------------------------------------+
|                                          |
|  +----------------------------+  +-----+ |
|  | Current Stage Card        |  |Status| |
|  | (Tasks, filters, etc)     |  |Widget| |
|  |                           |  |-----||
|  +----------------------------+  |KYF  || |
|                                  |Annc.|| |
|  +----------------------------+  |-----||
|  | Personal Note Card        |  |Note || |
|  +----------------------------+  +-----+ |
|                                          |
|  +----------------------------+  +-----+ |
|  | Completed Stage           |  |Upcom|| |
|  +----------------------------+  +-----+ |
|                                          |
+------------------------------------------+
```

**Mobile Layout:**
```
+----------------------------------+
| Compact Countdown Timer          |
+----------------------------------+
| Greeting + Streak Badge          |
+----------------------------------+
| Stage Navigation Strip           |
+----------------------------------+
| Status Widget (Compact)          |
| [KYF Reminder] [Announcements]   |
+----------------------------------+
| Stacked Card UI (stages)         |
+----------------------------------+
| Quick Actions Row                |
+----------------------------------+
| Personal Note Card               |
+----------------------------------+
```

---

### 3. New Component: StatusWidget

Create a compact status widget that consolidates multiple notification types:

```tsx
// src/components/home/StatusWidget.tsx

interface StatusWidgetProps {
  variant: 'desktop' | 'mobile';
}

export const StatusWidget: React.FC<StatusWidgetProps> = ({ variant }) => {
  // Shows in order of priority:
  // 1. KYF Reminder (if incomplete) - prominent
  // 2. Smart Announcements (cycling)
  
  return (
    <div className={cn(
      "glass-card rounded-xl overflow-hidden",
      variant === 'desktop' ? "space-y-2" : "flex gap-2"
    )}>
      {/* KY Form Reminder - if incomplete */}
      {showKYFormReminder && (
        <button onClick={navigateToKYForm} className="...">
          <ClipboardList />
          <span>Complete KY Form</span>
          <span className="animate-ping" /> {/* pulsing badge */}
        </button>
      )}
      
      {/* Announcements - compact version */}
      {announcements.length > 0 && (
        <div className="...">
          <span>{currentAnnouncement.icon}</span>
          <span>{currentAnnouncement.title}</span>
        </div>
      )}
    </div>
  );
};
```

---

### 4. JourneyBentoHero Layout Changes

**Desktop Changes:**
- Move `AnnouncementBanner` from main flow to side panel
- Add `StatusWidget` to side panel (top position)
- Adjust grid: Keep `grid-cols-[1fr_320px]` but reorganize content

**Mobile Changes:**
- Add compact `StatusWidget` after stage navigation strip
- Remove full-width `AnnouncementBanner` from flow
- Tighter spacing between elements

---

## Technical Implementation

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/home/StatusWidget.tsx` | Combined notification/status widget |

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/journey/JourneyBentoHero.tsx` | Integrate StatusWidget, remove inline AnnouncementBanner, adjust layout |
| `src/pages/Home.tsx` | No changes needed (JourneyBentoHero handles it) |

---

## StatusWidget Component Design

```tsx
// Key features:
// 1. Conditional KY Form reminder (if profile.ky_form_completed === false)
// 2. Smart announcements from useSmartAnnouncements hook
// 3. Compact, single-row design for mobile, stacked for desktop side panel

const StatusWidget: React.FC<{ variant: 'desktop' | 'mobile' }> = ({ variant }) => {
  const { profile, edition } = useAuth();
  const navigate = useNavigate();
  const { announcements } = useSmartAnnouncements();
  
  const showKYForm = profile?.profile_setup_completed && !profile?.ky_form_completed;
  
  const getKYFormRoute = () => {
    switch (edition?.cohort_type) {
      case 'FORGE': return '/kyf-form';
      case 'FORGE_CREATORS': return '/kyc-form';
      case 'FORGE_WRITING': return '/kyw-form';
      default: return '/kyf-form';
    }
  };
  
  const getKYFormLabel = () => {
    switch (edition?.cohort_type) {
      case 'FORGE': return 'Know Your Filmmaker';
      case 'FORGE_CREATORS': return 'Know Your Creator';
      case 'FORGE_WRITING': return 'Know Your Writer';
      default: return 'Complete Form';
    }
  };
  
  // Desktop: Stacked card design
  if (variant === 'desktop') {
    return (
      <div className="space-y-3">
        {/* KY Form Card */}
        {showKYForm && (
          <button
            onClick={() => navigate(getKYFormRoute())}
            className="w-full glass-card rounded-xl p-4 flex items-center gap-3 
                       border border-primary/30 bg-primary/10 
                       hover:bg-primary/20 transition-all group"
          >
            <div className="p-2 bg-primary/20 rounded-lg">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-foreground text-sm">{getKYFormLabel()}</p>
              <p className="text-xs text-muted-foreground">Required for full access</p>
            </div>
            <div className="relative">
              <span className="w-2 h-2 bg-primary rounded-full animate-ping absolute" />
              <span className="w-2 h-2 bg-primary rounded-full" />
            </div>
          </button>
        )}
        
        {/* Compact Announcements */}
        {announcements.length > 0 && (
          <CompactAnnouncementSlot announcements={announcements} />
        )}
      </div>
    );
  }
  
  // Mobile: Horizontal compact design
  return (
    <div className="flex gap-2">
      {showKYForm && (
        <button
          onClick={() => navigate(getKYFormRoute())}
          className="flex-1 glass-card rounded-xl px-3 py-2.5 flex items-center gap-2 
                     border border-primary/30 bg-primary/10"
        >
          <ClipboardList className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground truncate">
            Complete KY Form
          </span>
          <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
        </button>
      )}
      
      {announcements.length > 0 && (
        <button className="flex-1 glass-card rounded-xl px-3 py-2.5 flex items-center gap-2">
          <span className="text-sm">{announcements[0].icon}</span>
          <span className="text-sm truncate">{announcements[0].title}</span>
        </button>
      )}
    </div>
  );
};
```

---

## JourneyBentoHero Changes

### Desktop Grid Restructure

**Before:**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
  {/* Main: Current Stage */}
  {/* Side: PersonalNote, Completed, Upcoming */}
</div>
```

**After:**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
  {/* Main Column */}
  <div className="space-y-4">
    {/* Current Stage Card (expanded) */}
  </div>
  
  {/* Side Panel - Better organized */}
  <div className="space-y-3">
    {/* Status Widget (KYF + Announcements) */}
    <StatusWidget variant="desktop" />
    
    {/* Personal Note */}
    <PersonalNoteCard />
    
    {/* Completed Stage (collapsed) */}
    {/* Upcoming Stage (collapsed) */}
  </div>
</div>
```

### Mobile Layout Restructure

**Before:**
```tsx
{/* Greeting */}
{/* AnnouncementBanner - FULL WIDTH */}
{/* Stage Navigation */}
{/* Card Stack */}
{/* Quick Actions */}
{/* Personal Note */}
```

**After:**
```tsx
{/* Greeting */}
{/* Stage Navigation */}
{/* Status Widget - COMPACT HORIZONTAL */}
{/* Card Stack */}
{/* Quick Actions */}
{/* Personal Note */}
```

---

## Spacing & Padding Fixes

### Global Fixes in JourneyBentoHero:

1. **Reduce gap between elements**: `space-y-4` → `space-y-3`
2. **Tighter mobile card stack**: `min-h-[280px]` → `min-h-[260px]`
3. **Remove extra margins**: Clean up `mt-2`, `mb-4` scattered margins

### Remove Announcement Banner from Current Position:

```tsx
// REMOVE this line:
<AnnouncementBanner className="mt-2" />

// The StatusWidget now handles announcements
```

---

## Files Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/home/StatusWidget.tsx` | **Create** | New combined status/notification widget |
| `src/components/journey/JourneyBentoHero.tsx` | **Modify** | Integrate StatusWidget, remove AnnouncementBanner, adjust grid layout |

---

## Visual Result

### Desktop
- Side panel now has Status Widget at top (KYF reminder + announcements)
- Personal note below status widget
- Completed/upcoming stages at bottom
- Main area focuses on current stage tasks

### Mobile
- Compact horizontal status bar after navigation strip
- Quick access to KY form (if incomplete) and announcements
- No wasted space, clean flow from top to bottom
- Tighter spacing for better content density

---

## Benefits

1. **Consolidated Notifications** - One widget for all status items
2. **Better Space Utilization** - Side panel fully used on desktop
3. **Cleaner Mobile Experience** - Compact status bar, no full-width banners
4. **Priority Visibility** - KY form reminder prominently displayed when needed
5. **No Layout Shifts** - Consistent spacing with no padding/sizing issues

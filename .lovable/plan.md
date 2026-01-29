

# Mobile Navigation & Perks Access — User-Friendly Redesign

## Analysis & Recommendation

After reviewing your app structure, here's the most **friction-free** approach:

| Page | Desktop | Mobile (Current) | Mobile (Proposed) |
|------|---------|------------------|-------------------|
| Home | ✅ | ✅ | ✅ |
| Roadmap | ✅ SideNav | ❌ | ✅ Add to BottomNav |
| Perks | ✅ SideNav | ❌ | ✅ Access via Profile |
| Learn | ✅ | ✅ | ✅ |
| Events | ✅ | ✅ | ✅ |
| Community | ✅ | ✅ BottomNav | Move to Home/Secondary |
| Profile | ✅ | ✅ | ✅ |

### Why This Approach?

1. **Roadmap in BottomNav** — High-frequency action for enrolled students; needs quick access
2. **Perks inside Profile** — Logically connected to "your" acceptance, bag, and membership status
3. **Community → Secondary** — Can be accessed via Home page or SideNav; less frequent action
4. **5 items = Optimal UX** — More than 5 cramped icons reduces tap accuracy and looks cluttered

---

## 1. Mobile Bottom Navigation Update

### New Navigation Order (5 items)
| Position | Icon | Label | Route |
|----------|------|-------|-------|
| 1 | Home | Home | `/` |
| 2 | Map | Roadmap | `/roadmap` |
| 3 | BookOpen | Learn | `/learn` |
| 4 | Calendar | Events | `/events` |
| 5 | User | Profile | `/profile` |

**Change**: Replace Community with Roadmap

### File: `src/components/layout/BottomNav.tsx`
```tsx
import { Home, Map, BookOpen, Calendar, User } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/roadmap', icon: Map, label: 'Roadmap' },
  { to: '/learn', icon: BookOpen, label: 'Learn' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/profile', icon: User, label: 'Profile' },
];
```

---

## 2. Perks Access from Profile Page

Add a **premium "My Perks" card** at the top of the Profile page that links to `/perks`.

### Visual Design
```text
┌─────────────────────────────────────────┐
│  🎁  My Perks & Acceptance Letter       │
│      View your Forge Bag & benefits  →  │
└─────────────────────────────────────────┘
```

### Implementation
Create a new component and add it to Profile page:

```tsx
// New: PerksQuickAccess component
<Link to="/perks">
  <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-all group">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
      <Gift className="h-5 w-5 text-primary" />
    </div>
    <div className="flex-1">
      <h3 className="font-semibold text-foreground text-sm">My Perks & Acceptance</h3>
      <p className="text-xs text-muted-foreground">View your Forge Bag & benefits</p>
    </div>
    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
  </div>
</Link>
```

### Placement in Profile Page
Add immediately after ProfileHero (top of content area) for maximum visibility.

---

## 3. Community Access Points (Secondary)

Since Community is being removed from BottomNav, ensure it's accessible via:

### A. WhatYouCanDoHere Component (Already exists)
The existing component already has Community as a feature card — new users will discover it here.

### B. Add to Home Page Header (Optional)
A small "Community" quick-access button in the home page for returning users.

---

## 4. Shareable Acceptance Letter

### Current Issue
Share button only shares text — no visual image.

### Solution
Create a **shareable acceptance card** using `html2canvas`:

1. **Generate branded PNG image** of the acceptance letter
2. **Use Web Share API** to share image directly to social media
3. **Download fallback** for desktop browsers

### New Component: `AcceptanceShareCard.tsx`

```tsx
import html2canvas from 'html2canvas';

const AcceptanceShareCard = ({ userName, cohortType, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, {
      backgroundColor: '#0a0a0a',
      scale: 2,
    });
    const link = document.createElement('a');
    link.download = 'forge-acceptance.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    const canvas = await html2canvas(cardRef.current, { scale: 2 });
    const blob = await new Promise<Blob>((resolve) => 
      canvas.toBlob((b) => resolve(b!), 'image/png')
    );
    const file = new File([blob], 'forge-acceptance.png', { type: 'image/png' });
    
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        text: 'I got accepted into Forge! 🎬 #ForgeAccepted',
        files: [file],
      });
    } else {
      handleDownload();
    }
  };

  return (
    <Dialog>
      {/* Shareable card design */}
      <div ref={cardRef} className="p-8 bg-gradient-to-br from-card to-background">
        <h1>FORGE</h1>
        <p>Letter of Acceptance</p>
        <p>Congratulations, {userName}!</p>
        <p>Forge {cohortType} Cohort 2026</p>
        <p>#ForgeAccepted</p>
      </div>
      
      <div className="flex gap-3">
        <Button onClick={handleDownload}>Download PNG</Button>
        <Button onClick={handleShare}>Share</Button>
      </div>
    </Dialog>
  );
};
```

---

## File Changes Summary

| File | Action | Purpose |
|------|--------|---------|
| `src/components/layout/BottomNav.tsx` | UPDATE | Replace Community with Roadmap |
| `src/pages/Profile.tsx` | UPDATE | Add Perks quick-access card |
| `src/components/profile/PerksQuickAccess.tsx` | CREATE | New component for Perks link |
| `src/pages/Perks.tsx` | UPDATE | Add functional share with image |
| `src/components/perks/AcceptanceShareCard.tsx` | CREATE | Shareable acceptance image modal |

---

## Visual Summary

### Mobile Bottom Nav (After)
```text
┌─────────────────────────────────────────┐
│  🏠     🗺️      📚      📅      👤      │
│ Home  Roadmap  Learn  Events  Profile   │
└─────────────────────────────────────────┘
```

### Profile Page (New Perks Card)
```text
┌─────────────────────────────────────────┐
│ [Profile Hero]                          │
├─────────────────────────────────────────┤
│ 🎁 My Perks & Acceptance Letter      →  │
│    View your Forge Bag & benefits       │
├─────────────────────────────────────────┤
│ [About Section]                         │
│ [Works Section]                         │
│ ...                                     │
└─────────────────────────────────────────┘
```

---

## Dependency Note

For image generation, we'll use `html2canvas` which is included with the existing `html2pdf.js` package. No additional dependencies needed.



# Content Updates Based on Design References

## Summary of Changes

Based on the 4 reference images, here are the content changes needed:

---

## 1. Learn Page (`src/pages/Learn.tsx`)

| Section | Current | New |
|---------|---------|-----|
| Page Title | "Pre Forge Sessions" | Keep as is |
| Pre Forge Sessions Subtitle | "Exclusive sessions to prepare you for the Forge" | **"Filmmaking fundamentals: For forge and Beyond"** |
| Community Sessions Title | "Community Sessions" | **"More from LevelUp"** |
| Community Sessions Subtitle | "Workshops and masterclasses from industry leaders" | **"Online sessions exclusive with LevelUp"** |

---

## 2. Perks Page (`src/pages/Perks.tsx`)

| Section | Change |
|---------|--------|
| Alumni Network Card | Add link text below: **"Join Community to be linked here"** linking to `/community` |
| Footer Note | Add text: **"Digital perks can be requested by emailing LevelUp"** |

---

## 3. Home Page - Learn & Events Sections (`src/pages/Home.tsx`)

| Section | Current | New |
|---------|---------|-----|
| Learn Section Title | "Learn" | **"Fundamental learning for forge and beyond"** |
| Events Section Title | "Featured Events" / "Past Events" | **"More from LevelUp"** |

---

## 4. Quick Actions Row (`src/components/journey/QuickActionsRow.tsx`)

| Action | Current Description | New Description |
|--------|---------------------|-----------------|
| Open Community | "Connect with peers" | **"Join the community"** |
| Watch Classes | "Continue learning" | **"Forge fundamentals"** |

---

## 5. Roadmap Bento Box (`src/components/home/RoadmapBentoBox.tsx`)

| Change |
|--------|
| **Remove the "Where You'll Stay" card entirely** (the 3 locations section) |
| Keep only "Past Moments" and "Student Films" |

---

## Visual Summary

### Learn Page
```
┌──────────────────────────────────────────────────────┐
│ 🎬 Pre Forge Sessions                                │
│ Learn from industry experts and breakthrough...     │
│                                                      │
│ Pre Forge Sessions                      [View All]  │
│ Filmmaking fundamentals: For forge and Beyond       │
│ [Card] [Card] [Card] [Card] [Card]                  │
│                                                      │
│ More from LevelUp                       [View All]  │
│ Online sessions exclusive with LevelUp              │
│ [Card] [Card] [Card] [Card] [Card]                  │
└──────────────────────────────────────────────────────┘
```

### Perks Page - Alumni Network
```
┌──────────────────────────────────────────────────────┐
│ 👥 Forge Alumni Network  👑                    ✓    │
│ Lifetime access to our exclusive community...       │
│ → Join Community to be linked here                  │
└──────────────────────────────────────────────────────┘

...

┌──────────────────────────────────────────────────────┐
│         📦 Your Forge Bag Awaits                     │
│ All physical items will be handed to you on Day 1...│
│ Digital perks can be requested by emailing LevelUp  │
└──────────────────────────────────────────────────────┘
```

### Home Page - Learn Section
```
Fundamental learning for forge and beyond    ← → See all
[Card] [Card] [Card] [Card]
```

### Home Page - Events Section
```
More from LevelUp                            ← → See all
[Card] [Card] [Card]
```

### Quick Actions Row
```
[🗺️ View Roadmap     ] [💬 Open Community    ] [📖 Watch Classes    ]
 Your journey timeline   Join the community     Forge fundamentals
```

### Forge Highlights (Remove Stay Location)
```
┌─────────────────────────────────────────────┐
│ Forge Highlights                            │
│ ┌─────────────┐ ┌─────────────┐             │
│ │ ✨ Past     │ │ 🎬 Student  │             │
│ │   Moments   │ │   Films     │             │
│ │ 4 photos    │ │ 4 videos    │             │
│ └─────────────┘ └─────────────┘             │
│                                              │
│      ❌ "Where You'll Stay" REMOVED          │
└─────────────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Learn.tsx` | Update section titles and subtitles |
| `src/pages/Perks.tsx` | Add community link to Alumni card, update footer text |
| `src/pages/Home.tsx` | Update Learn and Events section titles |
| `src/components/journey/QuickActionsRow.tsx` | Update action descriptions |
| `src/components/home/RoadmapBentoBox.tsx` | Remove "Where You'll Stay" card |

---

## Technical Details

### Learn.tsx Changes (Lines 229-243)
- Update subtitle for `forgeOnlineSessions` to `"Filmmaking fundamentals: For forge and Beyond"`
- Change title for `communitySessions` to `"More from LevelUp"`
- Update subtitle for `communitySessions` to `"Online sessions exclusive with LevelUp"`

### Perks.tsx Changes
- Add a clickable link under the Alumni Network card pointing to `/community`
- Update footer text to include "Digital perks can be requested by emailing LevelUp"

### Home.tsx Changes (Lines 200, 216)
- Change Learn carousel title from `"Learn"` to `"Fundamental learning for forge and beyond"`
- Change Events carousel title from `isPastEvents ? "Past Events" : "Featured Events"` to `"More from LevelUp"`

### QuickActionsRow.tsx Changes (Lines 13-32)
- Update "Open Community" description from `"Connect with peers"` to `"Join the community"`
- Update "Watch Classes" description from `"Continue learning"` to `"Forge fundamentals"`

### RoadmapBentoBox.tsx Changes (Lines 130-147)
- Remove the entire "Where You'll Stay" BentoCard block
- This will leave only "Past Moments" and "Student Films" in the grid

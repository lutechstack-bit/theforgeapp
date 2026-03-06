

# Update Section Header Copy Across Pages

Update branded copy for section headers on Home, Learn, and Perks pages.

## Changes

### 1. Home — `src/components/home/TravelStaySection.tsx`
- **Title**: Already correct — `"Your Venue"`
- **Subtitle**: Already correct — `"Where you'll be living, breathing, eating and creating"`
- No changes needed here (the homepage_sections DB may override these via props — that's fine, defaults are correct).

### 2. Learn Page — `src/pages/Learn.tsx`

| Section | Current Title / Subtitle | New Title / Subtitle |
|---------|-------------------------|---------------------|
| Page header (line 153-156) | "Learn" / "Explore courses, sessions & resources to enhance your filmmaking skills" | **"Learn"** / **"Develop your craft"** |
| Pre Forge Sessions (line 195-196) | "Pre Forge Sessions" / "Filmmaking fundamentals: For Forge and Beyond" | **"Pre Forge Sessions"** / same — but **hide entire section for FORGE_CREATORS and FORGE_WRITING cohorts** |
| Community Sessions (line 227-228) | "Community Sessions" / "Premium sessions from LevelUp" | **"Community Sessions"** / **"Learn & Network with dreamers like you"** |
| Explore Programs (line 264-265) | "Explore Programs" / "Intensive programs to level up your craft" | **"Explore other programs"** / **"From the House of LevelUp Learning"** |

### 3. Learn — `src/components/learn/UpcomingSessionsSection.tsx`
- Line 71-72: Change subtitle from `"Join live sessions with mentors"` to **"Online sessions before your Forge Offline Experience"**

### 4. Perks Page — `src/pages/Perks.tsx`
- Line 31: Change subtitle from `"Exclusive partner discounts for Forge alumni"` to **"We partner with the industry's best so you can focus on your craft"**

### 5. Pre Forge Sessions — Cohort Filtering (Learn.tsx)
- Wrap the `CourseCarouselSection` for `forgeOnlineSessions` (line 193-203) in a condition: only render when `effectiveCohortType === 'FORGE'` (or is undefined/null). This hides it for Creators and Writing cohorts.

## Files Modified
- `src/pages/Learn.tsx` — 4 copy changes + cohort filter
- `src/components/learn/UpcomingSessionsSection.tsx` — 1 subtitle change
- `src/pages/Perks.tsx` — 1 subtitle change


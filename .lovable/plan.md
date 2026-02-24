

# Pull Online Sessions from Database Instead of Hardcoded Images

## Problem

The "Online Sessions" section under "More from LevelUp" hardcodes 4 local image paths (`/images/levelup/01.jpg` through `04.jpg`). You've uploaded new thumbnails in the admin panel for 6 community sessions, but they don't show because the code never reads from the database.

## What Changes

Replace the hardcoded image array with a dynamic query that fetches `community_sessions` from the `learn_content` table and renders each card using the `thumbnail_url` from the database.

## File Changed

| File | Change |
|---|---|
| `src/pages/Learn.tsx` | Replace the hardcoded image array in the "Online Sessions" section (lines 194-200) with a dynamic render of `communitySessions` filtered from the existing `courses` query. No new query needed -- the data is already fetched. |

## Technical Details

1. Add a filter line (like the existing `forgeOnlineSessions` filter):
   ```
   const communitySessions = courses.filter(c => c.section_type === 'community_sessions');
   ```

2. Replace the hardcoded `['/images/levelup/01.jpg', ...]` mapping with:
   ```
   {communitySessions.map((session) => (
     <div key={session.id} className="snap-start flex-shrink-0">
       <LevelUpCourseCard imageUrl={session.thumbnail_url || ''} />
     </div>
   ))}
   ```

3. The `LevelUpCourseCard` component stays exactly as-is -- image-only, no overlays, 4:5 aspect ratio, rounded corners.

4. If there are no community sessions, the section simply won't render (add a guard).

This means any future thumbnail changes in the admin panel will immediately reflect on the Learn page.

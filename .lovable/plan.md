

# Redesign CourseDetail: Inline Video + Lesson Sidebar with Completion

## Overview
Transform the CourseDetail page into a Udemy-style layout where the video plays inline (not in a modal), sibling lessons appear in a sidebar on the right, and each lesson tracks completion status.

## Layout Structure

```text
Desktop:
+--------------------------------------------------+-------------+
| [<-] Course Title                                               |
+--------------------------------------------------+-------------+
|                                                   | Content     |
|           INLINE VIDEO PLAYER                     | CATEGORY    |
|           (SecureVideoPlayer)                     | 2 of 5 done |
|                                                   |             |
+--------------------------------------------------+ 01 Lesson A |
| Description | Resources                          |    [check]  |
|                                                   | 02 Lesson B |
| Full description text...                          |    playing  |
|                                                   | 03 Lesson C |
+--------------------------------------------------+-------------+

Mobile:
Video stacks on top, sidebar becomes a
scrollable lesson list below the tabs.
```

## Key Changes

### 1. Inline Video Player (replace modal)
- Embed `SecureVideoPlayer` directly in the page (left/main column)
- Remove `VideoPlayerModal` usage -- video plays on page load or on click
- Show the thumbnail with a play button when not yet playing; switch to the player on click

### 2. Content Sidebar (new component)
- Fetch all sibling content sharing the same `section_type` and `category` as the current lesson
- Display as a numbered list (01, 02, 03...) with title, duration, and type badge
- Highlight the currently active lesson with a gold/primary accent
- Show a checkmark icon on completed lessons (from `learn_watch_progress`)
- Show progress count header ("2 of 5 completed")
- Clicking a sibling navigates to `/learn/:id`

### 3. Completion System
- Use existing `learn_watch_progress` table (already has `completed` boolean)
- Show a "Mark as Complete" button below the video for manual completion
- Auto-mark complete when video reaches 90%+ (existing logic in SecureVideoPlayer)
- Completed lessons get a green checkmark in the sidebar
- Progress count updates in real-time

### 4. Mobile Responsive
- Single column: video on top, tabs below, lesson list at bottom
- Lesson list becomes a compact horizontal strip or vertical list

## Files Changed

| File | Change |
|------|--------|
| `src/pages/CourseDetail.tsx` | Major restructure: remove hero card layout, embed SecureVideoPlayer inline in a two-column grid, add sibling content query, add "Mark as Complete" button, remove VideoPlayerModal |
| `src/components/learn/ContentSidebar.tsx` | **New file** -- Sidebar component showing numbered sibling lessons with active state, completion checkmarks, progress count, and click-to-navigate |

## Technical Details

### Sibling Content Query
Fetch all lessons in the same section and category to populate the sidebar:
```typescript
const { data: siblings } = useQuery({
  queryKey: ['learn_siblings', course?.section_type, course?.category],
  queryFn: async () => {
    const { data } = await supabase
      .from('learn_content')
      .select('id, title, duration_minutes, order_index, video_url')
      .eq('section_type', course.section_type)
      .eq('category', course.category)
      .order('order_index');
    return data;
  },
  enabled: !!course,
});
```

### Batch Watch Progress Query
Fetch completion status for all siblings at once:
```typescript
const { data: allProgress } = useQuery({
  queryKey: ['learn_progress_batch', user?.id, siblingIds],
  queryFn: async () => {
    const { data } = await supabase
      .from('learn_watch_progress')
      .select('learn_content_id, completed, progress_seconds, total_seconds')
      .eq('user_id', user.id)
      .in('learn_content_id', siblingIds);
    return data;
  },
});
```

### Mark as Complete Button
Insert or update the `learn_watch_progress` row with `completed: true` when the user clicks "Mark as Complete". This uses an upsert on `(user_id, learn_content_id)`.

### Layout CSS
- Desktop: `grid grid-cols-[1fr_320px]` -- fluid video area, fixed sidebar
- Mobile: single column, sidebar renders below tabs as a scrollable list
- Video container maintains 16:9 aspect ratio


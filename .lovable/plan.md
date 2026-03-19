

# Add "Pre Forge Sessions" Feature Toggle

## What Changes

### 1. Database — Insert new feature flag
Add a `pre_forge_sessions_enabled` row to `app_feature_flags` via migration.

### 2. Admin Dashboard — Add toggle switch
In `src/pages/admin/AdminDashboard.tsx`, add a new toggle row (identical pattern to the existing Events/Chat/Updates toggles) after the Updates toggle, using a `BookOpen` icon with label "Pre Forge Sessions" and description "Show or hide Pre Forge Sessions on Learn tab".

### 3. Learn page — Conditionally hide Pre Forge section
In `src/pages/Learn.tsx`, wrap the Pre Forge Sessions `CourseCarouselSection` block with an additional `isFeatureEnabled('pre_forge_sessions_enabled')` check.

### 4. All Courses page — Conditionally hide Pre Forge filter and content
In `src/pages/AllCourses.tsx`, use `useFeatureFlags` to:
- Remove the "Pre Forge" filter option when the flag is disabled
- Hide the "Pre Forge Sessions" grouped section when the flag is disabled

## Technical Details
- Reuses the existing `useFeatureFlags` hook (`isFeatureEnabled`, `toggleFeature`)
- Default: enabled (flag defaults to `true` so existing behavior is preserved)
- No new components or hooks needed — just one migration + three file edits


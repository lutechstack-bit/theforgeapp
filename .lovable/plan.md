

# Fix Sidebar Count + Remove Payment Restrictions

## 1. Show all items in ContentSidebar

**`src/pages/CourseDetail.tsx`** (lines 105–119):
- Remove `.eq('category', course.category)` from the siblings query
- Update `queryKey` to remove `course?.category`

## 2. Remove premium/payment restrictions

**`src/pages/CourseDetail.tsx`**:
- Remove the `isFullAccess` check in `handlePlayVideo` (lines 202–205) — let all users play any video
- Remove the `isFullAccess` check in `handleDownloadResource` (lines 214–217) — let all users download any resource
- Remove `showUnlockModal` state and the `<UnlockModal>` component at the bottom
- Remove the `UnlockModal` import and `isFullAccess` from `useAuth()` destructure

This makes all content (premium or not) freely accessible to any authenticated user. The `is_premium` flag and badge will still display visually but won't block access.


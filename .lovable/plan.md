

# Fix: Add Missing `/ky-section/:sectionKey` Route

## Problem
The `KYSectionForm` page component is imported in `App.tsx` (line 38) but has no corresponding `<Route>` registered. When "Start now" is clicked on the KYProfileCard, it navigates to `/ky-section/filmmaker_profile`, which hits the catch-all `*` route and shows the 404 page.

## Root Cause
During the previous cleanup that removed old KY form routes (`/kyf-form`, `/kyc-form`, `/kyw-form`), the `/ky-section/:sectionKey` route was either also removed or was never added.

## Fix
Add a protected route for `/ky-section/:sectionKey` in `App.tsx`. This route should be **outside** the `AppLayout` wrapper (since `KYSectionForm` has its own full-screen layout with custom top bar, progress bar, and navigation).

### App.tsx Change
Add a new route block between the `/welcome` route and the `/profile-setup` route (around line 213):

```tsx
<Route path="/ky-section/:sectionKey" element={
  <ProtectedRoute>
    <ProfileSetupCheck>
      <KYSectionForm />
    </ProfileSetupCheck>
  </ProtectedRoute>
} />
```

This is placed outside the `AppLayout` route group because `KYSectionForm` renders its own full-page UI with custom header, progress bar, and bottom navigation.

## Files Changed

| File | Change |
|------|--------|
| `src/App.tsx` | Add `/ky-section/:sectionKey` route (1 line addition) |

## Technical Notes
- No other files need changes -- `KYSectionForm` is already imported at line 38
- The `KYProfileCard` already navigates to `/ky-section/${sectionKey}` correctly
- The route needs `ProtectedRoute` + `ProfileSetupCheck` wrappers for auth protection

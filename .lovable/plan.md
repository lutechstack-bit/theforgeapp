

# Admin Toggle for Embedded Zoom vs Native Zoom App

## What it does
Adds a new feature flag `embedded_zoom_enabled` that controls whether clicking "Join Meeting" opens the Zoom SDK embedded in the app (current behavior) or redirects users to the native Zoom app/web client.

- **Toggle ON (default)**: Embedded full-screen Zoom experience inside the app
- **Toggle OFF**: Opens `zoom.us/j/...` URL (launches Zoom app on phone, Zoom web client on desktop)

## Changes

### 1. Database — Insert new feature flag
Add a migration to insert the `embedded_zoom_enabled` row into `app_feature_flags`.

### 2. `src/pages/admin/AdminDashboard.tsx`
Add one entry to the `FEATURE_TOGGLES` array:
```typescript
{ key: 'embedded_zoom_enabled', label: 'Embedded Zoom', desc: 'In-app Zoom vs native app', icon: Video },
```

### 3. `src/pages/LiveSession.tsx`
- Import `useFeatureFlags` hook
- Check `isFeatureEnabled('embedded_zoom_enabled')` in `handleJoinZoom`
- If disabled, always open `https://zoom.us/j/{meetingNumber}` in a new tab (same as current mobile behavior) regardless of device
- If enabled, keep existing embedded SDK behavior for desktop, native redirect for mobile




# Fix: Zoom Meeting SDK Embedded Join — Align to Official SDK Flow

## Summary
The current implementation is architecturally correct for Meeting SDK web embedding. The edge function, signature generation, and LiveSession page follow the right pattern. The remaining "Failed to join meeting" errors stem from two fixable issues:

1. **Credential type verification** — The secrets `ZOOM_MEETING_SDK_KEY` and `ZOOM_MEETING_SDK_SECRET` must be the **Client ID** and **Client Secret** from a **Meeting SDK** app type on Zoom Marketplace (not from a Server-to-Server OAuth app). This is the most common cause of "Signature is invalid" / "Failed to join" errors per Zoom's own docs.

2. **Better error surfacing** — The current catch-all error message "Failed to join meeting" hides the actual Zoom SDK error code (e.g., 3712, 3172) which is critical for debugging.

3. **Zoom container mounting order** — The container `ref` must exist in the DOM *before* `client.init()` is called; currently the container only renders when `sessionState === 'live'`, which is correct, but the `zoomAppRoot` element should use a stable ID lookup as a fallback.

## Changes

### 1. `src/pages/LiveSession.tsx` — Improve error handling and SDK init

- Capture Zoom SDK error events (`client.on('connection-change')`) to surface exact error codes/reasons in the UI instead of generic "Failed to join meeting".
- Add a retry button that clears the previous client instance before re-attempting.
- Log the full Zoom error object (errorCode + reason) to the console for debugging.
- Ensure `cleanMeetingNumber` is passed as a string to `client.join()` (SDK expects string).

### 2. `supabase/functions/zoom-signature/index.ts` — No changes needed

The edge function is correct: it strips non-digits, uses `parseInt` for the JWT `mn` field (number), and returns `{ signature, sdkKey }`. This matches Zoom's required JWT payload format.

### 3. Credential verification guidance

After the code changes, if the join still fails, the issue is 100% the credentials stored in secrets. You will need to verify in Zoom Marketplace:
- App type is **Meeting SDK** (not Server-to-Server OAuth, not JWT deprecated)
- Copy the **Client ID** → `ZOOM_MEETING_SDK_KEY`
- Copy the **Client Secret** → `ZOOM_MEETING_SDK_SECRET`
- The app must be **Activated** (not in draft)

## Technical Details

### LiveSession.tsx error handling improvement
```typescript
// After client.join(), listen for connection changes
client.on('connection-change', (payload: any) => {
  if (payload.state === 'Fail') {
    console.error('Zoom connection failed:', payload);
    setZoomError(`Zoom error ${payload.errorCode}: ${payload.reason}`);
    setZoomClient(null);
  }
});
```

### Files changed
- `src/pages/LiveSession.tsx` — enhanced error handling, retry support, connection-change listener


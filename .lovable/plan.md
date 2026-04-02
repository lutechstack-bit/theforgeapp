

# Fix: Zoom "Signature is invalid" Error

## Problem
The edge function returns 200 successfully, but Zoom SDK rejects the signature with "Signature is invalid." The network tab confirms the signature is generated and returned — the issue is in the JWT payload format.

## Root Cause
The `mn` (meeting number) field in the JWT payload is a **string**, but Zoom Meeting SDK requires it to be a **number** (integer). When the meeting number is passed as `"12345678"` instead of `12345678`, Zoom's signature validation fails.

## Fix

### File: `supabase/functions/zoom-signature/index.ts`

Change line 28 from:
```typescript
mn: meetingNumber,
```
to:
```typescript
mn: parseInt(meetingNumber, 10),
```

This converts the string meeting number to an integer before embedding it in the JWT payload, matching what Zoom's SDK expects.

### Redeploy
The edge function must be redeployed after this change.

### No other files change.


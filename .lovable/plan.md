

# Store Zoom SDK Credentials

## What
Save the two Zoom Meeting SDK credentials as backend secrets so the `zoom-signature` edge function can use them.

## Secrets to Add

| Secret Name | Value |
|---|---|
| `ZOOM_MEETING_SDK_KEY` | `96Im0lxqRBGNThs6KVxwBg` |
| `ZOOM_MEETING_SDK_SECRET` | `7yA54SqSlnQmnfIHnfSg3lVZthlpKe3K` |

## How
These will be stored securely as environment secrets accessible only by backend functions — never exposed in frontend code. The existing `zoom-signature` edge function already references these exact variable names.

## No Code Changes
The edge function is already built to read `ZOOM_MEETING_SDK_KEY` and `ZOOM_MEETING_SDK_SECRET` from `Deno.env`. Once stored, the Live Sessions feature will be fully operational.


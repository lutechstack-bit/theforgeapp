

# Fix: zoom-signature Edge Function Not Working

## Problem
The network tab shows:
1. **404 on preflight (OPTIONS)** — the edge function is not deployed
2. **CORS error** on the actual request — consequence of the 404

Additionally, the function imports `@supabase/supabase-js@2.89.0` which may not have the `getClaims()` method, and the CORS headers are missing some headers the Supabase client sends.

## Fix

### File: `supabase/functions/zoom-signature/index.ts`

1. **Update CORS headers** to include all headers the Supabase JS client sends:
   ```typescript
   "Access-Control-Allow-Headers":
     "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version"
   ```

2. **Replace `getClaims()` with `getUser()`** for auth validation — `getClaims` isn't available in all SDK versions:
   ```typescript
   const { data: { user }, error: userError } = await supabase.auth.getUser();
   if (userError || !user) { ... return 401 }
   ```

3. **Deploy the function** after the fix so it's actually accessible.

### No other files change.


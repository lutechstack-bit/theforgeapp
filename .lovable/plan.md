

# Phase 1: Live Sessions Feature

## Overview
Add a Live Sessions feature to the Forge app enabling students to attend Zoom sessions in-app, admins to manage sessions, and recordings to flow into the Learn page. This touches: database, edge function, 3 new pages, Home card, Learn integration, and admin CRUD.

## 1. Database Migration

Create `live_sessions` table:

```sql
CREATE TABLE public.live_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  edition_id uuid REFERENCES public.editions(id) ON DELETE SET NULL,
  cohort_type text NOT NULL DEFAULT 'FORGE',
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  zoom_meeting_number text NOT NULL,
  zoom_passcode text,
  zoom_host_email text,
  mentor_name text,
  thumbnail_url text,
  status text NOT NULL DEFAULT 'scheduled',
  recording_status text NOT NULL DEFAULT 'none',
  recording_url text,
  learn_content_id uuid REFERENCES public.learn_content(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.live_sessions ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read sessions for their edition
CREATE POLICY "Users can view own edition sessions"
  ON public.live_sessions FOR SELECT TO authenticated
  USING (edition_id = public.get_my_edition_id());

-- Admins can do everything
CREATE POLICY "Admins full access"
  ON public.live_sessions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_live_sessions_updated_at
  BEFORE UPDATE ON public.live_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

## 2. Edge Function: `zoom-signature`

File: `supabase/functions/zoom-signature/index.ts`

- Accept `{ meetingNumber, role }` in POST body (role: 0 = attendee, 1 = host)
- Read `ZOOM_MEETING_SDK_KEY` and `ZOOM_MEETING_SDK_SECRET` from `Deno.env`
- Generate a Zoom Meeting SDK JWT signature using HMAC-SHA256 (standard Zoom SDK auth)
- Return `{ signature, sdkKey }` — frontend needs both to init the SDK
- Include CORS headers; validate input with Zod
- `verify_jwt = false` in config.toml, but validate auth via `getClaims()` in code

Register in `supabase/config.toml`:
```toml
[functions.zoom-signature]
verify_jwt = false
```

## 3. Student-Facing Page: `/live-session/:id`

File: `src/pages/LiveSession.tsx`

- New route inside the protected `AppLayout` group
- Fetch session row from `live_sessions` by ID (RLS ensures edition scoping)
- Display: title, mentor name, date/time, status badge
- State-based rendering:
  - **Upcoming**: countdown, session details, "Session starts in X"
  - **Live Now** (within start_at → end_at window): "Join Session" CTA that loads Zoom Meeting SDK
  - **Ended**: "Session has ended" message
  - **Recording Processing**: "Recording will be available soon"
  - **Recording Ready**: link to the Learn content page (`/learn/:learn_content_id`)
- Zoom embed: load `@zoom/meetingsdk` (npm), call edge function for signature, init component view on desktop
- On mobile, fall back to opening Zoom app via meeting URL (SDK component view works poorly on small screens)

## 4. Home Integration: "Next Live Session" Card

File: `src/components/home/LiveSessionCard.tsx`

- Query `live_sessions` where `status` in ('scheduled', 'live') and edition matches user, order by `start_at ASC`, limit 1
- Show: title, mentor name, formatted date/time, status pill (Upcoming / Live Now)
- CTA: "View Session" → navigates to `/live-session/:id`
- If no upcoming sessions, component returns null (no empty state on Home)
- Add to `Home.tsx` between Onboarding and Payment sections, gated by existence of data

## 5. Learn Integration

File: Modify `src/pages/Learn.tsx`

- Add a new query for `live_sessions` where `recording_status = 'ready'` and `learn_content_id IS NOT NULL`, scoped to user's edition
- Render a "Session Recordings" section in the Forge Zone using existing `ScrollableCardRow` and `LearnCourseCard` patterns
- Each card links to `/learn/:learn_content_id` (the linked learn_content row)
- If no recordings, section is hidden

## 6. Admin Page: `/admin/live-sessions`

File: `src/pages/admin/AdminLiveSessions.tsx`

- Full CRUD table matching existing admin page patterns (Dialog forms, Table, toast notifications)
- Fields: title, description, edition (dropdown from editions table), cohort_type, start_at, end_at, zoom_meeting_number, zoom_passcode, zoom_host_email, mentor_name, thumbnail_url, status (dropdown), recording_status, recording_url, learn_content_id (optional dropdown from learn_content)
- Status transitions: scheduled → live → ended → cancelled
- Recording workflow: admin manually sets recording_url and changes recording_status to "ready"
- If learn_content_id is set, the recording flows to Learn automatically

Add to admin nav in `AdminLayout.tsx` under the "Curriculum" group:
```
{ to: '/admin/live-sessions', icon: Video, label: 'Live Sessions' }
```

Add route in `App.tsx`:
```
<Route path="live-sessions" element={<AdminLiveSessions />} />
```

## 7. NPM Dependency

- Install `@zoom/meetingsdk` for the Zoom Meeting SDK web component

## 8. Environment Secrets Required

Two secrets must be added (via the secrets tool):
- `ZOOM_MEETING_SDK_KEY`
- `ZOOM_MEETING_SDK_SECRET`

These are only used server-side in the edge function; never exposed to the frontend.

## 9. Files Changed/Created Summary

| Action | File |
|--------|------|
| Create | `supabase/functions/zoom-signature/index.ts` |
| Create | `src/pages/LiveSession.tsx` |
| Create | `src/pages/admin/AdminLiveSessions.tsx` |
| Create | `src/components/home/LiveSessionCard.tsx` |
| Modify | `src/App.tsx` (add routes) |
| Modify | `src/components/admin/AdminLayout.tsx` (add nav item) |
| Modify | `src/pages/Home.tsx` (add LiveSessionCard) |
| Modify | `src/pages/Learn.tsx` (add recordings section) |
| Modify | `supabase/config.toml` (add zoom-signature function) |
| Migration | Create `live_sessions` table with RLS |

## Assumptions

- Zoom Meeting SDK web component works in an iframe-like embed; desktop gets component view, mobile gets a "Open in Zoom" fallback link
- Admins manually transition session status (no automated webhook from Zoom)
- Admins manually paste recording URL after the session ends
- The `learn_content` row for a recording is created separately via the existing Admin Learn page, then linked via `learn_content_id`


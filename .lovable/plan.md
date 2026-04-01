

# Rebuild Events Feature — Pre-Event / Post-Event Flow

## Summary

Replace the current events system with a lifecycle-based flow: Admin creates events with a poster card + Zoom link. Registered users see the Zoom link immediately. In-app notifications auto-fire on creation with manual reminder option. Post-event, admin converts the event into a Community Session in Learn with one click.

## Database Changes

**Migration 1: Add `zoom_link` and `host_designation` to `events` table**
```sql
ALTER TABLE public.events ADD COLUMN zoom_link text;
ALTER TABLE public.events ADD COLUMN host_designation text;
ALTER TABLE public.events ADD COLUMN community_session_id uuid;
```
- `zoom_link` — Zoom meeting URL, visible only to registered users
- `host_designation` — e.g., "Sound Designer" (shown on poster/detail)
- `community_session_id` — links to `learn_content.id` after post-event conversion

**Migration 2: Add `linked_event_id` to `learn_content`**
```sql
ALTER TABLE public.learn_content ADD COLUMN linked_event_id uuid;
```

No new tables needed. Notifications already exist via the `notifications` table.

## File Changes

### 1. Admin Events (`src/pages/admin/AdminEvents.tsx`)
- Add **Zoom Link** and **Host Designation** fields to the create/edit form
- Add **Poster Image** upload using the existing `FileUpload` (update helper text to "Upload poster card, 1:1 square recommended")
- Add **"Send Notification"** button per event row — inserts a global notification with `deep_link: /events/{id}`
- Add **"Convert to Community Session"** button on past events — auto-creates a `learn_content` entry with:
  - `title` = event title
  - `thumbnail_url` = event `image_url` (poster)
  - `instructor_name` = `host_name`
  - `instructor_avatar_url` = `host_avatar_url`
  - `company_name` = `host_designation`
  - `section_type` = `community_sessions`
  - `card_layout` = `portrait`
  - Opens a pre-filled dialog to add video URL before saving
- Auto-create notification on event creation (insert into `notifications` with `is_global: true`)

### 2. Event Detail Page (`src/pages/EventDetail.tsx`)
- Show **Zoom link** section for registered users (always visible, no time gate):
  - Card with Zoom icon, clickable link, copy button
  - Hidden for non-registered users with "Register to get access" prompt
- Display **host designation** under host name
- Update image aspect ratio from `4/3` to `1/1` (poster format like the Inner Circle card)

### 3. Events List (`src/pages/Events.tsx`)
- Update `CleanEventCard` to use `aspect-[1/1]` for the poster image instead of `4/5`
- Show host designation on card footer

### 4. CleanEventCard (`src/components/shared/CleanEventCard.tsx`)
- Add `hostDesignation` prop
- Change image aspect ratio to `1/1` to match poster format
- Display designation under host name in footer

### 5. Event Registration Modal (`src/components/events/EventRegistrationModal.tsx`)
- After successful registration, show the Zoom link immediately in the success state

### 6. useEventRegistration hook
- No changes needed — already tracks registration status

## Notification Flow

- **On event creation**: Auto-insert a notification: `{ title: "New Event: {title}", message: "Happening on {date}", is_global: true, deep_link: "/events/{id}", type: "info" }`
- **Manual reminder**: Admin clicks "Send Reminder" button on an event → inserts another notification with reminder messaging
- WhatsApp drip is out of scope (per user request)

## Post-Event Conversion Flow

1. Admin clicks "Convert to Community Session" on a past event
2. A dialog opens pre-filled with event data + empty video URL field
3. Admin pastes the recording URL and confirms
4. System inserts into `learn_content` with `linked_event_id` set
5. Updates `events.community_session_id` with the new learn_content ID
6. Button changes to "View Community Session" linking to the course detail

## Visual Reference

The poster card (1:1 square) replaces the current 4:3 event image throughout — matching the Inner Circle poster style from the uploaded reference.


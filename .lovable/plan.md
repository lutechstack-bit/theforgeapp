

# Fix Calendar Button Not Working on Session Cards

## Problem

The calendar button silently fails because the `date` column is `null` for all virtual sessions in the database. The current code checks `if (!session.date) return;` and exits early, so nothing happens when clicked.

## Solution

Update the click handler to handle sessions without a date gracefully:

1. If `session.date` exists, proceed as normal (open Google Calendar with the correct date/time).
2. If `session.date` is missing, show a toast notification informing the user that the session date hasn't been announced yet, so they know why it didn't work -- instead of silently failing.

## Technical Details

### `src/components/learn/UpcomingSessionsSection.tsx`

- Import `toast` from `sonner`
- Replace the silent `return` with a toast message like: "Session date not yet announced. Check back soon!"
- Keep the rest of the Google Calendar logic unchanged for when dates are available

| File | Action |
|------|--------|
| `src/components/learn/UpcomingSessionsSection.tsx` | UPDATE -- Add toast feedback when date is unavailable |


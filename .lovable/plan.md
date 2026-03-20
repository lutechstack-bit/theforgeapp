

# Remove Admin User's Collaborator Profile

## What
Delete the "Admin User" collaborator profile from the Creatives directory so it no longer appears to community members.

## How
Run a database migration to delete:
1. `collaborator_works` rows for user `69ada39f-cbd8-4d02-b653-d60355ca9764`
2. `collaborator_profiles` row for the same user

This is a single SQL migration — no code changes needed.


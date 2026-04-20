
The user confirmed the target email: `admin@adventactorstudio.com`. Current email in DB is `admin@advenactorstuduo.com` for user `2c921dd8-bb42-4bbf-ac80-a91dcf56c033`.

Plan: update both `auth.users` (via Auth Admin API in a temporary edge function) and `public.profiles` (via SQL).

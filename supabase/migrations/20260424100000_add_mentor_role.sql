-- Phase 1 (mentor-profiles): add 'mentor' to the app_role enum.
--
-- Note: ALTER TYPE ... ADD VALUE cannot run in a multi-statement transaction
-- in Postgres, so this migration contains only the enum change. The
-- mentor_profiles / mentor_assignments tables live in the next migration.

ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'mentor';

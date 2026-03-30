
-- Fix 1: Restrict learn_content to authenticated users only (protects access_tokens and video URLs)
DROP POLICY IF EXISTS "Everyone can view learn content" ON public.learn_content;
CREATE POLICY "Authenticated users can view learn content"
  ON public.learn_content
  FOR SELECT
  TO authenticated
  USING (true);

-- Fix 2: Remove overly permissive community_messages SELECT policy
-- The cohort-scoped policy already exists, the broad one overrides it
DROP POLICY IF EXISTS "Authenticated users can view messages" ON public.community_messages;

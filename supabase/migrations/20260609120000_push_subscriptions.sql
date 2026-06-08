-- Real Web Push: per-device subscription store (Prompt 3)
-- Run this in the Lovable SQL editor.

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint text NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  enabled boolean NOT NULL DEFAULT true,
  last_used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE (endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subs_user ON public.push_subscriptions(user_id) WHERE enabled = true;

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- A user manages only their own subscriptions
DROP POLICY IF EXISTS push_subs_own_select ON public.push_subscriptions;
CREATE POLICY push_subs_own_select ON public.push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS push_subs_own_insert ON public.push_subscriptions;
CREATE POLICY push_subs_own_insert ON public.push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS push_subs_own_update ON public.push_subscriptions;
CREATE POLICY push_subs_own_update ON public.push_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS push_subs_own_delete ON public.push_subscriptions;
CREATE POLICY push_subs_own_delete ON public.push_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- Admins can read all (for diagnostics) and the service role (edge function) bypasses RLS anyway
DROP POLICY IF EXISTS push_subs_admin_all ON public.push_subscriptions;
CREATE POLICY push_subs_admin_all ON public.push_subscriptions
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

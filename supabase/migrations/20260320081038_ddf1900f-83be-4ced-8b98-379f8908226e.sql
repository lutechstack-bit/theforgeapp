
-- Create user_activity_logs table
CREATE TABLE public.user_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  page_path text,
  page_name text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_user_activity_logs_user_created ON public.user_activity_logs (user_id, created_at DESC);
CREATE INDEX idx_user_activity_logs_event_type ON public.user_activity_logs (event_type, created_at DESC);

-- Enable RLS
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Admins can SELECT all rows
CREATE POLICY "Admins can view all activity logs"
ON public.user_activity_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users can INSERT their own rows
CREATE POLICY "Users can insert own activity logs"
ON public.user_activity_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

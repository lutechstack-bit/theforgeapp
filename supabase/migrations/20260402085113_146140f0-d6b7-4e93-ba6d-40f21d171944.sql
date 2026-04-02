
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

CREATE POLICY "Users can view own edition sessions"
  ON public.live_sessions FOR SELECT TO authenticated
  USING (edition_id = public.get_my_edition_id());

CREATE POLICY "Admins full access"
  ON public.live_sessions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_live_sessions_updated_at
  BEFORE UPDATE ON public.live_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

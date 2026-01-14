-- Create event_registrations table
CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- Users can see their own registrations
CREATE POLICY "Users can view own registrations"
ON public.event_registrations FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Users can register for events
CREATE POLICY "Users can register for events"
ON public.event_registrations FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can cancel their registration
CREATE POLICY "Users can cancel own registrations"
ON public.event_registrations FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Admins can view all registrations
CREATE POLICY "Admins can view all registrations"
ON public.event_registrations FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
-- Allow any authenticated user to see live_sessions that have a ready recording.
-- These sessions are already visible in the Learn tab via learn_content;
-- this policy simply lets the Roadmap home page find the linked learn_content_id
-- so it can show "View Session Recording" instead of "Recording Coming Soon".
-- There is no security risk: the recording itself is gated by learn_content RLS.

CREATE POLICY "Anyone can view sessions with ready recordings"
  ON public.live_sessions FOR SELECT TO authenticated
  USING (recording_status = 'ready' AND learn_content_id IS NOT NULL);

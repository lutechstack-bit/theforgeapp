-- Create storage bucket for learn videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('learn-videos', 'learn-videos', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for learn thumbnails (public for display)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('learn-thumbnails', 'learn-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for learn-videos bucket
CREATE POLICY "Admins can upload learn videos"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'learn-videos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update learn videos"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'learn-videos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete learn videos"
ON storage.objects
FOR DELETE
USING (bucket_id = 'learn-videos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view learn videos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'learn-videos' AND auth.role() = 'authenticated');

-- Storage policies for learn-thumbnails bucket
CREATE POLICY "Admins can upload learn thumbnails"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'learn-thumbnails' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update learn thumbnails"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'learn-thumbnails' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete learn thumbnails"
ON storage.objects
FOR DELETE
USING (bucket_id = 'learn-thumbnails' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view learn thumbnails"
ON storage.objects
FOR SELECT
USING (bucket_id = 'learn-thumbnails');
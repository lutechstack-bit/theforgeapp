-- Allow admins to INSERT files to user-uploads bucket
CREATE POLICY "Admins can upload to user-uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-uploads' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admins to UPDATE files in user-uploads bucket
CREATE POLICY "Admins can update user-uploads"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user-uploads' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admins to DELETE files from user-uploads bucket  
CREATE POLICY "Admins can delete user-uploads"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-uploads' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);
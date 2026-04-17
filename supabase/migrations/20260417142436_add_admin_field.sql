-- Add is_admin column to profiles table
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Create index on is_admin for faster queries
CREATE INDEX idx_profiles_is_admin ON profiles(is_admin);

-- Add RLS policy for admins
CREATE POLICY "Admins can view and update admin status"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

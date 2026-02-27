-- Add public SELECT policy for app_changelog so non-admin users can view changelog entries
CREATE POLICY "Everyone can view changelog"
ON public.app_changelog
FOR SELECT
USING (true);

-- Add admin management policies for cohort_groups
CREATE POLICY "Admins can manage cohort groups"
ON public.cohort_groups
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
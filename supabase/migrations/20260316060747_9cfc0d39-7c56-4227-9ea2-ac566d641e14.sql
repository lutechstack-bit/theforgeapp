
-- Allow same-edition users to view each other's profiles
CREATE POLICY "Same edition users can view batchmate profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  edition_id IS NOT NULL
  AND edition_id IN (
    SELECT p.edition_id FROM public.profiles p WHERE p.id = auth.uid()
  )
);

-- Allow same-edition users to view batchmate KYF responses
CREATE POLICY "Same edition users can view batchmate kyf responses"
ON public.kyf_responses
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT p.id FROM public.profiles p
    WHERE p.edition_id IS NOT NULL
    AND p.edition_id IN (
      SELECT p2.edition_id FROM public.profiles p2 WHERE p2.id = auth.uid()
    )
  )
);

-- Allow same-edition users to view batchmate KYC responses
CREATE POLICY "Same edition users can view batchmate kyc responses"
ON public.kyc_responses
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT p.id FROM public.profiles p
    WHERE p.edition_id IS NOT NULL
    AND p.edition_id IN (
      SELECT p2.edition_id FROM public.profiles p2 WHERE p2.id = auth.uid()
    )
  )
);

-- Allow same-edition users to view batchmate KYW responses
CREATE POLICY "Same edition users can view batchmate kyw responses"
ON public.kyw_responses
FOR SELECT
TO authenticated
USING (
  user_id IN (
    SELECT p.id FROM public.profiles p
    WHERE p.edition_id IS NOT NULL
    AND p.edition_id IN (
      SELECT p2.edition_id FROM public.profiles p2 WHERE p2.id = auth.uid()
    )
  )
);

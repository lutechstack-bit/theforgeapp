-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'avatars',
  'avatars',
  true,
  ARRAY['image/jpeg','image/png','image/webp','image/gif'],
  5242880  -- 5 MB
) ON CONFLICT (id) DO NOTHING;

-- RLS: anyone can read avatars (public bucket)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'avatars_public_read'
  ) THEN
    CREATE POLICY "avatars_public_read" ON storage.objects
      FOR SELECT USING (bucket_id = 'avatars');
  END IF;
END $$;

-- RLS: authenticated users can upload into their own folder (avatars/<user_id>/*)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'avatars_user_insert'
  ) THEN
    CREATE POLICY "avatars_user_insert" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

-- RLS: users can update/delete their own avatar
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'avatars_user_update'
  ) THEN
    CREATE POLICY "avatars_user_update" ON storage.objects
      FOR UPDATE TO authenticated
      USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'avatars_user_delete'
  ) THEN
    CREATE POLICY "avatars_user_delete" ON storage.objects
      FOR DELETE TO authenticated
      USING (
        bucket_id = 'avatars'
        AND (storage.foldername(name))[1] = auth.uid()::text
      );
  END IF;
END $$;

-- Add intro column to collaborator_profiles if it doesn't already exist
ALTER TABLE collaborator_profiles ADD COLUMN IF NOT EXISTS intro text;

-- Add open_to_remote column if it doesn't already exist
ALTER TABLE collaborator_profiles ADD COLUMN IF NOT EXISTS open_to_remote boolean DEFAULT false;

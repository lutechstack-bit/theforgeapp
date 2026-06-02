-- Add foreign key from collaborator_profiles.user_id → profiles.id
-- so PostgREST can resolve the relationship for nested selects.
ALTER TABLE collaborator_profiles
  ADD CONSTRAINT collaborator_profiles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

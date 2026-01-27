-- Add DELETE policy for user_journey_progress (fixes task un-ticking)
CREATE POLICY "Users can delete their own progress"
ON user_journey_progress
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
-- Create onboarding checklist table to track user progress
CREATE TABLE public.onboarding_checklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_key TEXT NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_key)
);

-- Enable Row Level Security
ALTER TABLE public.onboarding_checklist ENABLE ROW LEVEL SECURITY;

-- Users can view their own checklist
CREATE POLICY "Users can view their own checklist"
ON public.onboarding_checklist
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own checklist items
CREATE POLICY "Users can insert their own checklist items"
ON public.onboarding_checklist
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own checklist items
CREATE POLICY "Users can update their own checklist items"
ON public.onboarding_checklist
FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_onboarding_checklist_user_id ON public.onboarding_checklist(user_id);
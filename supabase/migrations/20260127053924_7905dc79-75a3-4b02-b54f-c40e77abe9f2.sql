-- Add due_days_offset column and user_task_order to support due dates and drag-reorder features
ALTER TABLE journey_tasks 
ADD COLUMN IF NOT EXISTS due_days_offset INTEGER DEFAULT NULL;

COMMENT ON COLUMN journey_tasks.due_days_offset IS 
  'Number of days before forge_start_date this task is due. NULL means no due date.';

-- Create user_task_preferences table for storing user's custom task order
CREATE TABLE IF NOT EXISTS public.user_task_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES journey_stages(id) ON DELETE CASCADE,
  task_order TEXT[] NOT NULL DEFAULT '{}',
  filter_preference TEXT DEFAULT 'all',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, stage_id)
);

-- Enable RLS
ALTER TABLE public.user_task_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own task preferences" 
ON public.user_task_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own task preferences" 
ON public.user_task_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task preferences" 
ON public.user_task_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task preferences" 
ON public.user_task_preferences 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_task_preferences_updated_at
BEFORE UPDATE ON public.user_task_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Create enum for field types
CREATE TYPE public.form_field_type AS ENUM (
  'text',
  'email', 
  'number',
  'date',
  'tel',
  'textarea',
  'select',
  'radio',
  'checkbox',
  'multi_select',
  'proficiency',
  'photo_upload'
);

-- Create table for form definitions (one per cohort type)
CREATE TABLE public.ky_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_type public.cohort_type NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create table for form steps/pages
CREATE TABLE public.ky_form_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.ky_forms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'User',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create table for form fields
CREATE TABLE public.ky_form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id UUID NOT NULL REFERENCES public.ky_form_steps(id) ON DELETE CASCADE,
  field_key TEXT NOT NULL,
  label TEXT NOT NULL,
  field_type public.form_field_type NOT NULL DEFAULT 'text',
  placeholder TEXT,
  helper_text TEXT,
  is_required BOOLEAN NOT NULL DEFAULT false,
  validation_regex TEXT,
  min_value INTEGER,
  max_value INTEGER,
  options JSONB DEFAULT '[]',
  default_value TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  grid_cols INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ky_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ky_form_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ky_form_fields ENABLE ROW LEVEL SECURITY;

-- Everyone can view forms (needed for form rendering)
CREATE POLICY "Everyone can view active forms"
ON public.ky_forms FOR SELECT
USING (is_active = true);

CREATE POLICY "Everyone can view form steps"
ON public.ky_form_steps FOR SELECT
USING (true);

CREATE POLICY "Everyone can view form fields"
ON public.ky_form_fields FOR SELECT
USING (true);

-- Only admins can manage forms
CREATE POLICY "Admins can manage forms"
ON public.ky_forms FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage form steps"
ON public.ky_form_steps FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage form fields"
ON public.ky_form_fields FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Create table for dynamic form responses
CREATE TABLE public.ky_dynamic_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  form_id UUID NOT NULL REFERENCES public.ky_forms(id),
  responses JSONB NOT NULL DEFAULT '{}',
  terms_accepted BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ky_dynamic_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own responses"
ON public.ky_dynamic_responses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own responses"
ON public.ky_dynamic_responses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own responses"
ON public.ky_dynamic_responses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all responses"
ON public.ky_dynamic_responses FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Add triggers for updated_at
CREATE TRIGGER update_ky_forms_updated_at
BEFORE UPDATE ON public.ky_forms
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ky_dynamic_responses_updated_at
BEFORE UPDATE ON public.ky_dynamic_responses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
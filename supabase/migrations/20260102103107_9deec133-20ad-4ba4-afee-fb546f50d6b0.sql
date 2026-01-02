-- Add profile setup and KY form completion tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_setup_completed boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS ky_form_completed boolean NOT NULL DEFAULT false;

-- Create storage bucket for user uploads (profile photos, KY form photos)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user-uploads', 'user-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for user uploads
CREATE POLICY "Users can upload their own files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'user-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view user uploads" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'user-uploads');

-- Create KYF responses table (Know Your Filmmaker)
CREATE TABLE public.kyf_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Page 1: General Details
  certificate_name text,
  current_occupation text,
  whatsapp_number text,
  instagram_id text,
  email text,
  
  -- Page 2: Personal Details
  age integer,
  date_of_birth date,
  address_line_1 text,
  address_line_2 text,
  city text,
  state text,
  pincode text,
  
  -- Page 3: Basic Preferences & Emergency
  gender text,
  tshirt_size text,
  has_editing_laptop boolean,
  emergency_contact_name text,
  emergency_contact_number text,
  
  -- Page 4: Proficiency
  proficiency_screenwriting text,
  proficiency_direction text,
  proficiency_cinematography text,
  proficiency_editing text,
  
  -- Page 5: Personality & Preferences
  top_3_movies text[],
  chronotype text,
  meal_preference text,
  food_allergies text,
  medication_support text,
  
  -- Page 6: Casting Call
  languages_known text[],
  height_ft text,
  
  -- Page 6: Photos
  photo_favorite_url text,
  headshot_front_url text,
  headshot_right_url text,
  headshot_left_url text,
  full_body_url text,
  
  -- Page 7: Deeper Understanding
  mbti_type text,
  
  -- Page 7: Intent
  forge_intent text,
  forge_intent_other text,
  
  -- Page 8: T&C
  terms_accepted boolean DEFAULT false,
  terms_accepted_at timestamptz,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create KYC responses table (Know Your Creator)
CREATE TABLE public.kyc_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Page 1: General Details
  certificate_name text,
  current_status text,
  whatsapp_number text,
  instagram_id text,
  email text,
  
  -- Page 2: Personal Details
  age integer,
  date_of_birth date,
  city text,
  state text,
  country text,
  
  -- Page 3: Creator Setup & Emergency
  primary_platform text,
  emergency_contact_name text,
  emergency_contact_number text,
  
  -- Page 4: Proficiency
  proficiency_content_creation text,
  proficiency_storytelling text,
  proficiency_video_production text,
  
  -- Page 5: Personality & Preferences
  top_3_creators text[],
  chronotype text,
  meal_preference text,
  
  -- Page 6: Deeper Understanding
  mbti_type text,
  
  -- Page 7: Intent
  forge_intent text,
  forge_intent_other text,
  
  -- Page 8: T&C
  terms_accepted boolean DEFAULT false,
  terms_accepted_at timestamptz,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create KYW responses table (Know Your Writer)
CREATE TABLE public.kyw_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Page 1: General Details
  certificate_name text,
  current_occupation text,
  whatsapp_number text,
  email text,
  
  -- Page 2: Personal Details
  age integer,
  city text,
  primary_language text,
  
  -- Page 3: Writing Practice & Emergency
  writing_types text[],
  emergency_contact_name text,
  emergency_contact_number text,
  
  -- Page 4: Proficiency
  proficiency_writing text,
  proficiency_story_voice text,
  
  -- Page 5: Personality & Preferences
  top_3_writers_books text[],
  chronotype text,
  
  -- Page 6: Deeper Understanding
  mbti_type text,
  
  -- Page 7: Intent
  forge_intent text,
  forge_intent_other text,
  
  -- Page 8: T&C
  terms_accepted boolean DEFAULT false,
  terms_accepted_at timestamptz,
  
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all KY tables
ALTER TABLE public.kyf_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyw_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for KYF
CREATE POLICY "Users can view their own kyf response" ON public.kyf_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own kyf response" ON public.kyf_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own kyf response" ON public.kyf_responses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all kyf responses" ON public.kyf_responses
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all kyf responses" ON public.kyf_responses
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for KYC
CREATE POLICY "Users can view their own kyc response" ON public.kyc_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own kyc response" ON public.kyc_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own kyc response" ON public.kyc_responses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all kyc responses" ON public.kyc_responses
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all kyc responses" ON public.kyc_responses
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for KYW
CREATE POLICY "Users can view their own kyw response" ON public.kyw_responses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own kyw response" ON public.kyw_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own kyw response" ON public.kyw_responses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all kyw responses" ON public.kyw_responses
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all kyw responses" ON public.kyw_responses
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_kyf_responses_updated_at
  BEFORE UPDATE ON public.kyf_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kyc_responses_updated_at
  BEFORE UPDATE ON public.kyc_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kyw_responses_updated_at
  BEFORE UPDATE ON public.kyw_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
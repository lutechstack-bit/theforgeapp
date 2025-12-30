-- Create enums for profile fields
CREATE TYPE public.payment_status AS ENUM ('CONFIRMED_15K', 'BALANCE_PAID');
CREATE TYPE public.unlock_level AS ENUM ('PREVIEW', 'FULL');
CREATE TYPE public.forge_mode AS ENUM ('PRE_FORGE', 'DURING_FORGE', 'POST_FORGE');
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.notification_type AS ENUM ('COMMUNITY', 'LEARN', 'EVENTS', 'ROADMAP', 'SYSTEM');

-- Create editions table
CREATE TABLE public.editions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  forge_start_date TIMESTAMP WITH TIME ZONE,
  forge_end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  payment_status payment_status NOT NULL DEFAULT 'CONFIRMED_15K',
  unlock_level unlock_level NOT NULL DEFAULT 'PREVIEW',
  forge_mode forge_mode NOT NULL DEFAULT 'PRE_FORGE',
  edition_id UUID REFERENCES public.editions(id),
  city TEXT,
  kyf_completed BOOLEAN NOT NULL DEFAULT false,
  bio TEXT,
  instagram_handle TEXT,
  twitter_handle TEXT,
  specialty TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_global BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create home_cards table for admin-managed cards
CREATE TABLE public.home_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  card_type TEXT NOT NULL,
  link TEXT,
  image_url TEXT,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create roadmap_days table
CREATE TABLE public.roadmap_days (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  edition_id UUID REFERENCES public.editions(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date DATE,
  location TEXT,
  call_time TIME,
  checklist JSONB,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create community_messages table
CREATE TABLE public.community_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create learn_content table
CREATE TABLE public.learn_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  video_url TEXT,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  category TEXT NOT NULL,
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  image_url TEXT,
  is_virtual BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create perks table
CREATE TABLE public.perks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  partner_name TEXT,
  partner_logo_url TEXT,
  claim_instructions TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learn_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.editions ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert profiles" ON public.profiles FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id OR is_global = true);
CREATE POLICY "Users can update their notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage notifications" ON public.notifications FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Home cards policies (everyone can view, admins can manage)
CREATE POLICY "Everyone can view active home cards" ON public.home_cards FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage home cards" ON public.home_cards FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Roadmap policies (everyone can view)
CREATE POLICY "Everyone can view roadmap" ON public.roadmap_days FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage roadmap" ON public.roadmap_days FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Community messages policies
CREATE POLICY "Authenticated users can view messages" ON public.community_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can post messages" ON public.community_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Learn content policies (everyone can view)
CREATE POLICY "Everyone can view learn content" ON public.learn_content FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage learn content" ON public.learn_content FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Events policies (everyone can view)
CREATE POLICY "Everyone can view events" ON public.events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Perks policies (everyone can view)
CREATE POLICY "Everyone can view active perks" ON public.perks FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins can manage perks" ON public.perks FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Editions policies
CREATE POLICY "Everyone can view editions" ON public.editions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage editions" ON public.editions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_home_cards_updated_at BEFORE UPDATE ON public.home_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_roadmap_days_updated_at BEFORE UPDATE ON public.roadmap_days FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
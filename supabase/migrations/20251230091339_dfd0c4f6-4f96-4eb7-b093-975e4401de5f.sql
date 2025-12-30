-- First, try to insert or update the profile (in case trigger already created one)
INSERT INTO public.profiles (id, email, full_name, payment_status, unlock_level)
SELECT u.id, 'test@test.com', 'Admin User', 'BALANCE_PAID', 'FULL'
FROM auth.users u WHERE u.email = 'test@test.com'
ON CONFLICT (id) DO UPDATE SET 
  full_name = 'Admin User',
  payment_status = 'BALANCE_PAID',
  unlock_level = 'FULL';

-- Add admin role if user exists
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'
FROM auth.users u WHERE u.email = 'test@test.com'
ON CONFLICT (user_id, role) DO NOTHING;
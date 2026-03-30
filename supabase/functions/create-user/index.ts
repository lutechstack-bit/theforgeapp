import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_TEXT_LENGTH = 255;

function validateInput(body: Record<string, unknown>): string | null {
  const { email, password, full_name, phone, city, specialty } = body;

  if (!email || typeof email !== 'string') return 'Email is required';
  if (!EMAIL_REGEX.test(email)) return 'Invalid email format';
  if (email.length > MAX_TEXT_LENGTH) return 'Email too long';

  if (!password || typeof password !== 'string') return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 128) return 'Password too long';

  if (full_name !== undefined && (typeof full_name !== 'string' || full_name.length > MAX_TEXT_LENGTH)) return 'Invalid full name';
  if (phone !== undefined && (typeof phone !== 'string' || phone.length > 20)) return 'Invalid phone';
  if (city !== undefined && (typeof city !== 'string' || city.length > MAX_TEXT_LENGTH)) return 'Invalid city';
  if (specialty !== undefined && (typeof specialty !== 'string' || specialty.length > MAX_TEXT_LENGTH)) return 'Invalid specialty';

  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user: callingUser }, error: authError } = await userClient.auth.getUser();
    if (authError || !callingUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: roles, error: roleError } = await userClient
      .from('user_roles')
      .select('role')
      .eq('user_id', callingUser.id)
      .eq('role', 'admin');

    if (roleError || !roles || roles.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const validationError = validateInput(body);
    if (validationError) {
      return new Response(
        JSON.stringify({ error: validationError }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const {
      email,
      password,
      full_name,
      phone,
      city,
      edition_id,
      specialty,
      payment_status = 'CONFIRMED_15K'
    } = body;

    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name }
    });

    if (createError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newUserId = authData.user.id;

    const { error: profileError } = await adminClient
      .from('profiles')
      .update({
        full_name,
        phone,
        city,
        edition_id,
        specialty,
        payment_status,
        unlock_level: payment_status === 'BALANCE_PAID' ? 'FULL' : 'PREVIEW',
        profile_setup_completed: true
      })
      .eq('id', newUserId);

    if (profileError) {
      console.error('Error updating profile:', profileError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: newUserId,
        message: 'User created successfully' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

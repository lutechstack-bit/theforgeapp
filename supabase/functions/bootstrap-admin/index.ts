import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Create admin client with service role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Parse the request body
    const { email, password, force } = await req.json();

    // Check if any admin already exists (unless force flag is set)
    if (!force) {
      const { data: existingAdmins, error: checkError } = await adminClient
        .from('user_roles')
        .select('id')
        .eq('role', 'admin')
        .limit(1);

      if (checkError) {
        console.error('Error checking existing admins:', checkError);
      }

      if (existingAdmins && existingAdmins.length > 0) {
        return new Response(
          JSON.stringify({ error: 'Admin already exists. Bootstrap disabled. Use force:true to override.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: 'Email and password are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating bootstrap admin user:', email);

    // Create the auth user
    const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: 'Admin User' }
    });

    if (createError) {
      console.error('Error creating auth user:', createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newUserId = authData.user.id;
    console.log('Auth user created:', newUserId);

    // Update the profile (auto-created by trigger)
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({
        full_name: 'Admin User',
        email: email,
        payment_status: 'BALANCE_PAID',
        unlock_level: 'FULL'
      })
      .eq('id', newUserId);

    if (profileError) {
      console.error('Error updating profile:', profileError);
    }

    // Assign admin role
    const { error: roleError } = await adminClient
      .from('user_roles')
      .insert({ user_id: newUserId, role: 'admin' });

    if (roleError) {
      console.error('Error assigning admin role:', roleError);
      return new Response(
        JSON.stringify({ error: 'User created but failed to assign admin role: ' + roleError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Bootstrap admin created successfully:', email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: newUserId,
        message: 'Admin user created successfully. You can now login at /auth' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { accessToken, phone } = await req.json();

    if (!accessToken || !phone) {
      return new Response(JSON.stringify({ success: false, error: 'Missing accessToken or phone' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Server-side re-verify the MSG91 access token
    const msg91Res = await fetch('https://control.msg91.com/api/v5/widget/verifyAccessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authkey: Deno.env.get('MSG91_AUTHKEY'),
        'access-token': accessToken,
      }),
    });
    const msg91Data = await msg91Res.json();
    if (msg91Data.type !== 'success') {
      return new Response(JSON.stringify({ success: false, error: 'OTP verification failed' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Normalize phone
    const digits = phone.replace(/\D/g, '');
    const normalized = digits.length === 10 ? `91${digits}` : digits;
    if (normalized.length < 11) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid phone number' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 3. Look up profile by phone
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', normalized)
      .single();

    let userId: string;
    let isNewUser = false;

    if (profile) {
      userId = profile.id;
    } else {
      // Create new auth user
      isNewUser = true;
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email: `phone_${normalized}@forge.local`,
        email_confirm: true,
        phone: normalized,
        phone_confirm: true,
        user_metadata: { signup_method: 'phone_otp', phone: normalized },
      });
      if (createErr || !newUser.user) {
        return new Response(JSON.stringify({ success: false, error: createErr?.message || 'User creation failed' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      userId = newUser.user.id;

      // Create profile
      const { error: profileErr } = await supabase
        .from('profiles')
        .insert({ id: userId, phone: normalized, profile_setup_completed: false });

      if (profileErr) {
        // Rollback — delete the auth user to avoid orphans
        await supabase.auth.admin.deleteUser(userId);
        return new Response(JSON.stringify({ success: false, error: 'Profile creation failed' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 4. Get user email and generate magic link
    const { data: userData, error: userErr } = await supabase.auth.admin.getUserById(userId);
    if (userErr || !userData.user?.email) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to get user' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userData.user.email,
    });
    if (linkErr || !linkData) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to generate session link' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      isNewUser,
      userId,
      token_hash: linkData.properties?.hashed_token,
      type: 'magiclink',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

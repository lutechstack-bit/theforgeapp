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
    const body = await req.json();
    const { accessToken, phone } = body;

    console.log('Request received:', { phone, hasAccessToken: !!accessToken, tokenPrefix: accessToken?.slice(0, 20) });

    if (!accessToken || !phone) {
      return new Response(JSON.stringify({ success: false, error: 'Missing accessToken or phone' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 1. Server-side verify MSG91 token
    let msg91Data: any;
    try {
      const authkey = Deno.env.get('MSG91_AUTHKEY');
      console.log('Calling MSG91 verify, authkey present:', !!authkey);

      const msg91Res = await fetch('https://control.msg91.com/api/v5/widget/verifyAccessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authkey,
          'access-token': accessToken,
        }),
      });
      const rawText = await msg91Res.text();
      console.log('MSG91 raw response status:', msg91Res.status, 'body:', rawText.slice(0, 200));
      msg91Data = JSON.parse(rawText);
    } catch (fetchErr) {
      console.error('MSG91 fetch error:', fetchErr);
      return new Response(JSON.stringify({ success: false, error: 'MSG91 request failed: ' + String(fetchErr) }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (msg91Data.type !== 'success') {
      return new Response(JSON.stringify({ success: false, error: 'MSG91 rejected token: ' + JSON.stringify(msg91Data) }), {
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
    const { data: profile, error: profileLookupErr } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', normalized)
      .single();

    console.log('Profile lookup:', { normalized, found: !!profile, error: profileLookupErr?.message });

    let userId: string;
    let isNewUser = false;

    if (profile) {
      userId = profile.id;
    } else {
      isNewUser = true;
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email: `phone_${normalized}@forge.local`,
        email_confirm: true,
        phone: normalized,
        phone_confirm: true,
        user_metadata: { signup_method: 'phone_otp', phone: normalized },
      });
      if (createErr || !newUser.user) {
        console.error('User creation error:', createErr);
        return new Response(JSON.stringify({ success: false, error: createErr?.message || 'User creation failed' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      userId = newUser.user.id;

      const { error: profileErr } = await supabase
        .from('profiles')
        .insert({ id: userId, phone: normalized, profile_setup_completed: false });

      if (profileErr) {
        console.error('Profile insert error:', profileErr);
        await supabase.auth.admin.deleteUser(userId);
        return new Response(JSON.stringify({ success: false, error: 'Profile creation failed: ' + profileErr.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // 4. Generate magic link
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    if (!userData?.user?.email) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to get user email' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userData.user.email,
    });
    if (linkErr || !linkData) {
      console.error('Magic link error:', linkErr);
      return new Response(JSON.stringify({ success: false, error: 'Failed to generate session: ' + linkErr?.message }), {
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
    console.error('Unhandled error:', err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

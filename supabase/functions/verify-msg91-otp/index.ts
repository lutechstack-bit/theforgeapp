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

    // 1. Server-side verify MSG91 token
    const msg91Res = await fetch('https://control.msg91.com/api/v5/widget/verifyAccessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authkey: Deno.env.get('MSG91_AUTHKEY'), 'access-token': accessToken }),
    });
    const msg91Data = await msg91Res.json().catch(() => ({}));

    // Accept 'success' OR 'already verified' — widget consumes the token client-side
    const isVerified = msg91Data.type === 'success' ||
      String(msg91Data.message || '').toLowerCase().includes('already verif');

    if (!isVerified) {
      return new Response(JSON.stringify({ success: false, error: msg91Data.message || 'OTP verification failed' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Normalize phone to E.164 digits (91XXXXXXXXXX)
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

    // 3. Look up existing profile by phone — OTP login is for existing users only
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', normalized)
      .limit(1);
    const profile = profiles?.[0] ?? null;

    if (!profile) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No account found with this number. Please contact your program coordinator.',
      }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = profile.id;

    // 4. Generate magic link for passwordless session
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    if (!userData?.user?.email) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to get user account' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userData.user.email,
    });
    if (linkErr || !linkData) {
      return new Response(JSON.stringify({ success: false, error: 'Failed to generate session: ' + linkErr?.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      isNewUser: false,
      userId,
      token_hash: linkData.properties?.hashed_token,
      type: 'magiclink',
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

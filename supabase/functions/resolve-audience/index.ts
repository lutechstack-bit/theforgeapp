// resolve-audience — resolves a filter_criteria JSON into matching user profiles.
//
// Called by:
//   - AdminEmailAudienceEdit  (live preview while building filters)
//   - AdminEmailAudiences     (count badges on list page)
//   - AdminEmailSend          (Audience tab — expand audience → recipient IDs)
//
// POST body:
//   {
//     filter_criteria: FilterCriteria,
//     count_only?: boolean,   // true → just return count, no user list (fast)
//     preview?: boolean,      // true → cap user list at 20 for preview pane
//   }
//
// FilterCriteria shape (mirrors email_audiences.filter_criteria):
//   {
//     edition_ids?: string[],
//     cohort_types?: string[],
//     forge_modes?: string[],
//     onboarding_completed?: boolean,
//     ky_completed?: boolean,
//     has_photo?: boolean,
//     cities?: string[],
//   }
//
// Response:
//   { count: number, users?: { id, email, full_name }[] }
//   (users omitted when count_only=true)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

interface FilterCriteria {
  edition_ids?: string[];
  cohort_types?: string[];
  forge_modes?: string[];
  onboarding_completed?: boolean;
  ky_completed?: boolean;
  has_photo?: boolean;
  cities?: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  // ── Auth: require admin ──────────────────────────────────────────────────────
  const authHeader = req.headers.get('authorization');
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  // Verify the calling user is an admin
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Simple admin check via profiles.is_admin
  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle();
  if (!profile?.is_admin) {
    return new Response('Forbidden', { status: 403, headers: corsHeaders });
  }

  // ── Parse request ────────────────────────────────────────────────────────────
  let body: { filter_criteria: FilterCriteria; count_only?: boolean; preview?: boolean };
  try {
    body = await req.json();
  } catch {
    return new Response('Invalid JSON', { status: 400, headers: corsHeaders });
  }

  const filter: FilterCriteria = body.filter_criteria || {};
  const countOnly = !!body.count_only;
  const preview = !!body.preview;

  // Guard: no filters → return 0 (prevent accidental "send to everyone")
  const hasAnyFilter =
    (filter.edition_ids?.length ?? 0) > 0 ||
    (filter.cohort_types?.length ?? 0) > 0 ||
    (filter.forge_modes?.length ?? 0) > 0 ||
    filter.onboarding_completed !== undefined ||
    filter.ky_completed !== undefined ||
    filter.has_photo !== undefined ||
    (filter.cities?.length ?? 0) > 0;

  if (!hasAnyFilter) {
    return new Response(JSON.stringify({ count: 0, users: [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // ── Resolve edition IDs (handles cohort_type join) ───────────────────────────
  let editionIdsToFilter: string[] | null = null;

  if ((filter.edition_ids?.length ?? 0) > 0) {
    editionIdsToFilter = filter.edition_ids!;
  }

  if ((filter.cohort_types?.length ?? 0) > 0) {
    const { data: editionRows } = await admin
      .from('editions')
      .select('id')
      .in('cohort_type', filter.cohort_types!);
    const cohortEditionIds = (editionRows || []).map((e: { id: string }) => e.id);

    if (editionIdsToFilter !== null) {
      // Intersect — must satisfy BOTH edition AND cohort filters
      editionIdsToFilter = editionIdsToFilter.filter((id) =>
        cohortEditionIds.includes(id)
      );
    } else {
      editionIdsToFilter = cohortEditionIds;
    }
  }

  // ── Count-only fast path ─────────────────────────────────────────────────────
  if (countOnly) {
    let q = admin
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('is_admin', false)
      .not('email', 'is', null);

    if (editionIdsToFilter !== null) {
      if (editionIdsToFilter.length === 0) {
        // Intersection produced empty set — no matches possible
        return new Response(JSON.stringify({ count: 0 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      q = q.in('edition_id', editionIdsToFilter);
    }
    if ((filter.forge_modes?.length ?? 0) > 0) {
      q = q.in('forge_mode', filter.forge_modes!);
    }
    if (filter.onboarding_completed === true) q = q.eq('profile_setup_completed', true);
    else if (filter.onboarding_completed === false) q = q.eq('profile_setup_completed', false);

    if (filter.ky_completed === true) q = q.eq('ky_form_completed', true);
    else if (filter.ky_completed === false) q = q.eq('ky_form_completed', false);

    if (filter.has_photo === true) q = q.not('avatar_url', 'is', null);
    else if (filter.has_photo === false) q = q.is('avatar_url', null);

    if ((filter.cities?.length ?? 0) > 0) q = q.in('city', filter.cities!);

    const { count, error } = await q;
    if (error) {
      console.error('[resolve-audience] count error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ count: count ?? 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // ── Full query ───────────────────────────────────────────────────────────────
  if (editionIdsToFilter !== null && editionIdsToFilter.length === 0) {
    return new Response(JSON.stringify({ count: 0, users: [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let q = admin
    .from('profiles')
    .select('id, full_name, email, avatar_url, forge_mode, city', { count: 'exact' })
    .eq('is_admin', false)
    .not('email', 'is', null);

  if (editionIdsToFilter !== null) q = q.in('edition_id', editionIdsToFilter);
  if ((filter.forge_modes?.length ?? 0) > 0) q = q.in('forge_mode', filter.forge_modes!);
  if (filter.onboarding_completed === true) q = q.eq('profile_setup_completed', true);
  else if (filter.onboarding_completed === false) q = q.eq('profile_setup_completed', false);
  if (filter.ky_completed === true) q = q.eq('ky_form_completed', true);
  else if (filter.ky_completed === false) q = q.eq('ky_form_completed', false);
  if (filter.has_photo === true) q = q.not('avatar_url', 'is', null);
  else if (filter.has_photo === false) q = q.is('avatar_url', null);
  if ((filter.cities?.length ?? 0) > 0) q = q.in('city', filter.cities!);

  q = q.order('full_name').limit(preview ? 20 : 5000);

  const { data, count, error } = await q;
  if (error) {
    console.error('[resolve-audience] query error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const users = (data || []).map((p: any) => ({
    id: p.id,
    email: p.email,
    full_name: p.full_name,
  }));

  return new Response(JSON.stringify({ count: count ?? users.length, users }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});

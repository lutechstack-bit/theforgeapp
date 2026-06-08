// Placeholder send function (Prompt 1). Just records a scheduled campaign row.
// The real send pipeline (token rendering, web-push delivery) arrives in Prompt 3.
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    );
    const body = await req.json().catch(() => ({}));
    const { template_id, audience_id, rule_id, target_user_ids, title_override, body_override } = body;
    if (!template_id) {
      return new Response(JSON.stringify({ error: 'template_id is required' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
    const { data, error } = await supabase.from('notification_campaigns').insert({
      template_id, audience_id: audience_id ?? null, rule_id: rule_id ?? null,
      target_user_ids: target_user_ids ?? [],
      title_override: title_override ?? null, body_override: body_override ?? null,
      status: 'scheduled', scheduled_for: new Date().toISOString(),
    }).select().single();
    if (error) throw error;
    return new Response(JSON.stringify({
      ok: true, campaign: data,
      note: 'Will be implemented in Prompt 3 - send pipeline',
    }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});

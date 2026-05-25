import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── CSV parser ────────────────────────────────────────────────────────────────
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(cell.trim());
        cell = '';
      } else if (char === '\n' || (char === '\r' && next === '\n')) {
        if (char === '\r') i++;
        row.push(cell.trim());
        cell = '';
        if (row.some(c => c !== '')) rows.push(row);
        row = [];
      } else {
        cell += char;
      }
    }
  }

  // Last row
  if (cell || row.length) {
    row.push(cell.trim());
    if (row.some(c => c !== '')) rows.push(row);
  }

  return rows;
}

// ── Main handler ──────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const respond = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  try {
    // ── Auth: must be a logged-in admin ──────────────────────────────────────
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const authHeader = req.headers.get('Authorization') ?? '';
    const token = authHeader.replace('Bearer ', '');
    if (!token) return respond({ error: 'Unauthorized' }, 401);

    const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
    if (authErr || !user) return respond({ error: 'Unauthorized' }, 401);

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) return respond({ error: 'Forbidden — admins only' }, 403);

    // ── Sheet config ──────────────────────────────────────────────────────────
    const sheetId = Deno.env.get('GOOGLE_SHEET_ID');
    if (!sheetId) {
      return respond({ error: 'GOOGLE_SHEET_ID secret not set in Supabase' }, 500);
    }

    // Optional: which tab name to read (defaults to first sheet)
    const url = new URL(req.url);
    const sheetName = url.searchParams.get('sheet') ?? Deno.env.get('GOOGLE_SHEET_NAME') ?? '';

    // ── Fetch CSV from Google Sheets ─────────────────────────────────────────
    // Works for sheets shared as "Anyone with the link can view"
    const csvUrl = sheetName
      ? `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`
      : `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

    const sheetRes = await fetch(csvUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 Forge-Admin-Bot/1.0' },
    });

    if (!sheetRes.ok) {
      const errText = await sheetRes.text().catch(() => '');
      if (sheetRes.status === 302 || sheetRes.status === 403) {
        return respond({
          error: 'Cannot access the Google Sheet. Make sure it is shared as "Anyone with the link can view".',
          hint: 'In Google Sheets → Share → Change to "Anyone with the link" → Viewer',
          status: sheetRes.status,
        }, 502);
      }
      return respond({ error: `Google Sheets error ${sheetRes.status}: ${errText.slice(0, 200)}` }, 502);
    }

    const csvText = await sheetRes.text();

    if (!csvText.trim()) {
      return respond({ headers: [], rows: [], total: 0 });
    }

    // ── Parse ─────────────────────────────────────────────────────────────────
    const parsed = parseCSV(csvText);
    if (parsed.length === 0) return respond({ headers: [], rows: [], total: 0 });

    const headers = parsed[0];
    const rows = parsed.slice(1).map(r => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => { obj[h] = r[i] ?? ''; });
      return obj;
    });

    // Filter out completely empty rows
    const nonEmpty = rows.filter(r => Object.values(r).some(v => v !== ''));

    return respond({ headers, rows: nonEmpty, total: nonEmpty.length });

  } catch (err) {
    console.error('[get-sheet-data]', err);
    return respond({ error: String(err) }, 500);
  }
});

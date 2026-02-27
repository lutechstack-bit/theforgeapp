const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const title = url.searchParams.get('title') || 'Event';
    const description = url.searchParams.get('description') || '';
    const start = url.searchParams.get('start') || '';
    const end = url.searchParams.get('end') || '';
    const location = url.searchParams.get('location') || '';

    const escapeText = (text: string): string => {
      return text.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n');
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//LevelUp//Events//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${escapeText(title)}`,
      description ? `DESCRIPTION:${escapeText(description)}` : '',
      `LOCATION:${escapeText(location)}`,
      `UID:${Date.now()}@levelup.events`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].filter(Boolean).join('\r\n');

    return new Response(icsContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${title.replace(/[^a-zA-Z0-9]/g, '_')}.ics"`,
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function base64urlEncode(data: Uint8Array): string {
  let binary = "";
  for (const byte of data) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function generateSignature(
  sdkKey: string,
  sdkSecret: string,
  meetingNumber: string,
  role: number
): Promise<string> {
  const iat = Math.floor(Date.now() / 1000) - 30;
  const exp = iat + 60 * 60 * 2; // 2 hours
  const tokenExp = iat + 60 * 60 * 2;

  const header = { alg: "HS256", typ: "JWT" };
  const payload = {
    sdkKey,
    mn: meetingNumber,
    role,
    iat,
    exp,
    tokenExp,
    appKey: sdkKey,
  };

  const encoder = new TextEncoder();
  const headerB64 = base64urlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64urlEncode(encoder.encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(sdkSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(signingInput)
  );

  const signatureB64 = base64urlEncode(new Uint8Array(signatureBuffer));
  return `${signingInput}.${signatureB64}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Validate auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse and validate body
    const body = await req.json();
    const meetingNumber = String(body.meetingNumber || "").trim();
    const role = Number(body.role ?? 0);

    if (!meetingNumber || meetingNumber.length < 5) {
      return new Response(
        JSON.stringify({ error: "Invalid meetingNumber" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (role !== 0 && role !== 1) {
      return new Response(
        JSON.stringify({ error: "Invalid role. Must be 0 (attendee) or 1 (host)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sdkKey = Deno.env.get("ZOOM_MEETING_SDK_KEY");
    const sdkSecret = Deno.env.get("ZOOM_MEETING_SDK_SECRET");

    if (!sdkKey || !sdkSecret) {
      console.error("Zoom SDK credentials not configured");
      return new Response(
        JSON.stringify({ error: "Zoom integration not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const signature = await generateSignature(sdkKey, sdkSecret, meetingNumber, role);

    return new Response(
      JSON.stringify({ signature, sdkKey }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("zoom-signature error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Bluesky connection — uses ATProto App Password (not OAuth)
// Docs: https://docs.bsky.app/docs/get-started
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("No auth header");

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) throw new Error("Unauthorized");

    const { handle, appPassword, service } = await req.json();
    if (!handle || !appPassword) {
      return new Response(JSON.stringify({ error: "Plotëso handle dhe app password." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const pdsHost = service || "https://bsky.social";

    // Create session with ATProto
    const sessRes = await fetch(`${pdsHost}/xrpc/com.atproto.server.createSession`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: handle, password: appPassword }),
    });
    const sessData = await sessRes.json();
    if (!sessRes.ok || !sessData.accessJwt) {
      throw new Error(sessData.message || "Bluesky login failed. Verifiko handle / app password.");
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    await admin.from("social_accounts").insert({
      user_id: userData.user.id,
      platform: "bluesky",
      provider: "bluesky",
      channel_type: "bluesky",
      account_id: sessData.did,
      external_account_id: sessData.did,
      account_name: sessData.handle,
      display_name: sessData.handle,
      handle_or_address: sessData.handle,
      access_token: sessData.accessJwt,
      refresh_token: sessData.refreshJwt || null,
      token_expires_at: null,
      is_connected: true,
      status: "connected",
      account_type: "personal",
      connection_mode: "professional",
      capabilities: ["auto_post", "scheduling"],
      provider_metadata: { did: sessData.did, pds: pdsHost },
    });

    return new Response(JSON.stringify({
      success: true, platform: "bluesky", accountName: sessData.handle,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("bluesky-connect error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Mastodon connection — uses access token from user's instance
// Docs: https://docs.joinmastodon.org/methods/accounts/
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

    const { instanceUrl, accessToken } = await req.json();
    if (!instanceUrl || !accessToken) {
      return new Response(JSON.stringify({ error: "Plotëso instance URL dhe access token." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleanInstance = instanceUrl.replace(/\/$/, "").replace(/^https?:\/\//, "");
    const fullInstance = `https://${cleanInstance}`;

    // Verify credentials
    const verifyRes = await fetch(`${fullInstance}/api/v1/accounts/verify_credentials`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const acct = await verifyRes.json();
    if (!verifyRes.ok || !acct.id) {
      throw new Error(acct.error || "Mastodon verification failed.");
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    await admin.from("social_accounts").insert({
      user_id: userData.user.id,
      platform: "mastodon",
      provider: "mastodon",
      channel_type: "mastodon",
      account_id: acct.id,
      external_account_id: acct.id,
      account_name: acct.username,
      display_name: acct.display_name || acct.username,
      handle_or_address: `@${acct.username}@${cleanInstance}`,
      access_token: accessToken,
      refresh_token: null,
      token_expires_at: null,
      is_connected: true,
      status: "connected",
      account_type: "personal",
      connection_mode: "professional",
      capabilities: ["auto_post", "scheduling"],
      provider_metadata: { instance: fullInstance, account: acct },
    });

    return new Response(JSON.stringify({
      success: true, platform: "mastodon", accountName: acct.username,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("mastodon-connect error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Pinterest API v5 OAuth
// Docs: https://developers.pinterest.com/docs/getting-started/authentication/
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    const PINTEREST_APP_ID = Deno.env.get("PINTEREST_APP_ID");
    const PINTEREST_APP_SECRET = Deno.env.get("PINTEREST_APP_SECRET");

    if (!PINTEREST_APP_ID || !PINTEREST_APP_SECRET) {
      return new Response(JSON.stringify({
        error: "PINTEREST_APP_ID / PINTEREST_APP_SECRET nuk janë konfiguruar.",
      }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "authorize") {
      const { redirectUri, connectionMode } = await req.json();
      const state = btoa(JSON.stringify({
        platform: "pinterest", connectionMode: connectionMode || "professional", redirectUri,
      }));

      const scopes = ["boards:read", "boards:write", "pins:read", "pins:write", "user_accounts:read"];
      const authUrl = new URL("https://www.pinterest.com/oauth/");
      authUrl.searchParams.set("client_id", PINTEREST_APP_ID);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", scopes.join(","));
      authUrl.searchParams.set("state", state);

      return new Response(JSON.stringify({ authUrl: authUrl.toString() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "callback") {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

      const { code, redirectUri, state: stateB64 } = await req.json();
      const authHeader = req.headers.get("authorization");
      const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader! } },
      });
      const { data: userData } = await userClient.auth.getUser();
      if (!userData.user) throw new Error("Unauthorized");

      const { connectionMode } = JSON.parse(atob(stateB64));

      const basicAuth = btoa(`${PINTEREST_APP_ID}:${PINTEREST_APP_SECRET}`);
      const tokenRes = await fetch("https://api.pinterest.com/v5/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${basicAuth}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code", code, redirect_uri: redirectUri,
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        throw new Error(`Pinterest token exchange failed: ${JSON.stringify(tokenData)}`);
      }

      const userRes = await fetch("https://api.pinterest.com/v5/user_account", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const pinUser = await userRes.json();
      if (!userRes.ok) throw new Error(`Pinterest user fetch failed: ${JSON.stringify(pinUser)}`);

      const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const expiresAt = tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null;

      await admin.from("social_accounts").insert({
        user_id: userData.user.id,
        platform: "pinterest",
        provider: "pinterest",
        channel_type: "pinterest",
        account_id: pinUser.username,
        external_account_id: pinUser.username,
        account_name: pinUser.username,
        display_name: pinUser.business_name || pinUser.username,
        handle_or_address: `@${pinUser.username}`,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        token_expires_at: expiresAt,
        is_connected: true,
        status: "connected",
        account_type: pinUser.account_type === "BUSINESS" ? "business" : "personal",
        connection_mode: connectionMode || "professional",
        capabilities: ["auto_post", "scheduling", "analytics"],
        provider_metadata: pinUser,
      });

      return new Response(JSON.stringify({
        success: true, platform: "pinterest", accountName: pinUser.username,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("pinterest-oauth error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

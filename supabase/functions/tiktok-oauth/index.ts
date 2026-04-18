// TikTok Login Kit + Content Posting API
// Docs: https://developers.tiktok.com/doc/login-kit-web
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

    const TIKTOK_CLIENT_KEY = Deno.env.get("TIKTOK_CLIENT_KEY");
    const TIKTOK_CLIENT_SECRET = Deno.env.get("TIKTOK_CLIENT_SECRET");

    if (!TIKTOK_CLIENT_KEY || !TIKTOK_CLIENT_SECRET) {
      return new Response(JSON.stringify({
        error: "TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET nuk janë konfiguruar.",
      }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "authorize") {
      const { redirectUri, connectionMode } = await req.json();
      const state = btoa(JSON.stringify({
        platform: "tiktok", connectionMode: connectionMode || "professional", redirectUri,
      }));

      const scopes = ["user.info.basic", "user.info.profile", "user.info.stats", "video.list", "video.publish", "video.upload"];
      const authUrl = new URL("https://www.tiktok.com/v2/auth/authorize/");
      authUrl.searchParams.set("client_key", TIKTOK_CLIENT_KEY);
      authUrl.searchParams.set("scope", scopes.join(","));
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("redirect_uri", redirectUri);
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

      const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_key: TIKTOK_CLIENT_KEY, client_secret: TIKTOK_CLIENT_SECRET,
          code, grant_type: "authorization_code", redirect_uri: redirectUri,
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        throw new Error(`TikTok token exchange failed: ${JSON.stringify(tokenData)}`);
      }

      const userRes = await fetch(
        "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username",
        { headers: { Authorization: `Bearer ${tokenData.access_token}` } },
      );
      const userInfo = await userRes.json();
      const tikUser = userInfo.data?.user;
      if (!tikUser) throw new Error(`TikTok user fetch failed: ${JSON.stringify(userInfo)}`);

      const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const expiresAt = tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null;

      await admin.from("social_accounts").insert({
        user_id: userData.user.id,
        platform: "tiktok",
        provider: "tiktok",
        channel_type: "tiktok",
        account_id: tikUser.open_id,
        external_account_id: tikUser.open_id,
        account_name: tikUser.username || tikUser.display_name,
        display_name: tikUser.display_name,
        handle_or_address: `@${tikUser.username || tikUser.open_id}`,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        token_expires_at: expiresAt,
        is_connected: true,
        status: "connected",
        account_type: "creator",
        connection_mode: connectionMode || "professional",
        capabilities: ["auto_post", "scheduling", "analytics", "comments"],
        provider_metadata: tikUser,
      });

      return new Response(JSON.stringify({
        success: true, platform: "tiktok", accountName: tikUser.display_name,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("tiktok-oauth error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

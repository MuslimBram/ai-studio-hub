// YouTube OAuth 2.0 (Google OAuth + YouTube Data API v3)
// Docs: https://developers.google.com/youtube/v3/guides/auth/server-side-web-apps
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

    const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
    const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return new Response(JSON.stringify({
        error: "GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET nuk janë konfiguruar.",
      }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "authorize") {
      const { redirectUri, connectionMode } = await req.json();
      const state = btoa(JSON.stringify({
        platform: "youtube", connectionMode: connectionMode || "professional", redirectUri,
      }));

      const scopes = [
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/youtube.upload",
        "https://www.googleapis.com/auth/youtube.force-ssl",
        "https://www.googleapis.com/auth/yt-analytics.readonly",
      ];

      const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("scope", scopes.join(" "));
      authUrl.searchParams.set("access_type", "offline");
      authUrl.searchParams.set("prompt", "consent");
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

      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code, client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri, grant_type: "authorization_code",
        }),
      });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        throw new Error(`YouTube token exchange failed: ${JSON.stringify(tokenData)}`);
      }

      const channelRes = await fetch(
        "https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
        { headers: { Authorization: `Bearer ${tokenData.access_token}` } },
      );
      const channelData = await channelRes.json();
      const channel = channelData.items?.[0];
      if (!channel) throw new Error("No YouTube channel found for this account");

      const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const expiresAt = tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null;

      await admin.from("social_accounts").insert({
        user_id: userData.user.id,
        platform: "youtube",
        provider: "youtube",
        channel_type: "youtube",
        account_id: channel.id,
        external_account_id: channel.id,
        account_name: channel.snippet.title,
        display_name: channel.snippet.title,
        handle_or_address: channel.snippet.customUrl || channel.id,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        token_expires_at: expiresAt,
        is_connected: true,
        status: "connected",
        account_type: "creator",
        connection_mode: connectionMode || "professional",
        capabilities: ["auto_post", "scheduling", "analytics", "comments"],
        provider_metadata: channel,
      });

      return new Response(JSON.stringify({
        success: true, platform: "youtube", accountName: channel.snippet.title,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("youtube-oauth error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

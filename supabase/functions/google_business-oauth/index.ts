// Google Business Profile OAuth (uses same Google OAuth as YouTube but different scopes)
// Docs: https://developers.google.com/my-business/content/overview
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
        platform: "google_business", connectionMode: connectionMode || "professional", redirectUri,
      }));

      const scopes = [
        "https://www.googleapis.com/auth/business.manage",
        "openid", "email", "profile",
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
        throw new Error(`Google Business token exchange failed: ${JSON.stringify(tokenData)}`);
      }

      // Fetch user profile + first business account
      const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profile = await userRes.json();

      const acctsRes = await fetch("https://mybusinessaccountmanagement.googleapis.com/v1/accounts", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const acctsData = await acctsRes.json();
      const firstAcct = acctsData.accounts?.[0];

      const accountId = firstAcct?.name?.split("/")?.[1] || profile.id;
      const accountName = firstAcct?.accountName || profile.name || profile.email;

      const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const expiresAt = tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null;

      await admin.from("social_accounts").insert({
        user_id: userData.user.id,
        platform: "google_business",
        provider: "google",
        channel_type: "google_business",
        account_id: accountId,
        external_account_id: accountId,
        account_name: accountName,
        display_name: accountName,
        handle_or_address: profile.email || accountId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        token_expires_at: expiresAt,
        is_connected: true,
        status: "connected",
        account_type: "business",
        connection_mode: connectionMode || "professional",
        capabilities: ["auto_post", "analytics"],
        provider_metadata: { profile, account: firstAcct },
      });

      return new Response(JSON.stringify({
        success: true, platform: "google_business", accountName,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("google_business-oauth error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

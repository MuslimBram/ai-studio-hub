import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    const LINKEDIN_CLIENT_ID = Deno.env.get("LINKEDIN_CLIENT_ID");
    const LINKEDIN_CLIENT_SECRET = Deno.env.get("LINKEDIN_CLIENT_SECRET");

    if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
      throw new Error("LinkedIn credentials not configured");
    }

    // ─── 1. Generate OAuth URL ───
    if (action === "authorize") {
      const body = await req.json();
      const { redirectUri, connectionMode } = body;

      if (!redirectUri) {
        return new Response(JSON.stringify({ error: "Missing redirectUri" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const scopes = ["openid", "profile", "email", "w_member_social"];
      const state = btoa(JSON.stringify({ platform: "linkedin", connectionMode: connectionMode || "professional", redirectUri }));

      const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("client_id", LINKEDIN_CLIENT_ID);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("scope", scopes.join(" "));
      authUrl.searchParams.set("state", state);

      return new Response(JSON.stringify({ authUrl: authUrl.toString() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── 2. Exchange code for token ───
    if (action === "callback") {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

      const body = await req.json();
      const { code, redirectUri, state: stateB64 } = body;

      const authHeader = req.headers.get("authorization");
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const supabaseUser = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });

      const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
      if (userError || !user) {
        return new Response(JSON.stringify({ error: "Invalid user session" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      let stateData: { connectionMode: string };
      try {
        stateData = JSON.parse(atob(stateB64));
      } catch {
        stateData = { connectionMode: "professional" };
      }

      // Exchange code for tokens
      const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: redirectUri,
          client_id: LINKEDIN_CLIENT_ID,
          client_secret: LINKEDIN_CLIENT_SECRET,
        }),
      });

      const tokenData = await tokenRes.json();
      if (tokenData.error) {
        return new Response(JSON.stringify({ error: tokenData.error_description || "Token exchange failed" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const accessToken = tokenData.access_token;
      const refreshToken = tokenData.refresh_token || null;
      const expiresIn = tokenData.expires_in || 3600;
      const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

      // Get user profile from LinkedIn
      const profileRes = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const profileData = await profileRes.json();

      const accountName = profileData.name || profileData.given_name || "LinkedIn User";
      const accountId = profileData.sub || "";
      const handleOrAddress = profileData.email || "";

      const capabilities = ["auto_post", "scheduling", "analytics"];

      // Check for existing account
      const { data: existing } = await supabaseAdmin
        .from("social_accounts")
        .select("id")
        .eq("user_id", user.id)
        .eq("platform", "linkedin")
        .eq("external_account_id", accountId)
        .neq("status", "deleted")
        .maybeSingle();

      if (existing) {
        await supabaseAdmin.from("social_accounts").update({
          access_token: accessToken,
          refresh_token: refreshToken,
          is_connected: true,
          status: "connected",
          token_expires_at: tokenExpiresAt,
          account_name: accountName,
          display_name: accountName,
          handle_or_address: handleOrAddress,
          connection_mode: stateData.connectionMode,
          capabilities,
        }).eq("id", existing.id);
      } else {
        await supabaseAdmin.from("social_accounts").insert({
          user_id: user.id,
          platform: "linkedin",
          account_name: accountName,
          account_id: accountId,
          access_token: accessToken,
          refresh_token: refreshToken,
          is_connected: true,
          status: "connected",
          token_expires_at: tokenExpiresAt,
          connection_mode: stateData.connectionMode,
          account_type: "professional",
          capabilities,
          provider: "linkedin",
          channel_type: "linkedin",
          display_name: accountName,
          external_account_id: accountId,
          handle_or_address: handleOrAddress,
        });
      }

      return new Response(JSON.stringify({
        success: true,
        accountName,
        platform: "linkedin",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("linkedin-oauth error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

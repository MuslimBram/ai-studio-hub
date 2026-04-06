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

    // ─── 1. Generate OAuth URL ───
    if (action === "authorize") {
      const META_APP_ID = Deno.env.get("META_APP_ID");
      if (!META_APP_ID) throw new Error("META_APP_ID not configured");

      const body = await req.json();
      const { redirectUri, platform, accountType, connectionMode } = body;

      if (!redirectUri || !platform) {
        return new Response(JSON.stringify({ error: "Missing redirectUri or platform" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const state = JSON.stringify({ platform, accountType, redirectUri, connectionMode: connectionMode || "professional" });
      const stateEncoded = btoa(state);

      // ── Instagram Personal → Instagram Login API (v3) ──
      if (platform === "instagram" && accountType === "personal") {
        const scopes = [
          "business_basic",
          "business_manage_comments",
          "business_content_publish",
          "instagram_business_manage_insights",
        ];

        const authUrl = new URL("https://www.instagram.com/oauth/authorize");
        authUrl.searchParams.set("client_id", META_APP_ID);
        authUrl.searchParams.set("redirect_uri", redirectUri);
        authUrl.searchParams.set("scope", scopes.join(","));
        authUrl.searchParams.set("response_type", "code");
        authUrl.searchParams.set("state", stateEncoded);

        console.log("meta-oauth: Instagram Login API authorize URL generated");

        return new Response(JSON.stringify({ authUrl: authUrl.toString() }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ── Instagram Professional → Facebook Graph API ──
      let scopes: string[];
      if (platform === "instagram" && accountType === "professional") {
        scopes = [
          "instagram_basic",
          "instagram_content_publish",
          "instagram_manage_comments",
          "instagram_manage_insights",
          "pages_show_list",
          "pages_read_engagement",
        ];
      } else if (platform === "facebook") {
        scopes = [
          "pages_show_list",
          "pages_read_engagement",
          "pages_manage_posts",
          "pages_read_user_content",
        ];
      } else {
        scopes = ["pages_show_list"];
      }

      const authUrl = new URL("https://www.facebook.com/v21.0/dialog/oauth");
      authUrl.searchParams.set("client_id", META_APP_ID);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("scope", scopes.join(","));
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("state", stateEncoded);

      return new Response(JSON.stringify({ authUrl: authUrl.toString() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ─── 2. Exchange code for token ───
    if (action === "callback") {
      const META_APP_ID = Deno.env.get("META_APP_ID");
      const META_APP_SECRET = Deno.env.get("META_APP_SECRET");
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

      if (!META_APP_ID || !META_APP_SECRET) {
        throw new Error("Meta credentials not configured");
      }

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

      // Decode state
      let stateData: { platform: string; accountType: string; connectionMode: string };
      try {
        stateData = JSON.parse(atob(stateB64));
      } catch {
        stateData = { platform: "facebook", accountType: "professional", connectionMode: "professional" };
      }

      const isInstagramLoginAPI = stateData.platform === "instagram" && stateData.accountType === "personal";

      let accessToken: string;
      let expiresIn: number;
      let accountName = "";
      let accountId = "";
      let handleOrAddress = "";

      if (isInstagramLoginAPI) {
        // ── Instagram Login API token exchange ──
        console.log("meta-oauth: exchanging code via Instagram Login API");

        // Step 1: Exchange code for short-lived token
        const tokenForm = new URLSearchParams();
        tokenForm.set("client_id", META_APP_ID);
        tokenForm.set("client_secret", META_APP_SECRET);
        tokenForm.set("grant_type", "authorization_code");
        tokenForm.set("redirect_uri", redirectUri);
        tokenForm.set("code", code);

        const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
          method: "POST",
          body: tokenForm,
        });
        const tokenData = await tokenRes.json();
        console.log("meta-oauth: IG Login API short-lived token response status:", tokenRes.status);

        if (tokenData.error_type || tokenData.error_message) {
          return new Response(JSON.stringify({ error: tokenData.error_message || "Instagram token exchange failed" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const shortLivedToken = tokenData.access_token;
        const igUserId = tokenData.user_id?.toString() || "";

        // Step 2: Exchange for long-lived token
        const longLivedUrl = new URL("https://graph.instagram.com/access_token");
        longLivedUrl.searchParams.set("grant_type", "ig_exchange_token");
        longLivedUrl.searchParams.set("client_secret", META_APP_SECRET);
        longLivedUrl.searchParams.set("access_token", shortLivedToken);

        const longLivedRes = await fetch(longLivedUrl.toString());
        const longLivedData = await longLivedRes.json();
        console.log("meta-oauth: IG Login API long-lived token response status:", longLivedRes.status);

        accessToken = longLivedData.access_token || shortLivedToken;
        expiresIn = longLivedData.expires_in || 3600;

        // Step 3: Get user profile via Instagram Graph API
        const meRes = await fetch(
          `https://graph.instagram.com/v21.0/me?fields=user_id,username,name,account_type&access_token=${accessToken}`
        );
        const meData = await meRes.json();
        console.log("meta-oauth: IG user profile:", JSON.stringify(meData));

        accountName = meData.username ? `@${meData.username}` : (meData.name || "Instagram Personal");
        accountId = meData.user_id?.toString() || igUserId || meData.id?.toString() || "";
        handleOrAddress = meData.username ? `@${meData.username}` : "";

      } else {
        // ── Facebook Graph API token exchange (Professional Instagram & Facebook) ──
        const tokenUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
        tokenUrl.searchParams.set("client_id", META_APP_ID);
        tokenUrl.searchParams.set("redirect_uri", redirectUri);
        tokenUrl.searchParams.set("client_secret", META_APP_SECRET);
        tokenUrl.searchParams.set("code", code);

        const tokenRes = await fetch(tokenUrl.toString());
        const tokenData = await tokenRes.json();

        if (tokenData.error) {
          return new Response(JSON.stringify({ error: tokenData.error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Exchange short-lived for long-lived token
        const longLivedUrl = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
        longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
        longLivedUrl.searchParams.set("client_id", META_APP_ID);
        longLivedUrl.searchParams.set("client_secret", META_APP_SECRET);
        longLivedUrl.searchParams.set("fb_exchange_token", tokenData.access_token);

        const longLivedRes = await fetch(longLivedUrl.toString());
        const longLivedData = await longLivedRes.json();

        accessToken = longLivedData.access_token || tokenData.access_token;
        expiresIn = longLivedData.expires_in || 3600;

        // Get user info from Meta
        const meRes = await fetch(`https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${accessToken}`);
        const meData = await meRes.json();

        accountName = meData.name || "";
        accountId = meData.id || "";

        if (stateData.platform === "instagram") {
          const pagesRes = await fetch(
            `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,instagram_business_account&access_token=${accessToken}`
          );
          const pagesData = await pagesRes.json();
          const page = pagesData.data?.find((p: any) => p.instagram_business_account);

          if (page?.instagram_business_account) {
            const igRes = await fetch(
              `https://graph.facebook.com/v21.0/${page.instagram_business_account.id}?fields=id,username&access_token=${accessToken}`
            );
            const igData = await igRes.json();
            accountName = `@${igData.username || "instagram"}`;
            accountId = igData.id;
            handleOrAddress = `@${igData.username || ""}`;
          } else {
            return new Response(JSON.stringify({
              error: "Nuk u gjet llogari Instagram Business/Creator e lidhur me faqen tënde Facebook. Sigurohu që ke një Instagram Professional account."
            }), {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      }

      const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
      const connMode = stateData.connectionMode || "professional";

      // Determine capabilities based on platform + mode
      const capabilitiesMap: Record<string, string[]> = {
        "instagram:professional": ["auto_post", "scheduling", "analytics", "comments", "inbox", "stories", "reels", "notifications"],
        "instagram:personal": ["auto_post", "scheduling", "analytics", "comments", "notifications"],
        "facebook:professional": ["auto_post", "scheduling", "analytics", "media_upload", "insights"],
        "facebook:personal": ["scheduling"],
      };
      const capabilities = capabilitiesMap[`${stateData.platform}:${stateData.accountType}`] || ["scheduling"];

      // Check if this exact external account already exists for this user
      const { data: existing } = await supabaseAdmin
        .from("social_accounts")
        .select("id")
        .eq("user_id", user.id)
        .eq("platform", stateData.platform)
        .eq("external_account_id", accountId)
        .neq("status", "deleted")
        .maybeSingle();

      if (existing) {
        await supabaseAdmin.from("social_accounts").update({
          access_token: accessToken,
          is_connected: true,
          status: "connected",
          token_expires_at: tokenExpiresAt,
          account_name: accountName,
          display_name: accountName,
          handle_or_address: handleOrAddress,
          connection_mode: connMode,
          account_type: stateData.accountType,
          capabilities,
        }).eq("id", existing.id);
      } else {
        await supabaseAdmin.from("social_accounts").insert({
          user_id: user.id,
          platform: stateData.platform,
          account_name: accountName,
          account_id: accountId,
          access_token: accessToken,
          is_connected: true,
          status: "connected",
          token_expires_at: tokenExpiresAt,
          connection_mode: connMode,
          account_type: stateData.accountType,
          capabilities,
          provider: stateData.platform,
          channel_type: stateData.platform,
          display_name: accountName,
          external_account_id: accountId,
          handle_or_address: handleOrAddress,
        });
      }

      console.log(`meta-oauth: account saved successfully - ${accountName} (${stateData.platform}/${stateData.accountType})`);

      return new Response(JSON.stringify({
        success: true,
        accountName,
        platform: stateData.platform,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("meta-oauth error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

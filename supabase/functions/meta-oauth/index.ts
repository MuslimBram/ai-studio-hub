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
      const { redirectUri, platform, accountType } = body;

      if (!redirectUri || !platform) {
        return new Response(JSON.stringify({ error: "Missing redirectUri or platform" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Scopes based on platform & account type
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
      } else if (platform === "instagram" && accountType === "personal") {
        scopes = ["instagram_basic", "pages_show_list"];
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

      const state = JSON.stringify({ platform, accountType, redirectUri });
      const stateEncoded = btoa(state);

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

      // Get auth header to identify user
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
      let stateData: { platform: string; accountType: string };
      try {
        stateData = JSON.parse(atob(stateB64));
      } catch {
        stateData = { platform: "facebook", accountType: "professional" };
      }

      // Exchange code for short-lived token
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

      const accessToken = longLivedData.access_token || tokenData.access_token;
      const expiresIn = longLivedData.expires_in || 3600;

      // Get user info from Meta
      const meRes = await fetch(`https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${accessToken}`);
      const meData = await meRes.json();

      // For Instagram: get connected Instagram account
      let accountName = meData.name || "";
      let accountId = meData.id || "";

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
        } else if (stateData.accountType === "personal") {
          accountName = `${meData.name} (Personal)`;
        } else {
          return new Response(JSON.stringify({
            error: "Nuk u gjet llogari Instagram Business/Creator e lidhur me faqen tënde Facebook. Sigurohu që ke një Instagram Professional account."
          }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      // Save to DB
      const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

      // Check if account already exists
      const { data: existing } = await supabaseAdmin
        .from("social_accounts")
        .select("id")
        .eq("user_id", user.id)
        .eq("platform", stateData.platform)
        .eq("account_id", accountId)
        .maybeSingle();

      if (existing) {
        // Update existing
        await supabaseAdmin.from("social_accounts").update({
          access_token: accessToken,
          is_connected: true,
          token_expires_at: tokenExpiresAt,
          account_name: accountName,
        }).eq("id", existing.id);
      } else {
        // Insert new
        await supabaseAdmin.from("social_accounts").insert({
          user_id: user.id,
          platform: stateData.platform,
          account_name: accountName,
          account_id: accountId,
          access_token: accessToken,
          is_connected: true,
          token_expires_at: tokenExpiresAt,
        });
      }

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

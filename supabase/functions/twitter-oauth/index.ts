// Twitter / X OAuth 2.0 with PKCE flow
// Docs: https://docs.x.com/resources/fundamentals/authentication/oauth-2-0/authorization-code
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// PKCE helpers
function base64UrlEncode(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function generateCodeVerifier(): Promise<string> {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return base64UrlEncode(arr.buffer);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(digest);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    const TWITTER_CLIENT_ID = Deno.env.get("TWITTER_CLIENT_ID");
    const TWITTER_CLIENT_SECRET = Deno.env.get("TWITTER_CLIENT_SECRET");

    if (!TWITTER_CLIENT_ID || !TWITTER_CLIENT_SECRET) {
      return new Response(
        JSON.stringify({ error: "TWITTER_CLIENT_ID / TWITTER_CLIENT_SECRET nuk janë konfiguruar." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (action === "authorize") {
      const { redirectUri, connectionMode } = await req.json();
      if (!redirectUri) {
        return new Response(JSON.stringify({ error: "Missing redirectUri" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const verifier = await generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);
      const state = btoa(JSON.stringify({
        platform: "twitter",
        connectionMode: connectionMode || "professional",
        redirectUri,
        verifier,
        nonce: crypto.randomUUID(),
      }));

      const scopes = ["tweet.read", "tweet.write", "users.read", "offline.access"];
      const authUrl = new URL("https://twitter.com/i/oauth2/authorize");
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("client_id", TWITTER_CLIENT_ID);
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("scope", scopes.join(" "));
      authUrl.searchParams.set("state", state);
      authUrl.searchParams.set("code_challenge", challenge);
      authUrl.searchParams.set("code_challenge_method", "S256");

      return new Response(JSON.stringify({ authUrl: authUrl.toString() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "callback") {
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

      const { code, redirectUri, state: stateB64 } = await req.json();
      const authHeader = req.headers.get("authorization");
      if (!authHeader) throw new Error("No auth header");

      const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: userData } = await userClient.auth.getUser();
      if (!userData.user) throw new Error("Unauthorized");

      const { verifier, connectionMode } = JSON.parse(atob(stateB64));

      const basicAuth = btoa(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`);
      const tokenRes = await fetch("https://api.twitter.com/2/oauth2/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${basicAuth}`,
        },
        body: new URLSearchParams({
          code, grant_type: "authorization_code", client_id: TWITTER_CLIENT_ID,
          redirect_uri: redirectUri, code_verifier: verifier,
        }),
      });

      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.access_token) {
        throw new Error(`Twitter token exchange failed: ${JSON.stringify(tokenData)}`);
      }

      // Fetch user profile
      const meRes = await fetch("https://api.twitter.com/2/users/me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const meData = await meRes.json();
      if (!meRes.ok || !meData.data) throw new Error(`Twitter user fetch failed: ${JSON.stringify(meData)}`);

      const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const expiresAt = tokenData.expires_in
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : null;

      await admin.from("social_accounts").insert({
        user_id: userData.user.id,
        platform: "twitter",
        provider: "twitter",
        channel_type: "twitter",
        account_id: meData.data.id,
        external_account_id: meData.data.id,
        account_name: meData.data.username,
        display_name: meData.data.name || meData.data.username,
        handle_or_address: `@${meData.data.username}`,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        token_expires_at: expiresAt,
        is_connected: true,
        status: "connected",
        account_type: "creator",
        connection_mode: connectionMode || "professional",
        capabilities: ["auto_post", "scheduling", "analytics", "comments", "messaging"],
        provider_metadata: meData.data,
      });

      return new Response(JSON.stringify({
        success: true, platform: "twitter", accountName: meData.data.username,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("twitter-oauth error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

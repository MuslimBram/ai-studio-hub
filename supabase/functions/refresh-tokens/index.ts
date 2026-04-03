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

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const META_APP_ID = Deno.env.get("META_APP_ID");
  const META_APP_SECRET = Deno.env.get("META_APP_SECRET");
  const LINKEDIN_CLIENT_ID = Deno.env.get("LINKEDIN_CLIENT_ID");
  const LINKEDIN_CLIENT_SECRET = Deno.env.get("LINKEDIN_CLIENT_SECRET");

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const results: { id: string; platform: string; status: string; error?: string }[] = [];

  try {
    // Find accounts expiring within 7 days or already expired
    const cutoff = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: accounts, error } = await supabase
      .from("social_accounts")
      .select("id, platform, access_token, refresh_token, token_expires_at, user_id, external_account_id")
      .in("status", ["connected", "reconnect_required"])
      .eq("is_connected", true)
      .lt("token_expires_at", cutoff)
      .order("token_expires_at", { ascending: true })
      .limit(50);

    if (error) throw error;
    if (!accounts || accounts.length === 0) {
      return new Response(JSON.stringify({ refreshed: 0, results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    for (const account of accounts) {
      try {
        let newToken: string | null = null;
        let newExpiry: string | null = null;
        let newRefreshToken: string | null = null;

        if ((account.platform === "facebook" || account.platform === "instagram") && META_APP_ID && META_APP_SECRET) {
          // Meta: exchange long-lived token for new long-lived token
          const url = new URL("https://graph.facebook.com/v21.0/oauth/access_token");
          url.searchParams.set("grant_type", "fb_exchange_token");
          url.searchParams.set("client_id", META_APP_ID);
          url.searchParams.set("client_secret", META_APP_SECRET);
          url.searchParams.set("fb_exchange_token", account.access_token);

          const res = await fetch(url.toString());
          const data = await res.json();

          if (data.error) {
            throw new Error(data.error.message || "Meta token refresh failed");
          }

          newToken = data.access_token;
          newExpiry = new Date(Date.now() + (data.expires_in || 5184000) * 1000).toISOString();

        } else if (account.platform === "linkedin" && LINKEDIN_CLIENT_ID && LINKEDIN_CLIENT_SECRET && account.refresh_token) {
          // LinkedIn: use refresh_token grant
          const res = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              grant_type: "refresh_token",
              refresh_token: account.refresh_token,
              client_id: LINKEDIN_CLIENT_ID,
              client_secret: LINKEDIN_CLIENT_SECRET,
            }),
          });

          const data = await res.json();
          if (data.error) {
            throw new Error(data.error_description || "LinkedIn token refresh failed");
          }

          newToken = data.access_token;
          newRefreshToken = data.refresh_token || account.refresh_token;
          newExpiry = new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString();

        } else {
          // Unknown platform or missing credentials – mark for reconnect
          await supabase
            .from("social_accounts")
            .update({ status: "reconnect_required", updated_at: new Date().toISOString() })
            .eq("id", account.id);

          results.push({ id: account.id, platform: account.platform, status: "reconnect_required", error: "No refresh strategy" });
          continue;
        }

        // Update the account with new tokens
        const updatePayload: Record<string, any> = {
          access_token: newToken,
          token_expires_at: newExpiry,
          status: "connected",
          is_connected: true,
          updated_at: new Date().toISOString(),
        };
        if (newRefreshToken) updatePayload.refresh_token = newRefreshToken;

        const { error: updateError } = await supabase
          .from("social_accounts")
          .update(updatePayload)
          .eq("id", account.id);

        if (updateError) throw updateError;

        results.push({ id: account.id, platform: account.platform, status: "refreshed" });

      } catch (err: any) {
        console.error(`Token refresh failed for ${account.id}:`, err.message);

        // Mark as reconnect_required after failure
        await supabase
          .from("social_accounts")
          .update({
            status: "reconnect_required",
            updated_at: new Date().toISOString(),
          })
          .eq("id", account.id);

        results.push({ id: account.id, platform: account.platform, status: "failed", error: err.message });
      }
    }

    return new Response(JSON.stringify({
      refreshed: results.filter((r) => r.status === "refreshed").length,
      failed: results.filter((r) => r.status === "failed").length,
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("refresh-tokens error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

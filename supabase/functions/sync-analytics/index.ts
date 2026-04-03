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
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const results: { accountId: string; platform: string; status: string; error?: string }[] = [];

  try {
    // Get all connected accounts
    const { data: accounts, error } = await supabase
      .from("social_accounts")
      .select("id, user_id, platform, access_token, capabilities, status")
      .eq("status", "connected")
      .eq("is_connected", true)
      .limit(50);

    if (error) throw error;
    if (!accounts || accounts.length === 0) {
      return new Response(JSON.stringify({ synced: 0, results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date().toISOString().split("T")[0];

    for (const account of accounts) {
      try {
        const caps: string[] = account.capabilities || [];
        if (!caps.includes("analytics") && !caps.includes("insights")) {
          results.push({ accountId: account.id, platform: account.platform, status: "skipped", error: "No analytics capability" });
          continue;
        }

        let snapshot: Record<string, number> = {
          followers: 0, following: 0, total_posts: 0, reach: 0,
          impressions: 0, engagement: 0, clicks: 0,
          likes: 0, comments: 0, shares: 0, profile_views: 0,
        };
        let engagementRate = 0;

        // ── Facebook Insights ──
        if (account.platform === "facebook") {
          const pagesRes = await fetch(
            `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,fan_count,access_token&access_token=${account.access_token}`
          );
          const pagesData = await pagesRes.json();
          const page = pagesData.data?.[0];

          if (page) {
            snapshot.followers = page.fan_count || 0;

            // Get page insights
            const insightsRes = await fetch(
              `https://graph.facebook.com/v21.0/${page.id}/insights?metric=page_impressions,page_engaged_users,page_post_engagements,page_views_total&period=day&access_token=${page.access_token}`
            );
            const insightsData = await insightsRes.json();

            for (const metric of insightsData.data || []) {
              const val = metric.values?.[metric.values.length - 1]?.value || 0;
              if (metric.name === "page_impressions") snapshot.impressions = val;
              if (metric.name === "page_engaged_users") snapshot.engagement = val;
              if (metric.name === "page_post_engagements") snapshot.likes = val;
              if (metric.name === "page_views_total") snapshot.profile_views = val;
            }

            if (snapshot.followers > 0) {
              engagementRate = (snapshot.engagement / snapshot.followers) * 100;
            }
          }
        }

        // ── Instagram Insights ──
        else if (account.platform === "instagram") {
          const pagesRes = await fetch(
            `https://graph.facebook.com/v21.0/me/accounts?fields=id,instagram_business_account&access_token=${account.access_token}`
          );
          const pagesData = await pagesRes.json();
          const page = pagesData.data?.find((p: any) => p.instagram_business_account);

          if (page?.instagram_business_account) {
            const igId = page.instagram_business_account.id;

            const profileRes = await fetch(
              `https://graph.facebook.com/v21.0/${igId}?fields=followers_count,follows_count,media_count&access_token=${account.access_token}`
            );
            const profileData = await profileRes.json();
            snapshot.followers = profileData.followers_count || 0;
            snapshot.following = profileData.follows_count || 0;
            snapshot.total_posts = profileData.media_count || 0;

            // Get insights
            const insightsRes = await fetch(
              `https://graph.facebook.com/v21.0/${igId}/insights?metric=impressions,reach,profile_views&period=day&access_token=${account.access_token}`
            );
            const insightsData = await insightsRes.json();

            for (const metric of insightsData.data || []) {
              const val = metric.values?.[metric.values.length - 1]?.value || 0;
              if (metric.name === "impressions") snapshot.impressions = val;
              if (metric.name === "reach") snapshot.reach = val;
              if (metric.name === "profile_views") snapshot.profile_views = val;
            }

            if (snapshot.followers > 0) {
              engagementRate = (snapshot.engagement / snapshot.followers) * 100;
            }
          }
        }

        // ── LinkedIn (basic - limited API without partner program) ──
        else if (account.platform === "linkedin") {
          // LinkedIn API v2 has limited free analytics - store basic data
          snapshot.followers = 0; // Would need organization API for follower counts
          results.push({ accountId: account.id, platform: account.platform, status: "partial", error: "LinkedIn analytics require partner program" });
          // Still save what we have
        }

        // Upsert snapshot
        const { error: upsertError } = await supabase
          .from("social_analytics_snapshots")
          .upsert({
            user_id: account.user_id,
            social_account_id: account.id,
            platform: account.platform,
            snapshot_date: today,
            ...snapshot,
            engagement_rate: engagementRate,
          }, {
            onConflict: "social_account_id,snapshot_date",
          });

        if (upsertError) throw upsertError;

        results.push({ accountId: account.id, platform: account.platform, status: "synced" });

      } catch (err: any) {
        console.error(`Sync failed for ${account.id}:`, err.message);
        results.push({ accountId: account.id, platform: account.platform, status: "failed", error: err.message });
      }
    }

    return new Response(JSON.stringify({
      synced: results.filter((r) => r.status === "synced").length,
      failed: results.filter((r) => r.status === "failed").length,
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("sync-analytics error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

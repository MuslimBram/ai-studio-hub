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

  const results: { id: string; platform: string; status: string; error?: string; externalPostId?: string }[] = [];

  try {
    // Get scheduled posts due for publishing (scheduled_at <= now, status = 'scheduled')
    const now = new Date().toISOString();

    const { data: posts, error } = await supabase
      .from("scheduled_posts")
      .select("*, social_accounts!scheduled_posts_social_account_id_fkey(id, platform, access_token, account_name, capabilities, status)")
      .eq("status", "scheduled")
      .lte("scheduled_at", now)
      .order("scheduled_at", { ascending: true })
      .limit(20);

    if (error) throw error;
    if (!posts || posts.length === 0) {
      return new Response(JSON.stringify({ published: 0, results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    for (const post of posts) {
      const account = (post as any).social_accounts;

      // Mark as publishing
      await supabase.from("scheduled_posts").update({ status: "publishing" }).eq("id", post.id);

      try {
        // Validate account
        if (!account || account.status !== "connected") {
          throw new Error("Social account not connected or not found");
        }

        const caps: string[] = account.capabilities || [];
        if (!caps.includes("auto_post")) {
          throw new Error("Account does not have auto_post capability");
        }

        let externalPostId: string | null = null;

        // ── Facebook Page Post ──
        if (account.platform === "facebook") {
          // First get page access token
          const pagesRes = await fetch(
            `https://graph.facebook.com/v21.0/me/accounts?access_token=${account.access_token}`
          );
          const pagesData = await pagesRes.json();
          const page = pagesData.data?.[0];

          if (!page) throw new Error("No Facebook page found");

          const postRes = await fetch(`https://graph.facebook.com/v21.0/${page.id}/feed`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: post.content,
              access_token: page.access_token,
            }),
          });

          const postData = await postRes.json();
          if (postData.error) throw new Error(postData.error.message);
          externalPostId = postData.id;
        }

        // ── Instagram Post ──
        else if (account.platform === "instagram") {
          // Get pages and find instagram business account
          const pagesRes = await fetch(
            `https://graph.facebook.com/v21.0/me/accounts?fields=id,instagram_business_account&access_token=${account.access_token}`
          );
          const pagesData = await pagesRes.json();
          const page = pagesData.data?.find((p: any) => p.instagram_business_account);

          if (!page?.instagram_business_account) {
            throw new Error("No Instagram business account linked");
          }

          const igId = page.instagram_business_account.id;
          const mediaUrls = post.media_urls || [];

          if (mediaUrls.length === 0) {
            throw new Error("Instagram requires at least one image to publish");
          }

          // Create media container
          const containerRes = await fetch(`https://graph.facebook.com/v21.0/${igId}/media`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image_url: mediaUrls[0],
              caption: post.content + (post.hashtags?.length ? "\n\n" + post.hashtags.map((h: string) => `#${h}`).join(" ") : ""),
              access_token: account.access_token,
            }),
          });

          const containerData = await containerRes.json();
          if (containerData.error) throw new Error(containerData.error.message);

          // Publish
          const publishRes = await fetch(`https://graph.facebook.com/v21.0/${igId}/media_publish`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              creation_id: containerData.id,
              access_token: account.access_token,
            }),
          });

          const publishData = await publishRes.json();
          if (publishData.error) throw new Error(publishData.error.message);
          externalPostId = publishData.id;
        }

        // ── LinkedIn Post ──
        else if (account.platform === "linkedin") {
          // Get user URN
          const meRes = await fetch("https://api.linkedin.com/v2/userinfo", {
            headers: { Authorization: `Bearer ${account.access_token}` },
          });
          const meData = await meRes.json();
          const authorUrn = `urn:li:person:${meData.sub}`;

          const postBody = {
            author: authorUrn,
            lifecycleState: "PUBLISHED",
            specificContent: {
              "com.linkedin.ugc.ShareContent": {
                shareCommentary: { text: post.content },
                shareMediaCategory: "NONE",
              },
            },
            visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
          };

          const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${account.access_token}`,
              "Content-Type": "application/json",
              "X-Restli-Protocol-Version": "2.0.0",
            },
            body: JSON.stringify(postBody),
          });

          if (!postRes.ok) {
            const errText = await postRes.text();
            throw new Error(`LinkedIn API error ${postRes.status}: ${errText}`);
          }

          externalPostId = postRes.headers.get("x-restli-id") || "published";
        }

        // ── Unsupported platform ──
        else {
          throw new Error(`Auto-post not implemented for ${account.platform}`);
        }

        // Mark post as published
        await supabase.from("scheduled_posts").update({ status: "published" }).eq("id", post.id);

        // Create published_posts record
        await supabase.from("published_posts").insert({
          user_id: post.user_id,
          scheduled_post_id: post.id,
          social_account_id: account.id,
          platform: account.platform,
          content: post.content,
          media_urls: post.media_urls || [],
          external_post_id: externalPostId,
          published_at: new Date().toISOString(),
        });

        results.push({ id: post.id, platform: account.platform, status: "published", externalPostId: externalPostId || undefined });

      } catch (err: any) {
        console.error(`Auto-post failed for ${post.id}:`, err.message);

        await supabase.from("scheduled_posts").update({ status: "failed" }).eq("id", post.id);
        results.push({ id: post.id, platform: account?.platform || post.platform, status: "failed", error: err.message });
      }
    }

    return new Response(JSON.stringify({
      published: results.filter((r) => r.status === "published").length,
      failed: results.filter((r) => r.status === "failed").length,
      results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("auto-post error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

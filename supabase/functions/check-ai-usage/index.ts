import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { action_type, category } = await req.json();

    // Get user's plan via service role
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get subscription
    const { data: sub } = await adminClient
      .from("user_subscriptions")
      .select("*, plan:plans(*)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    // Default to free plan
    let plan = sub?.plan;
    if (!plan) {
      const { data: freePlan } = await adminClient.from("plans").select("*").eq("id", "plan-free").single();
      plan = freePlan;
    }
    if (!plan) {
      return new Response(JSON.stringify({ error: "No plan found" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Check feature access
    const featureMap: Record<string, string> = {
      inbox: "inbox_ai", content: "content_ai", media: "media_ai",
      strategy: "strategy_ai", automation: "automation_ai", general: "basic_reply",
    };
    const requiredFeature = featureMap[category || "general"] || "basic_reply";
    if (!plan.ai_features_enabled.includes(requiredFeature)) {
      return new Response(JSON.stringify({
        allowed: false,
        reason: `Feature "${category}" not available on ${plan.name} plan`,
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Check daily limit
    const limitMap: Record<string, number> = {
      reply: plan.ai_replies_per_day,
      text_generation: plan.ai_text_generations_per_day,
      image_generation: plan.ai_image_generations_per_day,
      video_generation: plan.ai_video_generations_per_day,
    };
    const limit = limitMap[action_type || "reply"] ?? 0;

    // Count today's usage
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const { count } = await adminClient
      .from("ai_usage_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("action_type", action_type || "reply")
      .gte("created_at", todayStart.toISOString());

    const used = count ?? 0;
    if (used >= limit) {
      return new Response(JSON.stringify({
        allowed: false,
        reason: `Daily limit reached: ${used}/${limit}`,
        used,
        limit,
      }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Log the usage
    await adminClient.from("ai_usage_logs").insert({
      user_id: user.id,
      category: category || "general",
      action_type: action_type || "reply",
      tokens_used: 0,
    });

    return new Response(JSON.stringify({
      allowed: true,
      used: used + 1,
      limit,
      remaining: limit - used - 1,
    }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    console.error("check-ai-usage error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

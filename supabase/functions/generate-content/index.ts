import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { type, platform, tone, keywords, businessDescription, competitorContext } = await req.json();

    if (!type || !platform) {
      return new Response(JSON.stringify({ error: "type and platform are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const toneMap: Record<string, string> = {
      professional: "professional, authoritative, and trustworthy",
      casual: "friendly, conversational, and relatable",
      sales: "persuasive, action-oriented, and compelling with clear CTAs",
    };

    const toneDesc = toneMap[tone || "professional"] || toneMap.professional;
    const keywordList = (keywords || []).join(", ");

    let systemPrompt = `You are an expert social media content strategist. Generate content for ${platform}. Use a ${toneDesc} tone.`;

    if (businessDescription) {
      systemPrompt += ` Business context: ${businessDescription}`;
    }
    if (competitorContext) {
      systemPrompt += ` Consider competitor landscape: ${competitorContext}`;
    }

    let userPrompt = "";

    switch (type) {
      case "caption":
        userPrompt = `Generate 3 engaging ${platform} post captions${keywordList ? ` incorporating these keywords: ${keywordList}` : ""}. 
Return JSON: { "captions": [{ "text": "...", "hashtags": ["..."], "cta": "...", "engagementScore": 1-10 }] }`;
        break;
      case "hashtags":
        userPrompt = `Generate 20 highly relevant hashtags for ${platform}${keywordList ? ` related to: ${keywordList}` : ""}.
Group them by reach: high (>1M), medium (100K-1M), niche (<100K).
Return JSON: { "hashtags": { "high": ["..."], "medium": ["..."], "niche": ["..."] } }`;
        break;
      case "content_plan":
        userPrompt = `Create a 7-day content plan for ${platform}${keywordList ? ` focused on: ${keywordList}` : ""}.
For each day include: topic, content type (image/video/carousel/text), caption, best posting time, hashtags.
Return JSON: { "plan": [{ "day": 1, "topic": "...", "contentType": "...", "caption": "...", "bestTime": "...", "hashtags": ["..."] }] }`;
        break;
      case "seo_optimize":
        userPrompt = `Analyze and optimize this content for ${platform} SEO${keywordList ? `. Content keywords: ${keywordList}` : ""}.
Suggest: keyword improvements, hashtag strategy, readability score, engagement prediction.
Return JSON: { "optimized": { "suggestedKeywords": ["..."], "hashtags": ["..."], "readabilityScore": 1-10, "engagementPrediction": "low|medium|high", "improvements": ["..."] } }`;
        break;
      case "competitor_analysis":
        userPrompt = `Based on competitors in the ${keywordList || "general"} space on ${platform}, analyze:
- Common content themes and posting patterns
- Top-performing content types
- Keyword gaps and opportunities
- Suggested topics to differentiate
Return JSON: { "analysis": { "themes": ["..."], "topContentTypes": ["..."], "keywordGaps": ["..."], "suggestedTopics": ["..."], "postingFrequency": "...", "bestPractices": ["..."] } }`;
        break;
      default:
        return new Response(JSON.stringify({ error: "Invalid type" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again shortly" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Try to parse JSON from the response
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content };
    } catch {
      parsed = { raw: content };
    }

    return new Response(JSON.stringify({ success: true, data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-content error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

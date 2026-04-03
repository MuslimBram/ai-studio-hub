import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const OWNER_EMAIL = "amirah.br0006@gmail.com";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.log("check-admin: no auth header");
      return new Response(JSON.stringify({ isAdmin: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("check-admin: getUser error:", userError.message);
      return new Response(JSON.stringify({ isAdmin: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!user) {
      console.log("check-admin: no user returned");
      return new Response(JSON.stringify({ isAdmin: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("check-admin: user email =", user.email);

    // Hardcoded owner fallback — always admin regardless of DB state
    if (user.email === OWNER_EMAIL) {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      
      // Self-healing: ensure DB role exists
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role" });

      console.log("check-admin: owner detected, returning isAdmin=true");
      return new Response(JSON.stringify({ isAdmin: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check DB for other admins
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    const isAdmin = !!data;
    console.log("check-admin: DB check for", user.email, "isAdmin=", isAdmin);

    return new Response(JSON.stringify({ isAdmin }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("check-admin error:", error.message);
    return new Response(JSON.stringify({ isAdmin: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};
import { createClient } from 'npm:@supabase/supabase-js@2';

const OWNER_EMAIL = 'amirah.br0006@gmail.com';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ isAdmin: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ isAdmin: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Hardcoded owner fallback — always admin regardless of DB state
    if (user.email === OWNER_EMAIL) {
      // Ensure DB role exists too (self-healing)
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      await supabaseAdmin
        .from('user_roles')
        .upsert({ user_id: user.id, role: 'admin' }, { onConflict: 'user_id,role' });

      return new Response(JSON.stringify({ isAdmin: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check DB for other admins
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    return new Response(JSON.stringify({ isAdmin: !!data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return new Response(JSON.stringify({ isAdmin: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

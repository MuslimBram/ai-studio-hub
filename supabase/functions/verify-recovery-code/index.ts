const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';

const BodySchema = z.object({
  code: z.string().min(1),
});

async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid input' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!,
      { global: { headers: { authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const codeHash = await hashCode(parsed.data.code.trim().toLowerCase());

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Find unused matching code
    const { data: codes } = await supabaseAdmin
      .from('mfa_recovery_codes')
      .select('id')
      .eq('user_id', user.id)
      .eq('code_hash', codeHash)
      .eq('used', false)
      .limit(1);

    if (!codes || codes.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Kodi nuk është i vlefshëm ose është përdorur.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mark as used
    await supabaseAdmin
      .from('mfa_recovery_codes')
      .update({ used: true })
      .eq('id', codes[0].id);

    // Unenroll all TOTP factors so user bypasses MFA this session
    const { data: factors } = await supabaseAdmin.auth.admin.mfa.listFactors({ userId: user.id });
    if (factors?.factors) {
      for (const factor of factors.factors) {
        if (factor.factor_type === 'totp' && factor.status === 'verified') {
          await supabaseAdmin.auth.admin.mfa.deleteFactor({ userId: user.id, factorId: factor.id });
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error verifying recovery code:', error);
    return new Response(JSON.stringify({ success: false, error: 'Verification failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

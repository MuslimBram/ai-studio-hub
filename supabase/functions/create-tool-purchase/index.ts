import { corsHeaders } from '@supabase/supabase-js/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';

const PAYPAL_API = 'https://api-m.paypal.com';

const BodySchema = z.object({
  tool_id: z.string().min(1),
  return_url: z.string().url(),
  cancel_url: z.string().url(),
});

async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
  if (!clientId || !clientSecret) throw new Error('PayPal credentials not configured');

  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`PayPal auth failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { tool_id, return_url, cancel_url } = parsed.data;

    // Get user
    let userId: string | null = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { authorization: authHeader } } }
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (user) userId = user.id;
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get tool and price
    const { data: tool, error: toolErr } = await supabaseAdmin
      .from('tools')
      .select('id, title, base_price, pricing_type')
      .eq('id', tool_id)
      .single();

    if (toolErr || !tool) {
      return new Response(JSON.stringify({ error: 'Tool not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (tool.pricing_type === 'free' || tool.base_price <= 0) {
      return new Response(JSON.stringify({ error: 'This tool is free' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if already purchased
    const { data: existing } = await supabaseAdmin
      .from('tool_purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('tool_id', tool_id)
      .eq('status', 'completed')
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ error: 'Already purchased', already_purchased: true }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate price with 50% commission
    const basePrice = Number(tool.base_price);
    const commission = basePrice * 0.5;
    const totalPrice = basePrice + commission;

    const accessToken = await getPayPalAccessToken();

    // Create PayPal order
    const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'EUR',
            value: totalPrice.toFixed(2),
          },
          description: `Akses për ${tool.title}`,
        }],
        application_context: {
          brand_name: 'AI Tools Hub',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url,
          cancel_url,
        },
      }),
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok) {
      throw new Error(`PayPal order failed: ${JSON.stringify(orderData)}`);
    }

    // Save pending purchase
    await supabaseAdmin.from('tool_purchases').insert({
      user_id: userId,
      tool_id: tool_id,
      amount: totalPrice,
      commission: commission,
      paypal_order_id: orderData.id,
      status: 'pending',
    });

    return new Response(JSON.stringify({
      orderId: orderData.id,
      approvalUrl: orderData.links.find((l: any) => l.rel === 'approve')?.href,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating tool purchase:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

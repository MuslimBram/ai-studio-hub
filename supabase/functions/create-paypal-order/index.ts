const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';

const PAYPAL_API = 'https://api-m.paypal.com';

const BodySchema = z.object({
  amount: z.number().min(1).max(10000),
  currency: z.string().default('EUR'),
  message: z.string().max(500).default(''),
  donor_name: z.string().max(100).default(''),
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
  if (!res.ok) throw new Error(`PayPal auth failed [${res.status}]: ${JSON.stringify(data)}`);
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

    const { amount, currency, message, donor_name, return_url, cancel_url } = parsed.data;

    // Get user if authenticated
    let userId: string | null = null;
    let userEmail = '';
    const authHeader = req.headers.get('authorization');
    if (authHeader) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { authorization: authHeader } } }
      );
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
        userEmail = user.email || '';
      }
    }

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
            currency_code: currency,
            value: amount.toFixed(2),
          },
          description: `Donacion për AI Tools Hub${message ? ': ' + message : ''}`,
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
      throw new Error(`PayPal order creation failed [${orderRes.status}]: ${JSON.stringify(orderData)}`);
    }

    // Save pending donation in DB
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    await supabaseAdmin.from('donations').insert({
      user_id: userId,
      email: userEmail || 'anonymous',
      amount,
      currency,
      paypal_order_id: orderData.id,
      status: 'pending',
      message,
      donor_name,
    });

    return new Response(JSON.stringify({
      orderId: orderData.id,
      approvalUrl: orderData.links.find((l: any) => l.rel === 'approve')?.href,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import { corsHeaders } from '@supabase/supabase-js/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3';

const PAYPAL_API = 'https://api-m.paypal.com';

const BodySchema = z.object({
  orderId: z.string().min(1),
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

    const { orderId } = parsed.data;
    const accessToken = await getPayPalAccessToken();

    // Capture the PayPal order
    const captureRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const captureData = await captureRes.json();
    if (!captureRes.ok) {
      throw new Error(`PayPal capture failed [${captureRes.status}]: ${JSON.stringify(captureData)}`);
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const payerId = captureData.payer?.payer_id || '';
    const payerEmail = captureData.payer?.email_address || '';

    // Update donation status
    const { data: donation } = await supabaseAdmin
      .from('donations')
      .update({
        status: 'completed',
        paypal_payer_id: payerId,
        email: payerEmail || undefined,
      })
      .eq('paypal_order_id', orderId)
      .select()
      .single();

    // If donation is linked to a user, update their donor status
    if (donation?.user_id) {
      // Get total donations for this user
      const { data: totals } = await supabaseAdmin
        .from('donations')
        .select('amount')
        .eq('user_id', donation.user_id)
        .eq('status', 'completed');

      const totalDonated = (totals || []).reduce((sum, d) => sum + Number(d.amount), 0);

      await supabaseAdmin
        .from('profiles')
        .update({
          is_donor: true,
          total_donated: totalDonated,
          donor_since: donation.created_at,
        })
        .eq('id', donation.user_id);
    }

    return new Response(JSON.stringify({
      success: true,
      status: captureData.status,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

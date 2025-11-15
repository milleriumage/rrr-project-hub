// @ts-nocheck
/// <reference lib="deno.ns" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, credits, userId } = await req.json();

    if (!amount || !credits || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    
    // Generate unique idempotency key for multiple transactions support
    const idempotencyKey = crypto.randomUUID();
    
    // Create PIX payment in MercadoPago
    const paymentData = {
      transaction_amount: amount,
      description: `${credits} créditos - FunFans`,
      payment_method_id: 'pix',
      payer: {
        email: 'user@funfans.com',
      },
      metadata: {
        user_id: userId,
        credits: credits,
      },
    };

    console.log('Creating PIX payment with idempotency key:', idempotencyKey);

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('MercadoPago API error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create payment' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payment = await response.json();
    
    // Extract QR code data from the response
    const qrCodeBase64 = payment.point_of_interaction?.transaction_data?.qr_code_base64;
    const qrCode = payment.point_of_interaction?.transaction_data?.qr_code;
    const paymentId = payment.id;

    console.log('PIX payment created:', paymentId);
    console.log('Payment response:', JSON.stringify(payment));

    // Save payment in database with pending status
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    await supabase.from('external_payments').insert({
      user_id: userId,
      provider: 'mercado_pago',
      provider_payment_id: String(paymentId),
      status: 'pending',
      amount: amount,
      currency: 'brl',
      metadata: { credits, payment_method: 'pix' },
    });

    return new Response(
      JSON.stringify({
        success: true,
        paymentId,
        qrCodeBase64,
        qrCode,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating PIX payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

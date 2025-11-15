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
    const { paymentId, userId } = await req.json();

    if (!paymentId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    
    console.log('Checking payment status for:', paymentId);

    // Fetch payment details from MercadoPago API
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('MercadoPago API error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to check payment status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payment = await response.json();
    console.log('Payment status:', payment.status);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check if payment is approved
    if (payment.status === 'approved') {
      const credits = parseInt(payment.metadata?.credits || '0');
      
      if (!credits) {
        return new Response(
          JSON.stringify({ error: 'Invalid credits metadata' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if credits were already added
      const { data: existingPayment } = await supabase
        .from('external_payments')
        .select('status')
        .eq('provider_payment_id', String(paymentId))
        .eq('user_id', userId)
        .single();

      if (existingPayment?.status === 'succeeded') {
        return new Response(
          JSON.stringify({
            status: 'approved',
            alreadyProcessed: true,
            message: 'Créditos já foram adicionados anteriormente',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Get current balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('credits_balance')
        .eq('id', userId)
        .single();

      if (!profile) {
        return new Response(
          JSON.stringify({ error: 'User profile not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Add credits
      await supabase
        .from('profiles')
        .update({ credits_balance: profile.credits_balance + credits })
        .eq('id', userId);

      // Record transaction
      await supabase.from('transactions').insert({
        user_id: userId,
        type: 'credit_purchase',
        amount: credits,
        description: `PIX purchase: ${credits} credits`,
      });

      // Update payment status
      await supabase
        .from('external_payments')
        .update({ status: 'succeeded', metadata: { payment } })
        .eq('provider_payment_id', String(paymentId))
        .eq('user_id', userId);

      console.log(`Credits added for user ${userId}: ${credits}`);

      return new Response(
        JSON.stringify({
          status: 'approved',
          creditsAdded: credits,
          newBalance: profile.credits_balance + credits,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (payment.status === 'pending') {
      return new Response(
        JSON.stringify({
          status: 'pending',
          message: 'Pagamento ainda pendente. Aguarde a confirmação.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      // Update payment status in database
      await supabase
        .from('external_payments')
        .update({ status: 'failed', metadata: { payment } })
        .eq('provider_payment_id', String(paymentId))
        .eq('user_id', userId);

      return new Response(
        JSON.stringify({
          status: payment.status,
          message: 'Pagamento não foi aprovado.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error checking PIX payment status:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

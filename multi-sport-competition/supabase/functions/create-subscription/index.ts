import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseServiceRoleKey) {
      console.error("MISSING SUPABASE_SERVICE_ROLE_KEY")
      throw new Error("Configuration manquante: SUPABASE_SERVICE_ROLE_KEY")
    }

    // Client Admin pour contourner les règles RLS lors de l'écriture du stripe_customer_id
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      supabaseServiceRoleKey
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Utilisateur non authentifié')
    }

    const { priceId, planType, extraMembers, extraMemberPriceId } = await req.json()

    // 1. Get or create customer
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      console.log("Creating new Stripe customer for user:", user.id)
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id
      
      // Utilisation de supabaseAdmin pour l'écriture
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
        
      if (updateError) {
        console.error("Error saving stripe_customer_id:", updateError)
        // On ne bloque pas le processus, mais on loggue l'erreur
      }
    }

    // 2. Create subscription
    console.log("Creating subscription for customer:", customerId)
    
    const items = [{ price: priceId }]
    if (extraMembers && extraMemberPriceId) {
      items.push({ price: extraMemberPriceId, quantity: extraMembers })
    }

    // On normalise le planType pour qu'il corresponde aux valeurs attendues en DB ('premium' ou 'team')
    // 'pro' devient 'premium'
    const normalizedPlanType = planType === 'pro' ? 'premium' : (planType === 'team' ? 'team' : 'premium')

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: items,
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: { 
        supabase_user_id: user.id,
        plan_type: normalizedPlanType 
      },
    })

    return new Response(
      JSON.stringify({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error: any) {
    console.error('Error in create-subscription:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

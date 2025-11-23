import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')
  const body = await req.text()
  const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

  let event

  try {
    if (!signature || !endpointSecret) {
      throw new Error("Missing signature or endpointSecret")
    }
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      endpointSecret,
      undefined,
      cryptoProvider
    )
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  console.log(`Processing ${event.type}`)

  try {
    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.created': {
        const subscription = event.data.object
        
        // Récupérer l'utilisateur associé via stripe_customer_id
        const { data: profile, error: profileError } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', subscription.customer)
          .single()

        if (profileError || !profile) {
          console.error("User not found for this customer ID.")
          break
        }

        console.log(`Profile found: ${profile.id}. Updating subscription status...`)

        let subscription_status = subscription.status
        let planType = 'free'

        // Logique simple pour déterminer le plan (à adapter selon vos produits Stripe)
        // Par exemple, vérifier subscription.items.data[0].price.product
        if (subscription.status === 'active' || subscription.status === 'trialing') {
           // Ici, vous pourriez mapper l'ID du produit Stripe à un nom de plan interne
           // Pour l'instant, on suppose que tout abonnement actif est 'pro' ou 'premium'
           // Vous pouvez enrichir cette logique en regardant subscription.items
           if (subscription.items?.data?.length > 0) {
             // const priceId = subscription.items.data[0].price.id
             // planType = mapPriceIdToPlan(priceId)
             planType = 'premium' // Valeur par défaut pour l'exemple
           }
        } else {
           planType = 'free'
        }

        if (event.type === 'customer.subscription.deleted') {
            subscription_status = 'canceled'
            planType = 'free'
        }

        console.log(`Updating to status: ${subscription_status}, plan: ${planType}`)

        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({
            subscription_status: subscription_status,
            subscription_plan: planType,
            subscription_updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id)

        if (updateError) {
            console.error("Error updating profile:", updateError)
        } else {
            console.log("Profile updated successfully.")
        }
        break
      }
      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err: any) {
    console.error(`Error processing event: ${err.message}`)
    return new Response(`Error processing event: ${err.message}`, { status: 400 })
  }
})

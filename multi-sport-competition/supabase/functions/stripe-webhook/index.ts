import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

serve(async (req) => {
  console.log("Webhook received!")
  const signature = req.headers.get('stripe-signature')
  
  if (!endpointSecret) {
    console.error("Error: STRIPE_WEBHOOK_SECRET is missing in environment variables.")
    return new Response('Webhook Error: Server configuration missing secret', { status: 500 })
  }

  if (!signature) {
    console.error("Error: No stripe-signature header in request.")
    return new Response('Webhook Error: Missing signature', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret)
    console.log(`Event constructed successfully: ${event.type}`)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Utiliser la clé Service Role pour écrire sans restriction
    )

    switch (event.type) {
      case 'checkout.session.completed': // Gardé pour compatibilité si vous utilisez encore Checkout
      case 'invoice.payment_succeeded': { // Pour les abonnements via Elements
        console.log(`Processing ${event.type}`)
        const data = event.data.object
        // Pour invoice, le customer est dans data.customer, et metadata peut être dans data.subscription_details.metadata ou faut le récupérer
        // Mais le plus simple est de se fier au customer_id stocké dans Supabase
        
        const customerId = data.customer
        const subscriptionId = data.subscription
        
        console.log(`Looking for profile with stripe_customer_id: ${customerId}`)

        // Récupérer l'utilisateur via le stripe_customer_id
        const { data: profile, error: profileError } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()
        
        if (profileError) {
            console.error("Error finding profile:", profileError)
        }

        if (profile) {
          console.log(`Profile found: ${profile.id}. Updating subscription status...`)
          const { error: updateError } = await supabaseClient
            .from('profiles')
            .update({
              subscription_status: 'active',
              subscription_plan: 'premium',
              subscription_updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id)
            
          if (updateError) console.error("Error updating profile:", updateError)
          else console.log("Profile updated successfully.")
        } else {
            console.warn("No profile found for this customer ID.")
        }
        break
      }
      
      case 'customer.subscription.updated': {
        console.log(`Processing ${event.type}`)
        const subscription = event.data.object
        const status = subscription.status
        console.log(`Subscription status is: ${status}`)
        
        // Si l'abonnement devient actif (après un paiement réussi par exemple)
        if (status === 'active') {
           const { data: profile } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', subscription.customer)
            .single()
            
           if (profile) {
            console.log(`Profile found: ${profile.id}. Updating to active...`)
            await supabaseClient
              .from('profiles')
              .update({
                subscription_status: 'active',
                subscription_plan: 'premium',
                subscription_updated_at: new Date().toISOString(),
              })
              .eq('id', profile.id)
           }
        }
        break
      }

      case 'customer.subscription.deleted': {
        console.log(`Processing ${event.type}`)
        const subscription = event.data.object
        // Trouver l'utilisateur via le customer_id
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', subscription.customer)
          .single()

        if (profile) {
          console.log(`Profile found: ${profile.id}. Canceling subscription...`)
          await supabaseClient
            .from('profiles')
            .update({
              subscription_status: 'canceled',
              subscription_plan: 'free',
              subscription_updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id)
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
    console.error(`Webhook Error: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }
})

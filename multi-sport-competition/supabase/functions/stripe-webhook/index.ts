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

    // ID du plan Pro (Premium) - Tout autre ID sera considéré comme Team
    const PRO_PRICE_ID = 'price_1SWOsbCa5azamjTQV4nwkCty'

    const getPlanFromEvent = (obj: any) => {
      // 1. Priorité aux métadonnées si disponibles (plus fiable)
      // Dans invoice.payment_succeeded, les métadonnées sont parfois dans subscription_details ou faut aller chercher la souscription
      // Mais si on a passé metadata à la création de la souscription, elles sont sur l'objet subscription.
      
      // Si l'objet est une invoice, on regarde si on a accès à la souscription expandée ou on utilise le fallback prix
      // Si l'objet est une subscription, on regarde metadata.plan_type
      
      if (obj.object === 'subscription' && obj.metadata?.plan_type) {
        console.log(`Detected Plan Type from Metadata: ${obj.metadata.plan_type}`)
        return obj.metadata.plan_type
      }

      // Fallback sur l'ID du prix si pas de métadonnées (ex: anciens abonnements)
      let priceId = ''
      
      // Cas Invoice
      if (obj.object === 'invoice' && obj.lines?.data?.length > 0) {
        priceId = obj.lines.data[0].price.id
      }
      // Cas Subscription
      else if (obj.object === 'subscription' && obj.items?.data?.length > 0) {
        priceId = obj.items.data[0].price.id
      }

      console.log(`Detected Price ID: ${priceId}`)
      
      if (!priceId) return 'premium' // Fallback ultime
      return priceId === PRO_PRICE_ID ? 'premium' : 'team'
    }

    switch (event.type) {
      case 'checkout.session.completed': // Gardé pour compatibilité si vous utilisez encore Checkout
      case 'invoice.payment_succeeded': { // Pour les abonnements via Elements
        console.log(`Processing ${event.type}`)
        const data = event.data.object
        
        const customerId = data.customer
        
        // Pour invoice, on n'a pas toujours les métadonnées de la souscription directement ici sans expand
        // Mais on peut essayer de deviner via le prix
        let planType = getPlanFromEvent(data)
        
        // Si c'est une invoice et qu'on a un subscription ID, on pourrait fetcher la souscription pour être sûr des métadonnées
        // Mais pour l'instant on va faire confiance au fallback prix ou si Stripe envoie les métadonnées de la ligne
        
        // Petite astuce: si on vient de créer la souscription via create-subscription, on a mis les métadonnées sur la souscription.
        // L'événement invoice.payment_succeeded ne contient pas toujours les métadonnées de la souscription parente au premier niveau.
        // C'est pourquoi le fallback sur le Price ID est important ici.
        
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
          console.log(`Profile found: ${profile.id}. Updating subscription status to ${planType}...`)
          const { error: updateError } = await supabaseClient
            .from('profiles')
            .update({
              subscription_status: 'active',
              subscription_plan: planType,
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
        const planType = getPlanFromEvent(subscription)
        console.log(`Subscription status is: ${status}, Plan: ${planType}`)
        
        // Si l'abonnement devient actif (après un paiement réussi par exemple)
        if (status === 'active') {
           const { data: profile } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', subscription.customer)
            .single()
            
           if (profile) {
            console.log(`Profile found: ${profile.id}. Updating to active (${planType})...`)
            await supabaseClient
              .from('profiles')
              .update({
                subscription_status: 'active',
                subscription_plan: planType,
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

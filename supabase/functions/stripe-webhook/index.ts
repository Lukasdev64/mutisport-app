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
        
        let userId = subscription.metadata?.supabase_user_id

        // Fallback: Try to find user by stripe_customer_id if metadata is missing
        if (!userId) {
            console.log("No supabase_user_id in metadata, looking up by stripe_customer_id...")
            const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', subscription.customer)
            .single()

            if (profileError || !profile) {
                console.error("User not found for this customer ID:", subscription.customer)
                break
            }
            userId = profile.id
        }

        console.log(`User identified: ${userId}. Processing subscription status: ${subscription.status}`)

        let subscription_status = subscription.status
        let planType = 'free'

        // Check for active or trialing status
        if (subscription.status === 'active' || subscription.status === 'trialing') {
           planType = 'premium'
        } else {
           // incomplete, incomplete_expired, past_due, canceled, unpaid
           planType = 'free'
        }

        if (event.type === 'customer.subscription.deleted') {
            subscription_status = 'canceled'
            planType = 'free'
        }

        console.log(`Updating profile ${userId} -> Status: ${subscription_status}, Plan: ${planType}`)

        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({
            subscription_status: subscription_status,
            subscription_plan: planType,
            subscription_updated_at: new Date().toISOString(),
          })
          .eq('id', userId)

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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const { user_id, returnUrl } = await req.json();
  const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Missing environment variables" }), { status: 500 });
  }

  // Récupérer le stripe_customer_id depuis Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user_id)
    .single();

  if (error || !profile?.stripe_customer_id) {
    return new Response(JSON.stringify({ error: "stripe_customer_id introuvable" }), { status: 400 });
  }

  // Créer la session du portail Stripe
  const response = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      customer: profile.stripe_customer_id,
      return_url: returnUrl || "https://mutisport-app.vercel.app/billing"
    }),
  });

  const data = await response.json();
  if (!data.url) {
    return new Response(JSON.stringify({ error: "Erreur Stripe" }), { status: 500 });
  }

  return new Response(JSON.stringify({ url: data.url }), { headers: { "Content-Type": "application/json" } });
});

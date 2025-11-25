import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message } = await req.json()

    // Récupérez votre clé API depuis les variables d'environnement Supabase
    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    // ⚠️ IMPORTANT : REMPLACEZ CET ID PAR CELUI QUE VOUS AVEZ REÇU D'OPENAI
    // Exemple format : "ft:gpt-4o-mini-2024-07-18:votre-org::8r7s6t5"
    // Si vous n'avez pas encore l'ID, mettez "gpt-4o-mini" en attendant.
    const FINE_TUNED_MODEL_ID = "gpt-4o-mini" 

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: FINE_TUNED_MODEL_ID,
        messages: [
          {
            role: 'system',
            content: "Tu es l'assistant virtuel de MultiSport App. Tu aides les organisateurs à créer des tournois, gérer les équipes et comprendre les abonnements. Tu es concis, professionnel et tu connais parfaitement l'interface de l'application."
          },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
      }),
    })

    const data = await response.json()

    if (data.error) {
      console.error('OpenAI Error:', data.error)
      throw new Error(data.error.message)
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Function Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

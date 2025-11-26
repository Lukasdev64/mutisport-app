import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    // Environment variables
    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!openAiKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables')
    }

    // Initialize Supabase Client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Generate Embedding for the user's question
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: message.replace(/\n/g, ' '),
      }),
    })
    
    const embeddingData = await embeddingResponse.json()
    
    if (embeddingData.error) {
        throw new Error(`OpenAI Embedding Error: ${embeddingData.error.message}`)
    }

    const embedding = embeddingData.data[0].embedding

    // 2. Search for relevant documents in Supabase
    const { data: documents, error: searchError } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.5, // Minimum similarity (0 to 1)
      match_count: 3, // Number of chunks to retrieve
    })

    if (searchError) {
        console.error('Supabase Search Error:', searchError)
        // Continue without context if search fails, or throw error depending on preference
    }

    // 3. Construct the context string
    let contextText = ""
    if (documents && documents.length > 0) {
      contextText = documents.map((doc: any) => doc.content).join("\n---\n")
    }

    // 4. Send to OpenAI with the context
    // You can use your fine-tuned model ID here if you have one, or standard gpt-4o-mini
    const MODEL_ID = "gpt-4o-mini" 

    const systemMessage = `Tu es l'assistant virtuel de SportChampions.
    Utilise les informations de CONTEXTE ci-dessous pour répondre à la question de l'utilisateur.
    Si la réponse ne se trouve pas dans le contexte, utilise tes connaissances générales mais précise que tu n'es pas sûr à 100%.
    Sois concis et professionnel.
    
    CONTEXTE TROUVÉ DANS LA DOCUMENTATION:
    ${contextText}
    `

    const chatResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_ID,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: message }
        ],
        temperature: 0.5,
      }),
    })

    const data = await chatResponse.json()

    if (data.error) {
      console.error('OpenAI Chat Error:', data.error)
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

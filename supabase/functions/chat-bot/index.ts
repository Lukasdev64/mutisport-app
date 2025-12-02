import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();
    console.log("Received query:", query);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openAiKey = Deno.env.get('OPENAI_API_KEY');

    if (!supabaseUrl || !supabaseKey || !openAiKey) {
      console.error("Missing env vars:", { 
        hasUrl: !!supabaseUrl, 
        hasKey: !!supabaseKey, 
        hasOpenAi: !!openAiKey 
      });
      throw new Error("Missing environment variables");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey);

    // 1. Generate Embedding
    console.log("Generating embedding...");
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: query,
      }),
    });

    if (!embeddingResponse.ok) {
      const error = await embeddingResponse.text();
      console.error("OpenAI Embedding Error:", error);
      throw new Error(`OpenAI Embedding Error: ${error}`);
    }

    const embeddingData = await embeddingResponse.json();
    const embedding = embeddingData.data[0].embedding;

    // 2. Search Documents
    console.log("Searching documents...");
    const { data: documents, error: searchError } = await supabaseClient.rpc(
      'match_documents',
      {
        query_embedding: embedding,
        match_threshold: 0.3, // Lowered threshold to be more permissive
        match_count: 5,
      }
    );

    if (searchError) {
      console.error("Supabase Search Error:", searchError);
      throw new Error(`Supabase Search Error: ${searchError.message}`);
    }

    console.log(`Found ${documents?.length ?? 0} documents`);

    // 3. Generate Answer
    const contextText = documents
      ?.map((doc: any) => doc.content)
      .join('\n---\n');

    // 3. Prepare Tools
    const tools = [
      {
        type: "function",
        function: {
          name: "get_tournaments",
          description: "Récupère la liste des tournois publics. Utile pour savoir quels tournois sont en cours, à venir ou terminés.",
          parameters: {
            type: "object",
            properties: {
              status: {
                type: "string",
                enum: ["setup", "in_progress", "completed", "cancelled"],
                description: "Filtrer par statut (ex: 'in_progress' pour les tournois en cours)."
              },
              sport: {
                type: "string",
                description: "Filtrer par sport (ex: 'tennis', 'basketball')."
              }
            }
          }
        }
      }
    ];

    const systemPrompt = `
      Tu es l'assistant virtuel expert de l'application MultiSport Platform.
      Utilise le contexte ci-dessous pour répondre à la question.
      
      Contexte (Documentation):
      ${contextText}

      Tu as accès à des outils pour chercher des données en temps réel (tournois).
      Si l'utilisateur demande des infos sur les tournois (combien, lesquels, etc.), utilise l'outil 'get_tournaments'.

      Tu peux suggérer une action de navigation si pertinent.
      Les routes disponibles sont :
      - /billing (Abonnement, Tarifs, Paiement)
      - /tournaments (Liste des tournois, Création)
      - /settings (Paramètres, Compte)
      - /players (Joueurs)
      - /teams (Équipes)

      IMPORTANT : Ta réponse finale doit être UNIQUEMENT au format JSON valide suivant :
      {
        "reply": "Ta réponse textuelle ici...",
        "action": { "path": "/route", "label": "Texte du bouton" }
      }
      Si aucune action n'est pertinente, mets "action": null.
    `;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query },
    ];

    console.log("Generating completion (Step 1)...");
    const completionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-0125', // Updated to latest 3.5 turbo which supports JSON mode + tools
        messages: messages,
        tools: tools,
        tool_choice: "auto",
        temperature: 0.3,
        response_format: { type: "json_object" } // Enforce JSON mode from the start
      }),
    });

    if (!completionResponse.ok) {
      const error = await completionResponse.text();
      throw new Error(`OpenAI Completion Error (Step 1): ${error}`);
    }

    const completionData = await completionResponse.json();
    const choice = completionData.choices[0];
    const message = choice.message;

    // Handle Tool Calls
    if (message.tool_calls) {
      console.log("Tool call detected:", message.tool_calls[0].function.name);
      const toolCall = message.tool_calls[0];
      
      if (toolCall.function.name === "get_tournaments") {
        const args = JSON.parse(toolCall.function.arguments);
        console.log("Fetching tournaments with args:", args);

        let dbQuery = supabaseClient
          .from('tournaments')
          .select('name, sport, status, players_count, tournament_date')
          .limit(5);

        if (args.status) dbQuery = dbQuery.eq('status', args.status);
        if (args.sport) dbQuery = dbQuery.ilike('sport', args.sport);

        const { data: tournaments, error: dbError } = await dbQuery;

        let toolContent;
        if (dbError) {
          console.error("DB Error:", dbError);
          toolContent = JSON.stringify({ error: `Database Error: ${dbError.message}` });
        } else {
          toolContent = JSON.stringify(tournaments);
        }

        // Add tool result to messages
        messages.push(message); // The assistant's tool call
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: toolContent
        });

        // Second call to OpenAI to generate the final answer
        console.log("Generating completion (Step 2)...");
        const secondResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo-0125',
            messages: messages,
            temperature: 0.3,
            response_format: { type: "json_object" } // Enforce JSON mode for the final answer too
          }),
        });

        if (!secondResponse.ok) {
           const error = await secondResponse.text();
           throw new Error(`OpenAI Completion Error (Step 2): ${error}`);
        }

        const secondData = await secondResponse.json();
        const finalContent = secondData.choices[0].message?.content;
        
        return new Response(finalContent, {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // No tool call, just return the content
    // Since we enforced json_object in Step 1, this should be JSON.
    return new Response(message.content, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});


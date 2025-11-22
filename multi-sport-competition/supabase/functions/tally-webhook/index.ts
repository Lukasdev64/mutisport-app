import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const payload = await req.json()
    
    // Initialiser Supabase avec la clé Service Role (pour écrire sans restriction RLS)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Extraire les données du formulaire
    const fields = payload.data.fields || []
    const getField = (type: string) => fields.find((f: any) => f.type === type)?.value
    const getFieldByLabel = (label: string) => fields.find((f: any) => f.label === label)?.value

    const email = getField('INPUT_EMAIL')
    const name = getField('INPUT_TEXT') // Nom complet
    const phone = getField('INPUT_PHONE_NUMBER')
    const sport = getField('DROPDOWN')
    const category = getField('MULTIPLE_CHOICE')
    const competitionId = payload.data.hiddenFields?.competition_id

    // 2. Vérifier ou créer le profil utilisateur
    let userId = null
    
    if (email) {
      // Chercher si l'utilisateur existe déjà
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      if (existingUser) {
        userId = existingUser.id
      } else {
        // Créer un nouvel utilisateur (via auth.admin si possible, sinon juste profil placeholder)
        // Note: Idéalement on crée un compte Auth, mais ici on va créer un profil "invité" si possible
        // Pour simplifier, on va supposer que l'utilisateur doit avoir un compte ou on crée un profil
        // Attention: profiles.id est une FK vers auth.users. On ne peut pas insérer dans profiles sans auth.users.
        // Solution: On stocke dans tally_submissions et on notifie l'admin, OU on utilise une table 'registrations' temporaire.
        
        // Pour l'instant, on log juste si pas d'user trouvé
        console.log(`Utilisateur non trouvé pour ${email}`)
      }
    }

    // 3. Inscrire à la compétition si on a tout ce qu'il faut
    if (userId && competitionId) {
      const { error: participantError } = await supabase
        .from('participants')
        .insert({
          competition_id: competitionId,
          user_id: userId,
          registration_status: 'pending',
          notes: `Inscrit via Tally. Sport: ${sport}, Catégorie: ${category}`
        })

      if (participantError) console.error('Erreur inscription:', participantError)
    }

    // 4. Toujours sauvegarder la soumission brute pour sécurité
    const { error } = await supabase
      .from('tally_submissions')
      .insert({
        form_id: payload.data.formId,
        submission_id: payload.data.submissionId,
        respondent_email: email,
        payload: payload,
        processed: !!(userId && competitionId)
      })

    if (error) {
      console.error('Erreur insertion Supabase:', error)
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200
    })

  } catch (err: any) {
    console.error('Erreur webhook:', err)
    return new Response(JSON.stringify({ error: err.message || 'Unknown error' }), { 
      status: 400,
      headers: { "Content-Type": "application/json" }
    })
  }
})

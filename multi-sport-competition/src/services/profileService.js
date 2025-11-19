/**
 * Service pour la gestion des profils utilisateurs
 */

import { supabase } from '../lib/supabase'

/**
 * Vérifier si le profil existe et le créer si nécessaire
 */
export const ensureUserProfile = async () => {
  try {
    // Récupérer l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Utilisateur non authentifié')
    }

    console.log('🔍 Vérification du profil pour:', user.id)

    // Vérifier si le profil existe
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = Row not found (c'est normal si le profil n'existe pas)
      console.error('Erreur lors de la vérification du profil:', checkError)
      throw new Error(checkError.message)
    }

    // Si le profil existe déjà, le retourner
    if (existingProfile) {
      console.log('✅ Profil existant trouvé')
      return { data: existingProfile, error: null }
    }

    // Sinon, créer le profil
    console.log('📝 Création du profil...')
    
    const newProfile = {
      id: user.id,
      email: user.email,
      first_name: user.user_metadata?.first_name || null,
      last_name: user.user_metadata?.last_name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      newsletter_subscription: false,
      email_notifications: true,
      push_notifications: false,
    }

    const { data: createdProfile, error: createError } = await supabase
      .from('profiles')
      .insert([newProfile])
      .select()
      .single()

    if (createError) {
      console.error('Erreur lors de la création du profil:', createError)
      throw new Error(createError.message)
    }

    console.log('✅ Profil créé avec succès:', createdProfile)
    return { data: createdProfile, error: null }
  } catch (error) {
    console.error('Error in ensureUserProfile:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Récupérer le profil de l'utilisateur connecté
 */
export const getUserProfile = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Utilisateur non authentifié')
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      throw new Error(error.message)
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Mettre à jour le profil de l'utilisateur connecté
 */
export const updateUserProfile = async (updates) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Utilisateur non authentifié')
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        first_name: updates.firstName,
        last_name: updates.lastName,
        phone: updates.phone,
        date_of_birth: updates.dateOfBirth,
        gender: updates.gender,
        avatar_url: updates.avatarUrl,
        newsletter_subscription: updates.newsletterSubscription,
        email_notifications: updates.emailNotifications,
        push_notifications: updates.pushNotifications,
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      throw new Error(error.message)
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in updateUserProfile:', error)
    return { data: null, error: error.message }
  }
}

export default {
  ensureUserProfile,
  getUserProfile,
  updateUserProfile,
}

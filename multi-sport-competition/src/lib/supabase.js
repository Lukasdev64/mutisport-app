/**
 * Supabase Client Configuration
 * 
 * Ce fichier configure le client Supabase pour l'authentification et la base de données.
 * 
 * Documentation: https://supabase.com/docs/reference/javascript/introduction
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variables d\'environnement Supabase manquantes. ' +
    'Assurez-vous que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définis dans .env'
  )
}

/**
 * Client Supabase configuré avec authentification
 * 
 * @example
 * // Inscription avec email
 * const { data, error } = await supabase.auth.signUp({
 *   email: 'user@example.com',
 *   password: 'password123',
 *   options: {
 *     data: {
 *       first_name: 'John',
 *       last_name: 'Doe'
 *     }
 *   }
 * })
 * 
 * @example
 * // Connexion avec email
 * const { data, error } = await supabase.auth.signInWithPassword({
 *   email: 'user@example.com',
 *   password: 'password123'
 * })
 * 
 * @example
 * // Connexion sociale
 * const { data, error } = await supabase.auth.signInWithOAuth({
 *   provider: 'google'
 * })
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'sport-champions-auth',
  },
})

/**
 * Hook pour écouter les changements d'état d'authentification
 * 
 * @example
 * useEffect(() => {
 *   const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
 *     console.log('Auth state changed:', event, session)
 *   })
 *   return () => subscription.unsubscribe()
 * }, [])
 */

/**
 * Helpers pour l'authentification
 */
export const auth = {
  /**
   * Inscription avec email et mot de passe
   */
  signUp: async ({ email, password, firstName, lastName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`,
        },
        emailRedirectTo: `${window.location.origin}/welcome`,
      },
    })
    return { data, error }
  },

  /**
   * Connexion avec email et mot de passe
   */
  signIn: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  /**
   * Connexion avec OAuth (Google, GitHub, etc.)
   */
  signInWithOAuth: async (provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/welcome`,
      },
    })
    return { data, error }
  },

  /**
   * Déconnexion
   */
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  /**
   * Récupérer la session actuelle
   */
  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  /**
   * Récupérer l'utilisateur actuel
   */
  getUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  /**
   * Réinitialisation du mot de passe
   */
  resetPassword: async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { data, error }
  },

  /**
   * Mise à jour du mot de passe
   */
  updatePassword: async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    return { data, error }
  },
}

export default supabase

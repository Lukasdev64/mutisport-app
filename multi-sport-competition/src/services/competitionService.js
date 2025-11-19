/**
 * Service pour la gestion des compétitions
 * Gère les opérations CRUD avec Supabase
 */

import { supabase } from '../lib/supabase'
import { ensureUserProfile } from './profileService'

/**
 * Créer une nouvelle compétition
 */
export const createCompetition = async (competitionData) => {
  try {
    // Récupérer l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Utilisateur non authentifié')
    }

    // S'assurer que le profil existe
    const { error: profileError } = await ensureUserProfile()
    if (profileError) {
      throw new Error('Impossible de créer/vérifier le profil: ' + profileError)
    }

    // Préparer les données pour la base de données
    const competition = {
      organizer_id: user.id,
      name: competitionData.name,
      sport: competitionData.sport,
      description: competitionData.description || null,
      competition_date: competitionData.date,
      address: competitionData.address,
      city: competitionData.city,
      postal_code: competitionData.postalCode,
      country: 'France',
      max_participants: parseInt(competitionData.maxParticipants, 10),
      age_category: competitionData.ageCategory,
      is_official: competitionData.isOfficial || false,
      status: 'upcoming',
    }

    // Insérer la compétition dans la base de données
    const { data, error } = await supabase
      .from('competitions')
      .insert([competition])
      .select()
      .single()

    if (error) {
      console.error('Error creating competition:', error)
      throw new Error(error.message || 'Erreur lors de la création de la compétition')
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in createCompetition:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Upload des fichiers pour une compétition
 */
export const uploadCompetitionFiles = async (competitionId, files) => {
  try {
    const uploadedFiles = []
    
    // Récupérer l'utilisateur pour utiliser son UUID comme dossier
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Utilisateur non authentifié')

    for (const fileObj of files) {
      const file = fileObj.file
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      // Upload du fichier dans le storage Supabase
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('competition-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Error uploading file:', uploadError)
        continue // Passer au fichier suivant en cas d'erreur
      }

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('competition-files')
        .getPublicUrl(fileName)

      // Enregistrer les métadonnées du fichier dans la table competition_files
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data: fileData, error: fileError } = await supabase
        .from('competition_files')
        .insert([{
          competition_id: competitionId,
          file_name: file.name,
          file_url: publicUrl,
          file_type: file.type,
          file_size: file.size,
          uploaded_by: user?.id
        }])
        .select()
        .single()

      if (fileError) {
        console.error('Error saving file metadata:', fileError)
        continue
      }

      uploadedFiles.push(fileData)
    }

    return { data: uploadedFiles, error: null }
  } catch (error) {
    console.error('Error in uploadCompetitionFiles:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Créer une compétition avec ses fichiers
 */
export const createCompetitionWithFiles = async (competitionData, files) => {
  try {
    // 1. Créer la compétition
    const { data: competition, error: competitionError } = await createCompetition(competitionData)

    if (competitionError || !competition) {
      throw new Error(competitionError || 'Erreur lors de la création de la compétition')
    }

    // 2. Upload des fichiers si présents
    if (files && files.length > 0) {
      const { data: uploadedFiles, error: filesError } = await uploadCompetitionFiles(
        competition.id,
        files
      )

      if (filesError) {
        console.warn('Certains fichiers n\'ont pas pu être uploadés:', filesError)
      }

      return {
        data: {
          ...competition,
          files: uploadedFiles || []
        },
        error: null
      }
    }

    return { data: competition, error: null }
  } catch (error) {
    console.error('Error in createCompetitionWithFiles:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Récupérer toutes les compétitions de l'utilisateur connecté
 */
export const getUserCompetitions = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      throw new Error('Utilisateur non authentifié')
    }

    const { data, error } = await supabase
      .from('competitions')
      .select(`
        *,
        competition_files (*)
      `)
      .eq('organizer_id', user.id)
      .order('competition_date', { ascending: false })

    if (error) {
      console.error('Error fetching competitions:', error)
      throw new Error(error.message)
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in getUserCompetitions:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Récupérer toutes les compétitions publiques
 */
export const getAllCompetitions = async (filters = {}) => {
  try {
    let query = supabase
      .from('competitions')
      .select(`
        *,
        profiles!competitions_organizer_id_fkey (
          id,
          full_name,
          avatar_url
        ),
        competition_files (*)
      `)
      .order('competition_date', { ascending: true })

    // Appliquer les filtres
    if (filters.sport) {
      query = query.eq('sport', filters.sport)
    }

    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.ageCategory) {
      query = query.eq('age_category', filters.ageCategory)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching all competitions:', error)
      throw new Error(error.message)
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in getAllCompetitions:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Récupérer une compétition par son ID
 */
export const getCompetitionById = async (competitionId) => {
  try {
    const { data, error } = await supabase
      .from('competitions')
      .select(`
        *,
        profiles!competitions_organizer_id_fkey (
          id,
          full_name,
          email,
          avatar_url
        ),
        competition_files (*),
        participants (
          *,
          profiles (
            id,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('id', competitionId)
      .single()

    if (error) {
      console.error('Error fetching competition:', error)
      throw new Error(error.message)
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in getCompetitionById:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Mettre à jour une compétition
 */
export const updateCompetition = async (competitionId, updates) => {
  try {
    const { data, error } = await supabase
      .from('competitions')
      .update({
        name: updates.name,
        sport: updates.sport,
        description: updates.description,
        competition_date: updates.date,
        address: updates.address,
        city: updates.city,
        postal_code: updates.postalCode,
        max_participants: parseInt(updates.maxParticipants, 10),
        age_category: updates.ageCategory,
        is_official: updates.isOfficial,
        status: updates.status,
      })
      .eq('id', competitionId)
      .select()
      .single()

    if (error) {
      console.error('Error updating competition:', error)
      throw new Error(error.message)
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in updateCompetition:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Supprimer une compétition
 */
export const deleteCompetition = async (competitionId) => {
  try {
    // Supprimer les fichiers du storage
    const { data: files } = await supabase
      .from('competition_files')
      .select('file_url')
      .eq('competition_id', competitionId)

    if (files && files.length > 0) {
      const filePaths = files.map(f => {
        const url = new URL(f.file_url)
        return url.pathname.split('/competition-files/')[1]
      })

      await supabase.storage
        .from('competition-files')
        .remove(filePaths)
    }

    // Supprimer la compétition (les fichiers seront supprimés en cascade)
    const { error } = await supabase
      .from('competitions')
      .delete()
      .eq('id', competitionId)

    if (error) {
      console.error('Error deleting competition:', error)
      throw new Error(error.message)
    }

    return { error: null }
  } catch (error) {
    console.error('Error in deleteCompetition:', error)
    return { error: error.message }
  }
}

/**
 * Mettre à jour l'image de couverture d'une compétition
 */
export const updateCompetitionCoverImage = async (competitionId, imageFile) => {
  try {
    // Récupérer l'utilisateur pour utiliser son UUID comme dossier
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Utilisateur non authentifié')
    
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${user.id}/cover-${competitionId}.${fileExt}`

    // Upload de l'image
    const { error: uploadError } = await supabase.storage
      .from('competition-files')
      .upload(fileName, imageFile, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      throw new Error(uploadError.message)
    }

    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('competition-files')
      .getPublicUrl(fileName)

    // Mettre à jour la compétition avec l'URL de l'image
    const { data, error } = await supabase
      .from('competitions')
      .update({ cover_image_url: publicUrl })
      .eq('id', competitionId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error updating cover image:', error)
    return { data: null, error: error.message }
  }
}

export default {
  createCompetition,
  uploadCompetitionFiles,
  createCompetitionWithFiles,
  getUserCompetitions,
  getAllCompetitions,
  getCompetitionById,
  updateCompetition,
  deleteCompetition,
  updateCompetitionCoverImage,
}

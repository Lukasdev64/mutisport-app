/**
 * Service pour la gestion des tournois anonymes
 * Gère les opérations CRUD sans authentification requise
 */

import { supabase } from '../lib/supabase'
import { 
  generateSingleEliminationBracket, 
  generateDoubleEliminationBracket, 
  generateRoundRobinBracket, 
  generateSwissBracket,
  generateSwissRoundPairings,
  getFormatName
} from '../utils/bracketAlgorithms'

/**
 * Mettre à jour l'état du bracket en fonction d'un résultat de match
 */
const updateBracketState = (bracketData, matchResult, format) => {
  console.log('updateBracketState', matchResult, format)
  const newBracket = JSON.parse(JSON.stringify(bracketData)) // Deep copy

  // Trouver le match concerné
  let currentMatch = null
  let currentRoundIndex = -1

  if (!newBracket.rounds) {
    console.error('No rounds in bracket data')
    return newBracket
  }

  for (let r = 0; r < newBracket.rounds.length; r++) {
    const match = newBracket.rounds[r].matches.find(m => m.match_id === matchResult.match_id)
    if (match) {
      currentMatch = match
      currentRoundIndex = r
      break
    }
  }

  if (currentMatch) {
    console.log('Found match:', currentMatch)
    // Mettre à jour le vainqueur
    currentMatch.winner = matchResult.winner

    // Logique spécifique au format pour avancer au tour suivant
    if (format === 'single_elimination' || format === 'double_elimination') {
      if (currentMatch.next_match_id) {
        console.log('Advancing to next match:', currentMatch.next_match_id)
        // Trouver le prochain match
        for (let r = currentRoundIndex + 1; r < newBracket.rounds.length; r++) {
          const nextMatch = newBracket.rounds[r].matches.find(m => m.match_id === currentMatch.next_match_id)
          if (nextMatch) {
            console.log('Found next match:', nextMatch)
            // Déterminer la position (Haut/Bas)
            // Si match_number est impair (1, 3, 5...) -> Player 1 (Haut)
            // Si match_number est pair (2, 4, 6...) -> Player 2 (Bas)
            if (currentMatch.match_number % 2 !== 0) {
              nextMatch.player1 = matchResult.winner
              console.log('Set player1 to', matchResult.winner)
            } else {
              nextMatch.player2 = matchResult.winner
              console.log('Set player2 to', matchResult.winner)
            }
            break
          }
        }
      }
    } else if (format === 'swiss') {
      // 1. Recalculer les standings
      if (newBracket.standings) {
        // Réinitialiser les stats
        newBracket.standings.forEach(s => {
          s.wins = 0
          s.losses = 0
          s.points = 0
          s.opponents = []
        })

        // Parcourir tous les matchs joués pour reconstruire les stats
        newBracket.rounds.forEach(round => {
          round.matches.forEach(m => {
            if (m.winner) {
              const winner = newBracket.standings.find(s => s.player === m.winner)
              const loserName = m.winner === m.player1 ? m.player2 : m.player1
              const loser = newBracket.standings.find(s => s.player === loserName)

              if (winner) {
                winner.wins += 1
                winner.points += 1
                if (loserName) winner.opponents.push(loserName)
              }
              if (loser) {
                loser.losses += 1
                if (m.winner) loser.opponents.push(m.winner)
              }
            }
          })
        })
      }

      // 2. Vérifier si le tour est terminé
      const currentRound = newBracket.rounds[currentRoundIndex]
      const isRoundComplete = currentRound.matches.every(m => m.winner)

      if (isRoundComplete) {
        const nextRoundIndex = currentRoundIndex + 1
        // S'il y a un tour suivant et qu'il n'a pas encore de matchs
        if (nextRoundIndex < newBracket.rounds.length) {
          const nextRound = newBracket.rounds[nextRoundIndex]
          if (!nextRound.matches || nextRound.matches.length === 0) {
            console.log('Generating pairings for round', nextRoundIndex + 1)
            const nextRoundMatches = generateSwissRoundPairings(newBracket.standings, nextRoundIndex + 1)
            nextRound.matches = nextRoundMatches
            nextRound.status = 'ready'
          }
        }
      }
    }
    // Pour round_robin, on met juste à jour le vainqueur du match (déjà fait ci-dessus)
  } else {
    console.error('Match not found in bracket')
  }

  return newBracket
}

/**
 * Annuler l'effet du dernier résultat sur le bracket
 */
const revertBracketState = (bracketData, lastResult, format) => {
  const newBracket = JSON.parse(JSON.stringify(bracketData)) // Deep copy

  // Trouver le match concerné
  let currentMatch = null
  let currentRoundIndex = -1

  if (!newBracket.rounds) return newBracket

  for (let r = 0; r < newBracket.rounds.length; r++) {
    const match = newBracket.rounds[r].matches.find(m => m.match_id === lastResult.match_id)
    if (match) {
      currentMatch = match
      currentRoundIndex = r
      break
    }
  }

  if (currentMatch) {
    // Effacer le vainqueur
    currentMatch.winner = null

    // Logique spécifique pour effacer le joueur du tour suivant
    if (format === 'single_elimination' || format === 'double_elimination') {
      if (currentMatch.next_match_id) {
        for (let r = currentRoundIndex + 1; r < newBracket.rounds.length; r++) {
          const nextMatch = newBracket.rounds[r].matches.find(m => m.match_id === currentMatch.next_match_id)
          if (nextMatch) {
            if (currentMatch.match_number % 2 !== 0) {
              nextMatch.player1 = null
            } else {
              nextMatch.player2 = null
            }
            // Effacer aussi le vainqueur du prochain match si jamais il avait été joué (cas rare en undo)
            nextMatch.winner = null
            break
          }
        }
      }
    }
  }

  return newBracket
}

/**
 * Générer un code URL unique aléatoire (8 caractères)
 */
const generateUniqueCode = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Créer un nouveau tournoi anonyme
 *
 * @param {Object} tournamentData - Données du tournoi
 * @param {string} tournamentData.name - Nom du tournoi
 * @param {string} tournamentData.location - Lieu (optionnel)
 * @param {string} tournamentData.tournament_date - Date du tournoi
 * @param {string} tournamentData.format - Format: single_elimination, double_elimination, round_robin, swiss
 * @param {number} tournamentData.players_count - Nombre de joueurs
 * @param {Array<string>} tournamentData.players_names - Noms des joueurs
 * @param {Object} tournamentData.bracket_data - Structure du bracket (généré par bracketAlgorithms)
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const createAnonymousTournament = async (tournamentData) => {
  try {
    // Générer un code unique (on va réessayer si collision, bien que peu probable)
    let unique_code = generateUniqueCode()
    let attempts = 0
    const MAX_ATTEMPTS = 5

    while (attempts < MAX_ATTEMPTS) {
      // Vérifier si le code existe déjà
      const { data: existing } = await supabase
        .from('anonymous_tournaments')
        .select('id')
        .eq('unique_url_code', unique_code)
        .single()

      if (!existing) break // Code unique trouvé

      unique_code = generateUniqueCode()
      attempts++
    }

    if (attempts === MAX_ATTEMPTS) {
      throw new Error('Impossible de générer un code unique. Veuillez réessayer.')
    }

    // Préparer les données
    const tournament = {
      unique_url_code: unique_code,
      name: tournamentData.name,
      location: tournamentData.location || null,
      tournament_date: tournamentData.tournament_date || null,
      format: tournamentData.format,
      players_count: tournamentData.players_count,
      players_names: tournamentData.players_names || [],
      bracket_data: tournamentData.bracket_data || {},
      match_results: [],
      status: 'setup',
      organizer_id: tournamentData.organizer_id || null, // Ajout de l'ID organisateur si présent
    }

    // Insérer le tournoi
    const { data, error } = await supabase
      .from('anonymous_tournaments')
      .insert([tournament])
      .select()
      .single()

    if (error) {
      console.error('Error creating anonymous tournament:', error)
      throw new Error(error.message || 'Erreur lors de la création du tournoi')
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in createAnonymousTournament:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Récupérer un tournoi par son code URL
 *
 * @param {string} urlCode - Code URL unique du tournoi
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const getTournamentByCode = async (urlCode) => {
  try {
    const { data, error } = await supabase
      .from('anonymous_tournaments')
      .select('*')
      .eq('unique_url_code', urlCode)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Tournoi non trouvé
        return { data: null, error: 'Tournoi introuvable' }
      }
      console.error('Error fetching tournament:', error)
      throw new Error(error.message)
    }

    // Incrémenter le compteur de vues
    await supabase
      .from('anonymous_tournaments')
      .update({
        views_count: (data.views_count || 0) + 1,
        last_viewed_at: new Date().toISOString(),
      })
      .eq('id', data.id)

    return { data, error: null }
  } catch (error) {
    console.error('Error in getTournamentByCode:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Mettre à jour les résultats d'un match
 *
 * @param {string} tournamentId - ID du tournoi
 * @param {Object} matchResult - Résultat du match
 * @param {string} matchResult.match_id - ID du match
 * @param {string} matchResult.winner - Nom du gagnant
 * @param {string} matchResult.loser - Nom du perdant
 * @param {number} matchResult.round - Numéro du tour
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const updateMatchResult = async (tournamentId, matchResult) => {
  console.log('updateMatchResult called', tournamentId, matchResult)
  try {
    // Récupérer le tournoi actuel
    const { data: tournament, error: fetchError } = await supabase
      .from('anonymous_tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single()

    if (fetchError) throw new Error(fetchError.message)

    // Ajouter le résultat à la liste
    const updatedResults = [...(tournament.match_results || []), {
      ...matchResult,
      timestamp: new Date().toISOString(),
    }]

    // Mettre à jour l'état du bracket (avancer les vainqueurs)
    const updatedBracket = updateBracketState(tournament.bracket_data, matchResult, tournament.format)

    // Mettre à jour le tournoi
    const { data, error } = await supabase
      .from('anonymous_tournaments')
      .update({
        match_results: updatedResults,
        bracket_data: updatedBracket,
        status: 'in_progress',
      })
      .eq('id', tournamentId)
      .select()
      .single()

    if (error) {
      console.error('Error updating match result:', error)
      throw new Error(error.message)
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in updateMatchResult:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Annuler le dernier résultat de match
 *
 * @param {string} tournamentId - ID du tournoi
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const undoLastMatchResult = async (tournamentId) => {
  try {
    // Récupérer le tournoi actuel
    const { data: tournament, error: fetchError } = await supabase
      .from('anonymous_tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single()

    if (fetchError) throw new Error(fetchError.message)

    if (!tournament.match_results || tournament.match_results.length === 0) {
      return { data: tournament, error: 'Aucun résultat à annuler' }
    }

    // Identifier le dernier résultat
    const lastResult = tournament.match_results[tournament.match_results.length - 1]

    // Retirer le dernier résultat
    const updatedResults = tournament.match_results.slice(0, -1)

    // Mettre à jour l'état du bracket (revenir en arrière)
    const revertedBracket = revertBracketState(tournament.bracket_data, lastResult, tournament.format)

    // Mettre à jour le tournoi
    const { data, error } = await supabase
      .from('anonymous_tournaments')
      .update({
        match_results: updatedResults,
        bracket_data: revertedBracket,
        status: updatedResults.length === 0 ? 'setup' : 'in_progress',
      })
      .eq('id', tournamentId)
      .select()
      .single()

    if (error) {
      console.error('Error undoing match result:', error)
      throw new Error(error.message)
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in undoLastMatchResult:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Marquer un tournoi comme terminé
 *
 * @param {string} tournamentId - ID du tournoi
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const completeTournament = async (tournamentId) => {
  try {
    const { data, error } = await supabase
      .from('anonymous_tournaments')
      .update({ status: 'completed' })
      .eq('id', tournamentId)
      .select()
      .single()

    if (error) {
      console.error('Error completing tournament:', error)
      throw new Error(error.message)
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in completeTournament:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Mettre à jour les informations du tournoi
 *
 * @param {string} tournamentId - ID du tournoi
 * @param {Object} updates - Champs à mettre à jour
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const updateTournament = async (tournamentId, updates) => {
  try {
    const { data, error } = await supabase
      .from('anonymous_tournaments')
      .update(updates)
      .eq('id', tournamentId)
      .select()
      .single()

    if (error) {
      console.error('Error updating tournament:', error)
      throw new Error(error.message)
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in updateTournament:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Supprimer un tournoi
 *
 * @param {string} tournamentId - ID du tournoi
 * @returns {Promise<{error: string|null}>}
 */
export const deleteTournament = async (tournamentId) => {
  try {
    const { error } = await supabase
      .from('anonymous_tournaments')
      .delete()
      .eq('id', tournamentId)

    if (error) {
      console.error('Error deleting tournament:', error)
      throw new Error(error.message)
    }

    return { error: null }
  } catch (error) {
    console.error('Error in deleteTournament:', error)
    return { error: error.message }
  }
}

/**
 * Récupérer les tournois d'un organisateur
 * 
 * @param {string} organizerId - ID de l'organisateur
 * @returns {Promise<{data: Array|null, error: string|null}>}
 */
export const getTournamentsByOrganizer = async (organizerId) => {
  try {
    const { data, error } = await supabase
      .from('anonymous_tournaments')
      .select('*')
      .eq('organizer_id', organizerId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching organizer tournaments:', error)
      throw new Error(error.message)
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in getTournamentsByOrganizer:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Créer un tournoi mockup pour le développement/test
 * 
 * @param {string} organizerId - ID de l'organisateur
 * @param {Object} options - Options de configuration (optionnel)
 * @param {string} options.format - Format spécifique (single_elimination, double_elimination, round_robin, swiss)
 * @param {number} options.playerCount - Nombre de joueurs spécifique
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const createMockTournament = async (organizerId, options = {}) => {
  try {
    const formats = ['single_elimination', 'double_elimination', 'round_robin', 'swiss']
    
    // Utiliser les options fournies ou des valeurs aléatoires
    const format = options.format && formats.includes(options.format) 
      ? options.format 
      : formats[Math.floor(Math.random() * formats.length)]
      
    const playerCount = options.playerCount || [4, 8, 16][Math.floor(Math.random() * 3)]
    
    const players = Array.from({ length: playerCount }, (_, i) => `Joueur Mock ${i + 1}`)
    
    let bracket_data
    switch (format) {
      case 'single_elimination':
        bracket_data = generateSingleEliminationBracket(players)
        break
      case 'double_elimination':
        bracket_data = generateDoubleEliminationBracket(players)
        break
      case 'round_robin':
        bracket_data = generateRoundRobinBracket(players)
        break
      case 'swiss':
        bracket_data = generateSwissBracket(players)
        break
      default:
        bracket_data = generateSingleEliminationBracket(players)
    }

    const mockData = {
      name: `Tournoi Mock ${getFormatName(format)} (${playerCount}j) - ${new Date().toLocaleTimeString()}`,
      location: 'Stade Virtuel',
      tournament_date: new Date().toISOString().split('T')[0],
      format: format,
      players_count: playerCount,
      players_names: players,
      bracket_data: bracket_data,
      organizer_id: organizerId
    }

    return await createAnonymousTournament(mockData)
  } catch (error) {
    console.error('Error creating mock tournament:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Forcer la génération du prochain tour (utile si bloqué ou pour Swiss)
 * 
 * @param {string} tournamentId - ID du tournoi
 * @returns {Promise<{data: Object|null, error: string|null}>}
 */
export const generateNextRound = async (tournamentId) => {
  try {
    const { data: tournament, error: fetchError } = await supabase
      .from('anonymous_tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single()

    if (fetchError) throw new Error(fetchError.message)
    
    if (tournament.format !== 'swiss') return { error: 'Action disponible uniquement pour le système Suisse' }

    const bracket = JSON.parse(JSON.stringify(tournament.bracket_data))
    
    // Trouver le dernier tour actif
    let currentRoundIndex = -1
    for (let i = 0; i < bracket.rounds.length; i++) {
        if (bracket.rounds[i].matches && bracket.rounds[i].matches.length > 0) {
            currentRoundIndex = i
        } else {
            break
        }
    }
    
    if (currentRoundIndex === -1) return { error: 'Aucun tour actif trouvé' }
    
    const currentRound = bracket.rounds[currentRoundIndex]
    const isRoundComplete = currentRound.matches.every(m => m.winner)
    
    if (!isRoundComplete) return { error: `Le tour ${currentRound.round} n'est pas terminé` }
    
    const nextRoundIndex = currentRoundIndex + 1
    if (nextRoundIndex >= bracket.rounds.length) return { error: 'Tournoi terminé, pas de tour suivant' }
    
    const nextRound = bracket.rounds[nextRoundIndex]
    if (nextRound.matches && nextRound.matches.length > 0) return { error: 'Le tour suivant est déjà généré' }
    
    // Recalculer les standings
    if (bracket.standings) {
      bracket.standings.forEach(s => {
        s.wins = 0
        s.losses = 0
        s.points = 0
        s.opponents = []
      })

      bracket.rounds.forEach(round => {
        if (round.matches) {
          round.matches.forEach(m => {
            if (m.winner) {
              const winner = bracket.standings.find(s => s.player === m.winner)
              const loserName = m.winner === m.player1 ? m.player2 : m.player1
              const loser = bracket.standings.find(s => s.player === loserName)

              if (winner) {
                winner.wins += 1
                winner.points += 1
                if (loserName) winner.opponents.push(loserName)
              }
              if (loser) {
                loser.losses += 1
                if (m.winner) loser.opponents.push(m.winner)
              }
            }
          })
        }
      })
    }
    
    // Générer les appariements
    console.log('Force generating pairings for round', nextRoundIndex + 1)
    const nextRoundMatches = generateSwissRoundPairings(bracket.standings, nextRoundIndex + 1)
    nextRound.matches = nextRoundMatches
    nextRound.status = 'ready'
    
    // Sauvegarder
    const { data, error } = await supabase
      .from('anonymous_tournaments')
      .update({ bracket_data: bracket })
      .eq('id', tournamentId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    
    return { data, error: null }
  } catch (error) {
    console.error('Error in generateNextRound:', error)
    return { data: null, error: error.message }
  }
}

export default {
  createAnonymousTournament,
  getTournamentByCode,
  updateMatchResult,
  undoLastMatchResult,
  completeTournament,
  updateTournament,
  deleteTournament,
  getTournamentsByOrganizer,
  createMockTournament,
  generateNextRound
}

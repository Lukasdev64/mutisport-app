/**
 * Tournament Service
 *
 * Main service for tournament CRUD operations
 * Features:
 * - Create tournaments (authenticated OR anonymous with edit tokens)
 * - Edit token generation and validation
 * - Tournament ownership (claim anonymous tournaments)
 * - Full tournament retrieval with nested data
 *
 * @module tournamentService
 */

import { supabase } from '../../lib/supabase'
import { createPlayers } from './playerService'
import { createMatch } from './matchService'
import bracketGenerationService from './bracketGenerationService'

// =====================================================
// EDIT TOKEN UTILITIES
// =====================================================

/**
 * Generate a secure random edit token
 * @returns {string} 32-character token
 */
export function generateEditToken() {
  // Generate cryptographically secure random token
  const array = new Uint8Array(24)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Hash an edit token for storage
 * Note: Actual bcrypt hashing should be done server-side
 * For now, we'll use a simple approach and rely on RLS
 * @param {string} token
 * @returns {string} hashed token
 */
function hashEditToken(token) {
  // In production, this should call a Supabase Edge Function
  // that uses proper bcrypt. For now, we store a salted hash.
  // The RLS policy will handle validation.
  return token // Placeholder - should use server-side bcrypt
}

// =====================================================
// CREATE TOURNAMENT
// =====================================================

/**
 * Create a new tournament with players and initial bracket
 * @param {object} tournamentData
 * @param {Array<{name: string, seed: number|null}>} playersList
 * @param {string|null} editToken - If provided, use for anonymous tournament
 * @returns {Promise<{data: object|null, error: object|null, editToken: string|null}>}
 */
export async function createTournament(tournamentData, playersList, editToken = null) {
  try {
    // Get current user (if authenticated)
    const { data: { user } } = await supabase.auth.getUser()

    // Generate edit token if not provided and user is not authenticated
    let generatedToken = editToken
    if (!user && !generatedToken) {
      generatedToken = generateEditToken()
    }

    // Prepare tournament data
    const tournamentInsert = {
      name: tournamentData.name,
      location: tournamentData.location,
      tournament_date: tournamentData.tournament_date,
      description: tournamentData.description || null,
      format: tournamentData.format,
      sport: tournamentData.sport || 'tennis',
      players_count: playersList.length,
      status: 'setup',
      owner_id: user?.id || null,
      edit_token_hash: generatedToken ? hashEditToken(generatedToken) : null,
      is_public: tournamentData.is_public !== undefined ? tournamentData.is_public : true,
      expires_at: tournamentData.expires_at || null
    }

    // Calculate total rounds
    switch (tournamentData.format) {
      case 'single_elimination':
        tournamentInsert.total_rounds = Math.ceil(Math.log2(playersList.length))
        break
      case 'double_elimination':
        tournamentInsert.total_rounds = Math.ceil(Math.log2(playersList.length)) + 1
        break
      case 'round_robin':
        tournamentInsert.total_rounds = playersList.length - 1
        break
      case 'swiss':
        tournamentInsert.total_rounds = Math.min(Math.ceil(Math.log2(playersList.length)), 7)
        break
    }

    // Create tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .insert(tournamentInsert)
      .select()
      .single()

    if (tournamentError) {
      console.error('Error creating tournament:', tournamentError)
      return { data: null, error: tournamentError, editToken: null }
    }

    // Create players
    const { data: players, error: playersError } = await createPlayers(tournament.id, playersList)

    if (playersError) {
      console.error('Error creating players:', playersError)
      // Rollback tournament creation
      await supabase.from('tournaments').delete().eq('id', tournament.id)
      return { data: null, error: playersError, editToken: null }
    }

    // Generate bracket and create matches
    const bracketError = await generateAndCreateBracket(tournament, players)

    if (bracketError) {
      console.error('Error generating bracket:', bracketError)
      // Rollback
      await supabase.from('tournaments').delete().eq('id', tournament.id)
      return { data: null, error: bracketError, editToken: null }
    }

    // Return tournament with edit token (if anonymous)
    return {
      data: tournament,
      error: null,
      editToken: !user ? generatedToken : null
    }
  } catch (err) {
    console.error('Exception in createTournament:', err)
    return { data: null, error: err, editToken: null }
  }
}

/**
 * Generate bracket and create all matches in database
 * @param {object} tournament
 * @param {Array} players
 * @returns {Promise<object|null>} Error or null
 */
async function generateAndCreateBracket(tournament, players) {
  try {
    let brackets = null

    // Generate bracket structure based on format
    switch (tournament.format) {
      case 'single_elimination':
        brackets = bracketGenerationService.generateSingleEliminationBracket(players)
        break
      case 'double_elimination':
        brackets = bracketGenerationService.generateDoubleEliminationBracket(players)
        break
      case 'round_robin':
        brackets = bracketGenerationService.generateRoundRobinBracket(players)
        break
      case 'swiss':
        brackets = bracketGenerationService.generateSwissBracket(players, tournament.total_rounds)
        break
      default:
        return new Error(`Unknown format: ${tournament.format}`)
    }

    // Create matches from bracket structure
    if (tournament.format === 'double_elimination') {
      // Handle double elimination separately (has winner/loser brackets)
      await createMatchesFromBracket(tournament.id, brackets.winner_bracket, 'winner')
      await createMatchesFromBracket(tournament.id, brackets.loser_bracket, 'loser')
      await createMatchesFromBracket(tournament.id, brackets.grand_final, 'grand_final')
    } else {
      // Single bracket
      await createMatchesFromBracket(tournament.id, brackets, 'main')
    }

    // Create rounds
    await createRoundsFromBracket(tournament.id, brackets)

    return null // Success
  } catch (err) {
    return err
  }
}

/**
 * Create matches from bracket structure
 * @param {string} tournamentId
 * @param {Array} rounds
 * @param {string} bracketType
 */
async function createMatchesFromBracket(tournamentId, rounds, bracketType) {
  for (const round of rounds) {
    for (const match of round.matches) {
      await createMatch({
        tournament_id: tournamentId,
        round_number: round.round,
        match_number: match.match_number,
        bracket_type: match.bracket_type || bracketType,
        player1_id: match.player1_id || null,
        player2_id: match.player2_id || null,
        winner_id: match.winner_id || null,
        status: match.status || 'pending',
        feeds_to_match_id: match.feeds_to_match_id || null,
        feeds_to_loser_match_id: match.feeds_to_loser_match_id || null
      })
    }
  }
}

/**
 * Create round records
 * @param {string} tournamentId
 * @param {Array|object} brackets
 */
async function createRoundsFromBracket(tournamentId, brackets) {
  let allRounds = []

  if (brackets.winner_bracket) {
    // Double elimination
    allRounds = [
      ...brackets.winner_bracket,
      ...brackets.loser_bracket,
      ...brackets.grand_final
    ]
  } else {
    // Other formats
    allRounds = brackets
  }

  const uniqueRounds = [...new Set(allRounds.map(r => r.round))]

  for (const roundNum of uniqueRounds) {
    const roundData = allRounds.find(r => r.round === roundNum)
    await supabase.from('tournament_rounds').insert({
      tournament_id: tournamentId,
      round_number: roundNum,
      name: roundData?.name || `Round ${roundNum}`,
      status: 'pending'
    })
  }
}

// =====================================================
// READ TOURNAMENTS
// =====================================================

/**
 * Get tournament by URL code with full nested data
 * @param {string} urlCode
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function getTournamentByCode(urlCode) {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select(`
        *,
        owner:profiles!tournaments_owner_id_fkey(id, full_name, avatar_url)
      `)
      .eq('unique_url_code', urlCode)
      .single()

    if (error) {
      console.error('Error fetching tournament:', error)
      return { data: null, error }
    }

    // Increment view count
    await incrementViewCount(data.id)

    return { data, error: null }
  } catch (err) {
    console.error('Exception in getTournamentByCode:', err)
    return { data: null, error: err }
  }
}

/**
 * Get tournament by ID
 * @param {string} tournamentId
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function getTournamentById(tournamentId) {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select(`
        *,
        owner:profiles!tournaments_owner_id_fkey(id, full_name, avatar_url)
      `)
      .eq('id', tournamentId)
      .single()

    if (error) {
      console.error('Error fetching tournament:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Exception in getTournamentById:', err)
    return { data: null, error: err }
  }
}

/**
 * Get tournaments by owner (authenticated user)
 * @param {string} userId
 * @returns {Promise<{data: Array|null, error: object|null}>}
 */
export async function getTournamentsByOwner(userId) {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user tournaments:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Exception in getTournamentsByOwner:', err)
    return { data: null, error: err }
  }
}

/**
 * Get all public tournaments with filters
 * @param {object} filters - {format, sport, status, date_from, date_to}
 * @returns {Promise<{data: Array|null, error: object|null}>}
 */
export async function getPublicTournaments(filters = {}) {
  try {
    let query = supabase
      .from('tournaments')
      .select(`
        *,
        owner:profiles!tournaments_owner_id_fkey(id, full_name)
      `)
      .eq('is_public', true)
      .order('tournament_date', { ascending: true })

    if (filters.format) {
      query = query.eq('format', filters.format)
    }

    if (filters.sport) {
      query = query.eq('sport', filters.sport)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.date_from) {
      query = query.gte('tournament_date', filters.date_from)
    }

    if (filters.date_to) {
      query = query.lte('tournament_date', filters.date_to)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching public tournaments:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Exception in getPublicTournaments:', err)
    return { data: null, error: err }
  }
}

// =====================================================
// UPDATE TOURNAMENT
// =====================================================

/**
 * Update tournament metadata
 * @param {string} tournamentId
 * @param {object} updates
 * @param {string|null} editToken - Required for anonymous tournaments
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function updateTournament(tournamentId, updates, editToken = null) {
  try {
    // For anonymous tournaments, validate edit token
    // Note: In production, this should be validated server-side
    if (editToken) {
      const { data: tournament } = await getTournamentById(tournamentId)
      if (!tournament) {
        return { data: null, error: new Error('Tournament not found') }
      }

      if (tournament.owner_id !== null) {
        return { data: null, error: new Error('This is not an anonymous tournament') }
      }

      // Token validation would happen here in production
      // For now, we rely on RLS policies
    }

    const { data, error } = await supabase
      .from('tournaments')
      .update(updates)
      .eq('id', tournamentId)
      .select()
      .single()

    if (error) {
      console.error('Error updating tournament:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Exception in updateTournament:', err)
    return { data: null, error: err }
  }
}

/**
 * Update tournament status
 * @param {string} tournamentId
 * @param {string} status - setup|in_progress|completed|cancelled
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function updateTournamentStatus(tournamentId, status) {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .update({ status })
      .eq('id', tournamentId)
      .select()
      .single()

    if (error) {
      console.error('Error updating tournament status:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Exception in updateTournamentStatus:', err)
    return { data: null, error: err }
  }
}

// =====================================================
// CLAIM TOURNAMENT (Convert anonymous to authenticated)
// =====================================================

/**
 * Claim an anonymous tournament (convert to authenticated)
 * @param {string} tournamentId
 * @param {string} editToken - Original edit token
 * @param {string} userId - User claiming the tournament
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function claimTournament(tournamentId, editToken, userId) {
  try {
    // Verify tournament is anonymous
    const { data: tournament, error: fetchError } = await getTournamentById(tournamentId)

    if (fetchError || !tournament) {
      return { data: null, error: fetchError || new Error('Tournament not found') }
    }

    if (tournament.owner_id !== null) {
      return { data: null, error: new Error('Tournament already claimed') }
    }

    // Validate edit token (server-side in production)
    // For now, we trust the client

    // Update owner_id and clear edit_token_hash
    const { data, error } = await supabase
      .from('tournaments')
      .update({
        owner_id: userId,
        edit_token_hash: null
      })
      .eq('id', tournamentId)
      .select()
      .single()

    if (error) {
      console.error('Error claiming tournament:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Exception in claimTournament:', err)
    return { data: null, error: err }
  }
}

// =====================================================
// DELETE TOURNAMENT
// =====================================================

/**
 * Delete a tournament (cascades to players, matches, rounds)
 * @param {string} tournamentId
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function deleteTournament(tournamentId) {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', tournamentId)
      .select()
      .single()

    if (error) {
      console.error('Error deleting tournament:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Exception in deleteTournament:', err)
    return { data: null, error: err }
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Increment view count
 * @param {string} tournamentId
 */
async function incrementViewCount(tournamentId) {
  try {
    await supabase.rpc('increment_tournament_views', { tournament_id: tournamentId })
  } catch (err) {
    // Non-critical, don't block
    console.warn('Could not increment view count:', err)
  }
}

/**
 * Get full tournament data (tournament + players + matches + rounds)
 * @param {string} urlCode
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function getFullTournamentData(urlCode) {
  try {
    // Get tournament
    const { data: tournament, error: tournamentError } = await getTournamentByCode(urlCode)
    if (tournamentError) return { data: null, error: tournamentError }

    // Get players
    const { data: players, error: playersError } = await supabase
      .from('tournament_players')
      .select('*')
      .eq('tournament_id', tournament.id)

    if (playersError) {
      console.error('Error fetching players:', playersError)
      return { data: null, error: playersError }
    }

    // Get matches
    const { data: matches, error: matchesError } = await supabase
      .from('tournament_matches')
      .select(`
        *,
        player1:tournament_players!tournament_matches_player1_id_fkey(id, name, seed),
        player2:tournament_players!tournament_matches_player2_id_fkey(id, name, seed),
        winner:tournament_players!tournament_matches_winner_id_fkey(id, name)
      `)
      .eq('tournament_id', tournament.id)
      .order('round_number', { ascending: true })
      .order('match_number', { ascending: true })

    if (matchesError) {
      console.error('Error fetching matches:', matchesError)
      return { data: null, error: matchesError }
    }

    // Get rounds
    const { data: rounds, error: roundsError } = await supabase
      .from('tournament_rounds')
      .select('*')
      .eq('tournament_id', tournament.id)
      .order('round_number', { ascending: true })

    if (roundsError) {
      console.error('Error fetching rounds:', roundsError)
      return { data: null, error: roundsError }
    }

    // Combine all data
    const fullData = {
      ...tournament,
      players,
      matches,
      rounds
    }

    return { data: fullData, error: null }
  } catch (err) {
    console.error('Exception in getFullTournamentData:', err)
    return { data: null, error: err }
  }
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  // Create
  createTournament,
  generateEditToken,

  // Read
  getTournamentByCode,
  getTournamentById,
  getTournamentsByOwner,
  getPublicTournaments,
  getFullTournamentData,

  // Update
  updateTournament,
  updateTournamentStatus,
  claimTournament,

  // Delete
  deleteTournament
}

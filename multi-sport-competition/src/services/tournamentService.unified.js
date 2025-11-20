/**
 * UNIFIED TOURNAMENT SERVICE
 * ==========================
 * Combines functionality from:
 * - anonymousTournamentService.js (bracket management, match results)
 * - competitionService.js (CRUD, files, RLS)
 *
 * Uses new unified 'tournaments' table schema
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

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Create a new tournament with optional files
 * @param {Object} tournamentData - Tournament basic data
 * @param {Array} files - Optional array of files to upload
 * @param {Object} bracketConfig - Optional bracket configuration
 * @returns {Promise<{data, error}>}
 */
export const createTournament = async (tournamentData, files = [], bracketConfig = null) => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError
    if (!user) throw new Error('User must be authenticated to create tournaments')

    // Generate unique URL code
    const urlCode = tournamentData.unique_url_code ||
      `${tournamentData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`

    // Prepare tournament data
    const tournament = {
      unique_url_code: urlCode,
      organizer_id: user.id,
      name: tournamentData.name,
      description: tournamentData.description || null,
      sport: tournamentData.sport,
      format: tournamentData.format || 'single-elimination',
      max_participants: tournamentData.max_participants || 16,
      location: tournamentData.location || null,
      address: tournamentData.address || null,
      city: tournamentData.city || null,
      postal_code: tournamentData.postal_code || null,
      country: tournamentData.country || 'France',
      date: tournamentData.date || null,
      start_time: tournamentData.start_time || null,
      end_time: tournamentData.end_time || null,
      age_category: tournamentData.age_category || 'both',
      is_official: tournamentData.is_official || false,
      is_public: tournamentData.is_public !== undefined ? tournamentData.is_public : true,
      status: 'draft',
      bracket_data: bracketConfig || {},
      match_results: []
    }

    // Insert tournament
    const { data: newTournament, error: insertError } = await supabase
      .from('tournaments')
      .insert(tournament)
      .select()
      .single()

    if (insertError) throw insertError

    // Upload files if provided
    if (files && files.length > 0) {
      const fileUploadResult = await uploadTournamentFiles(newTournament.id, files)
      if (fileUploadResult.error) {
        console.error('File upload error:', fileUploadResult.error)
        // Don't fail the whole operation, just log the error
      }
    }

    // Fetch complete tournament with files
    const completeData = await getTournamentById(newTournament.id)

    return { data: completeData.data, error: null }
  } catch (error) {
    console.error('Error in createTournament:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Create tournament with players and generate initial bracket
 * @param {Object} tournamentData - Basic tournament info
 * @param {Array} players - Array of player objects {name, seed?}
 * @returns {Promise<{data, error}>}
 */
export const createTournamentWithBracket = async (tournamentData, players = []) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    // Generate unique URL code
    const urlCode = `${tournamentData.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`

    // Generate bracket based on format
    let bracketData
    switch (tournamentData.format) {
      case 'single-elimination':
        bracketData = generateSingleEliminationBracket(players)
        break
      case 'double-elimination':
        bracketData = generateDoubleEliminationBracket(players)
        break
      case 'round-robin':
        bracketData = generateRoundRobinBracket(players)
        break
      case 'swiss':
        bracketData = generateSwissBracket(players)
        break
      default:
        bracketData = generateSingleEliminationBracket(players)
    }

    // Create tournament
    const tournament = {
      unique_url_code: urlCode,
      organizer_id: user?.id || null,
      name: tournamentData.name,
      sport: tournamentData.sport || 'Tennis',
      format: tournamentData.format,
      max_participants: players.length,
      current_participants: players.length,
      date: tournamentData.date || new Date().toISOString().split('T')[0],
      status: 'draft',
      is_public: true,
      bracket_data: bracketData
    }

    const { data: newTournament, error: insertError } = await supabase
      .from('tournaments')
      .insert(tournament)
      .select()
      .single()

    if (insertError) throw insertError

    // Insert players into tournament_players table
    if (players && players.length > 0) {
      const playerInserts = players.map((player, index) => ({
        tournament_id: newTournament.id,
        name: player.name || player,
        seed: player.seed || index + 1,
        status: 'confirmed'
      }))

      const { error: playersError } = await supabase
        .from('tournament_players')
        .insert(playerInserts)

      if (playersError) console.error('Error inserting players:', playersError)
    }

    return { data: newTournament, error: null }
  } catch (error) {
    console.error('Error in createTournamentWithBracket:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get tournament by ID with all relations
 * @param {string} tournamentId - Tournament UUID
 * @returns {Promise<{data, error}>}
 */
export const getTournamentById = async (tournamentId) => {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select(`
        *,
        organizer:profiles!organizer_id (
          id,
          full_name,
          avatar_url
        ),
        players:tournament_players (
          id,
          name,
          email,
          seed,
          status,
          wins,
          losses,
          points,
          buchholz_score
        ),
        files:tournament_files (
          id,
          file_name,
          file_path,
          file_type,
          file_size,
          uploaded_at,
          category
        ),
        matches:tournament_matches (
          id,
          match_number,
          round_number,
          player1_id,
          player2_id,
          player1_score,
          player2_score,
          winner_id,
          status,
          scheduled_time
        ),
        rounds:tournament_rounds (
          id,
          round_number,
          name,
          round_type,
          status
        )
      `)
      .eq('id', tournamentId)
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error in getTournamentById:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get tournament by unique URL code (public access)
 * @param {string} urlCode - Unique URL code
 * @returns {Promise<{data, error}>}
 */
export const getTournamentByCode = async (urlCode) => {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .select(`
        *,
        organizer:profiles!organizer_id (
          id,
          full_name
        ),
        players:tournament_players (
          id,
          name,
          seed,
          wins,
          losses,
          points
        )
      `)
      .eq('unique_url_code', urlCode)
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error in getTournamentByCode:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get all tournaments for current user
 * @param {Object} filters - Optional filters {status, sport, format}
 * @returns {Promise<{data, error}>}
 */
export const getUserTournaments = async (filters = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    let query = supabase
      .from('tournaments')
      .select(`
        *,
        players:tournament_players (count)
      `)
      .eq('organizer_id', user.id)
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.sport) {
      query = query.eq('sport', filters.sport)
    }
    if (filters.format) {
      query = query.eq('format', filters.format)
    }

    const { data, error } = await query

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error in getUserTournaments:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Get all public tournaments with optional filters
 * @param {Object} filters - Optional filters
 * @returns {Promise<{data, error}>}
 */
export const getAllTournaments = async (filters = {}) => {
  try {
    let query = supabase
      .from('tournaments')
      .select(`
        *,
        organizer:profiles!organizer_id (
          id,
          full_name,
          avatar_url
        ),
        players:tournament_players (count)
      `)
      .eq('is_public', true)
      .order('date', { ascending: false })

    // Apply filters
    if (filters.sport) query = query.eq('sport', filters.sport)
    if (filters.city) query = query.ilike('city', `%${filters.city}%`)
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.format) query = query.eq('format', filters.format)
    if (filters.age_category) query = query.eq('age_category', filters.age_category)

    const { data, error } = await query

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error in getAllTournaments:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Update tournament
 * @param {string} tournamentId - Tournament UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<{data, error}>}
 */
export const updateTournament = async (tournamentId, updates) => {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .update(updates)
      .eq('id', tournamentId)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error in updateTournament:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Delete tournament (cascade deletes players, matches, files)
 * @param {string} tournamentId - Tournament UUID
 * @returns {Promise<{data, error}>}
 */
export const deleteTournament = async (tournamentId) => {
  try {
    // Delete associated files from storage first
    const { data: files } = await supabase
      .from('tournament_files')
      .select('storage_path')
      .eq('tournament_id', tournamentId)

    if (files && files.length > 0) {
      const filePaths = files.map(f => f.storage_path)
      await supabase.storage
        .from('tournament-files')
        .remove(filePaths)
    }

    // Delete tournament (cascade will handle related tables)
    const { error } = await supabase
      .from('tournaments')
      .delete()
      .eq('id', tournamentId)

    if (error) throw error

    return { data: true, error: null }
  } catch (error) {
    console.error('Error in deleteTournament:', error)
    return { data: null, error: error.message }
  }
}

// ============================================================================
// FILE MANAGEMENT
// ============================================================================

/**
 * Upload files to tournament
 * @param {string} tournamentId - Tournament UUID
 * @param {Array} files - Array of File objects
 * @returns {Promise<{data, error}>}
 */
export const uploadTournamentFiles = async (tournamentId, files) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User must be authenticated to upload files')

    const uploadedFiles = []
    const errors = []

    for (const file of files) {
      try {
        // Generate unique file path
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('tournament-files')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        // Insert file record
        const { data: fileRecord, error: insertError } = await supabase
          .from('tournament_files')
          .insert({
            tournament_id: tournamentId,
            file_name: file.name,
            file_path: uploadData.path,
            file_size: file.size,
            file_type: file.type,
            storage_bucket: 'tournament-files',
            storage_path: uploadData.path,
            uploaded_by: user.id,
            category: 'document'
          })
          .select()
          .single()

        if (insertError) throw insertError

        uploadedFiles.push(fileRecord)
      } catch (fileError) {
        console.error(`Error uploading file ${file.name}:`, fileError)
        errors.push({ file: file.name, error: fileError.message })
      }
    }

    return {
      data: uploadedFiles,
      error: errors.length > 0 ? errors : null
    }
  } catch (error) {
    console.error('Error in uploadTournamentFiles:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Update tournament cover image
 * @param {string} tournamentId - Tournament UUID
 * @param {File} imageFile - Image file
 * @returns {Promise<{data, error}>}
 */
export const updateCoverImage = async (tournamentId, imageFile) => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User must be authenticated')

    // Upload image
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `cover-${tournamentId}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('tournament-files')
      .upload(filePath, imageFile, { upsert: true })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('tournament-files')
      .getPublicUrl(filePath)

    // Update tournament
    const { data, error } = await supabase
      .from('tournaments')
      .update({ cover_image_url: publicUrl })
      .eq('id', tournamentId)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error in updateCoverImage:', error)
    return { data: null, error: error.message }
  }
}

// ============================================================================
// BRACKET & MATCH MANAGEMENT
// ============================================================================

/**
 * Update match result and advance bracket
 * @param {string} tournamentId - Tournament UUID
 * @param {Object} matchResult - {match_id, winner, player1_score, player2_score}
 * @returns {Promise<{data, error}>}
 */
export const updateMatchResult = async (tournamentId, matchResult) => {
  try {
    // Get tournament with current bracket data
    const { data: tournament, error: fetchError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single()

    if (fetchError) throw fetchError

    // Update bracket state
    const newBracketData = updateBracketState(
      tournament.bracket_data,
      matchResult,
      tournament.format
    )

    // Add to match results history
    const newMatchResults = [
      ...tournament.match_results,
      {
        ...matchResult,
        timestamp: new Date().toISOString()
      }
    ]

    // Update tournament
    const { data, error: updateError } = await supabase
      .from('tournaments')
      .update({
        bracket_data: newBracketData,
        match_results: newMatchResults,
        updated_at: new Date().toISOString()
      })
      .eq('id', tournamentId)
      .select()
      .single()

    if (updateError) throw updateError

    // Also update tournament_matches table
    const match = findMatchInBracket(newBracketData, matchResult.match_id)
    if (match) {
      await upsertMatch(tournamentId, match, matchResult)
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error in updateMatchResult:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Internal: Update bracket state based on match result
 */
const updateBracketState = (bracketData, matchResult, format) => {
  const newBracket = JSON.parse(JSON.stringify(bracketData))

  // Find current match
  let currentMatch = null
  let currentRoundIndex = -1

  if (!newBracket.rounds) return newBracket

  for (let r = 0; r < newBracket.rounds.length; r++) {
    const match = newBracket.rounds[r].matches.find(m => m.match_id === matchResult.match_id)
    if (match) {
      currentMatch = match
      currentRoundIndex = r
      break
    }
  }

  if (currentMatch) {
    // Update winner
    currentMatch.winner = matchResult.winner
    currentMatch.player1_score = matchResult.player1_score
    currentMatch.player2_score = matchResult.player2_score

    // Advance winner based on format
    if (format === 'single-elimination' || format === 'double-elimination') {
      if (currentMatch.next_match_id) {
        // Find next match
        for (let r = currentRoundIndex + 1; r < newBracket.rounds.length; r++) {
          const nextMatch = newBracket.rounds[r].matches.find(
            m => m.match_id === currentMatch.next_match_id
          )
          if (nextMatch) {
            // Place winner in appropriate slot
            if (currentMatch.match_number % 2 !== 0) {
              nextMatch.player1 = matchResult.winner
            } else {
              nextMatch.player2 = matchResult.winner
            }
            break
          }
        }
      }
    } else if (format === 'swiss') {
      // Recalculate standings
      recalculateSwissStandings(newBracket)
    } else if (format === 'round-robin') {
      // Update standings
      updateRoundRobinStandings(newBracket, matchResult)
    }
  }

  return newBracket
}

/**
 * Recalculate swiss standings
 */
const recalculateSwissStandings = (bracketData) => {
  if (!bracketData.standings) return

  // Reset stats
  bracketData.standings.forEach(s => {
    s.wins = 0
    s.losses = 0
    s.points = 0
    s.opponents = []
  })

  // Recalculate from all completed matches
  bracketData.rounds.forEach(round => {
    round.matches.forEach(match => {
      if (match.winner) {
        const winner = bracketData.standings.find(s => s.player === match.winner)
        const loserName = match.winner === match.player1 ? match.player2 : match.player1
        const loser = bracketData.standings.find(s => s.player === loserName)

        if (winner) {
          winner.wins += 1
          winner.points += 1
          if (loserName) winner.opponents.push(loserName)
        }
        if (loser) {
          loser.losses += 1
          if (match.winner) loser.opponents.push(match.winner)
        }
      }
    })
  })

  // Sort by points
  bracketData.standings.sort((a, b) => b.points - a.points)
}

/**
 * Update round robin standings
 */
const updateRoundRobinStandings = (bracketData, matchResult) => {
  if (!bracketData.standings) return

  const winner = bracketData.standings.find(s => s.player === matchResult.winner)
  const loserName = matchResult.winner === matchResult.player1
    ? matchResult.player2
    : matchResult.player1
  const loser = bracketData.standings.find(s => s.player === loserName)

  if (winner) {
    winner.wins += 1
    winner.points += 3 // 3 points for win
  }
  if (loser) {
    loser.losses += 1
  }

  // Sort standings
  bracketData.standings.sort((a, b) => b.points - a.points || b.wins - a.wins)
}

/**
 * Generate next round for Swiss system
 * @param {string} tournamentId - Tournament UUID
 * @returns {Promise<{data, error}>}
 */
export const generateNextRound = async (tournamentId) => {
  try {
    const { data: tournament, error: fetchError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single()

    if (fetchError) throw fetchError

    if (tournament.format !== 'swiss') {
      throw new Error('generateNextRound is only for Swiss format')
    }

    // Generate next round pairings
    const newRoundPairings = generateSwissRoundPairings(
      tournament.bracket_data.standings,
      tournament.bracket_data.rounds
    )

    // Add new round to bracket data
    const newBracketData = {
      ...tournament.bracket_data,
      rounds: [...tournament.bracket_data.rounds, newRoundPairings]
    }

    // Update tournament
    const { data, error: updateError } = await supabase
      .from('tournaments')
      .update({ bracket_data: newBracketData })
      .eq('id', tournamentId)
      .select()
      .single()

    if (updateError) throw updateError

    return { data, error: null }
  } catch (error) {
    console.error('Error in generateNextRound:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Undo last match result
 * @param {string} tournamentId - Tournament UUID
 * @returns {Promise<{data, error}>}
 */
export const undoLastMatchResult = async (tournamentId) => {
  try {
    const { data: tournament, error: fetchError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single()

    if (fetchError) throw fetchError

    if (tournament.match_results.length === 0) {
      throw new Error('No match results to undo')
    }

    // Remove last result
    const newMatchResults = tournament.match_results.slice(0, -1)

    // Rebuild bracket from scratch with remaining results
    let newBracketData = tournament.bracket_data
    // Reset bracket and replay all remaining results
    // (Implementation depends on specific bracket structure)

    const { data, error: updateError } = await supabase
      .from('tournaments')
      .update({
        bracket_data: newBracketData,
        match_results: newMatchResults
      })
      .eq('id', tournamentId)
      .select()
      .single()

    if (updateError) throw updateError

    return { data, error: null }
  } catch (error) {
    console.error('Error in undoLastMatchResult:', error)
    return { data: null, error: error.message }
  }
}

/**
 * Mark tournament as completed
 * @param {string} tournamentId - Tournament UUID
 * @returns {Promise<{data, error}>}
 */
export const completeTournament = async (tournamentId) => {
  try {
    const { data, error } = await supabase
      .from('tournaments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', tournamentId)
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    console.error('Error in completeTournament:', error)
    return { data: null, error: error.message }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Find match in bracket data
 */
const findMatchInBracket = (bracketData, matchId) => {
  if (!bracketData.rounds) return null

  for (const round of bracketData.rounds) {
    const match = round.matches.find(m => m.match_id === matchId)
    if (match) return match
  }

  return null
}

/**
 * Upsert match in tournament_matches table
 */
const upsertMatch = async (tournamentId, match, matchResult) => {
  try {
    await supabase
      .from('tournament_matches')
      .upsert({
        tournament_id: tournamentId,
        match_number: match.match_number,
        round_number: match.round_number,
        player1_score: matchResult.player1_score,
        player2_score: matchResult.player2_score,
        status: 'completed',
        completed_at: new Date().toISOString()
      }, {
        onConflict: 'tournament_id,match_number'
      })
  } catch (error) {
    console.error('Error upserting match:', error)
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // CRUD
  createTournament,
  createTournamentWithBracket,
  getTournamentById,
  getTournamentByCode,
  getUserTournaments,
  getAllTournaments,
  updateTournament,
  deleteTournament,

  // Files
  uploadTournamentFiles,
  updateCoverImage,

  // Bracket & Matches
  updateMatchResult,
  generateNextRound,
  undoLastMatchResult,
  completeTournament
}

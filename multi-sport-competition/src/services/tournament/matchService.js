/**
 * Match Service
 *
 * Handles all CRUD operations for tournament matches
 * Features:
 * - Detailed score tracking (sets, games, tiebreaks)
 * - Automatic bracket advancement
 * - Player statistics updates (via triggers)
 * - Double elimination support (loser bracket feeding)
 * - Score validation
 *
 * @module matchService
 */

import { supabase } from '../../lib/supabase'

// =====================================================
// SCORE UTILITIES
// =====================================================

/**
 * Parse score string to score_data object
 * Examples:
 * - "6-4 7-5" → {sets: [{player1: 6, player2: 4}, {player1: 7, player2: 5}]}
 * - "6-4 7-6(5)" → {sets: [{player1: 6, player2: 4}, {player1: 7, player2: 6}], tiebreaks: [null, 5]}
 *
 * @param {string} scoreString
 * @returns {object} score_data JSONB
 */
export function parseScoreString(scoreString) {
  if (!scoreString || scoreString.trim() === '') {
    return { sets: [] }
  }

  const sets = []
  const tiebreaks = []

  const setStrings = scoreString.trim().split(/\s+/)

  setStrings.forEach(setStr => {
    // Check for tiebreak notation like "7-6(5)"
    const tiebreakMatch = setStr.match(/(\d+)-(\d+)\((\d+)\)/)
    if (tiebreakMatch) {
      sets.push({
        player1: parseInt(tiebreakMatch[1]),
        player2: parseInt(tiebreakMatch[2])
      })
      tiebreaks.push(parseInt(tiebreakMatch[3]))
    } else {
      // Normal set like "6-4"
      const scoreMatch = setStr.match(/(\d+)-(\d+)/)
      if (scoreMatch) {
        sets.push({
          player1: parseInt(scoreMatch[1]),
          player2: parseInt(scoreMatch[2])
        })
        tiebreaks.push(null)
      }
    }
  })

  return { sets, tiebreaks }
}

/**
 * Format score_data to display string
 * @param {object} scoreData
 * @returns {string}
 */
export function formatScoreDisplay(scoreData) {
  if (!scoreData || !scoreData.sets || scoreData.sets.length === 0) {
    return '-'
  }

  return scoreData.sets.map((set, idx) => {
    const tiebreak = scoreData.tiebreaks?.[idx]
    if (tiebreak !== null && tiebreak !== undefined) {
      return `${set.player1}-${set.player2}(${tiebreak})`
    }
    return `${set.player1}-${set.player2}`
  }).join(' ')
}

/**
 * Determine winner from score_data
 * @param {object} scoreData
 * @param {string} player1Id
 * @param {string} player2Id
 * @returns {string|null} Winner player ID
 */
export function determineWinnerFromScore(scoreData, player1Id, player2Id) {
  if (!scoreData || !scoreData.sets || scoreData.sets.length === 0) {
    return null
  }

  let player1SetsWon = 0
  let player2SetsWon = 0

  scoreData.sets.forEach(set => {
    if (set.player1 > set.player2) player1SetsWon++
    if (set.player2 > set.player1) player2SetsWon++
  })

  // Best of 3: need 2 sets, Best of 5: need 3 sets
  const setsToWin = scoreData.sets.length <= 3 ? 2 : 3

  if (player1SetsWon >= setsToWin) return player1Id
  if (player2SetsWon >= setsToWin) return player2Id

  return null // Match not finished
}

/**
 * Validate score
 * @param {object} scoreData
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateScore(scoreData) {
  if (!scoreData || !scoreData.sets) {
    return { valid: true, error: null } // Empty score is valid
  }

  const sets = scoreData.sets

  // Check each set
  for (let i = 0; i < sets.length; i++) {
    const set = sets[i]

    // Validate score ranges (0-7 for regular sets, up to 10+ for tiebreaks)
    if (set.player1 < 0 || set.player2 < 0) {
      return { valid: false, error: `Set ${i + 1}: Scores cannot be negative` }
    }

    if (set.player1 > 20 || set.player2 > 20) {
      return { valid: false, error: `Set ${i + 1}: Scores seem invalid (>20)` }
    }

    // Tennis set rules:
    // - Normal: 6-0 to 6-4, or 7-5, or 7-6 (tiebreak)
    // - Tiebreak set: Must be 7-6 or 6-7 with tiebreak score
    const diff = Math.abs(set.player1 - set.player2)

    if (Math.max(set.player1, set.player2) < 6) {
      return { valid: false, error: `Set ${i + 1}: Sets must be won with at least 6 games` }
    }

    if (Math.max(set.player1, set.player2) === 6 && diff < 2) {
      return { valid: false, error: `Set ${i + 1}: Must win by 2 games (unless tiebreak at 6-6)` }
    }
  }

  return { valid: true, error: null }
}

// =====================================================
// CRUD OPERATIONS
// =====================================================

/**
 * Create a new match
 * @param {object} matchData
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function createMatch(matchData) {
  try {
    const { data, error } = await supabase
      .from('tournament_matches')
      .insert({
        tournament_id: matchData.tournament_id,
        round_number: matchData.round_number,
        match_number: matchData.match_number,
        bracket_type: matchData.bracket_type || 'main',
        player1_id: matchData.player1_id || null,
        player2_id: matchData.player2_id || null,
        score_data: matchData.score_data || { sets: [] },
        status: matchData.status || 'pending',
        court: matchData.court || null,
        scheduled_at: matchData.scheduled_at || null,
        feeds_to_match_id: matchData.feeds_to_match_id || null,
        feeds_to_loser_match_id: matchData.feeds_to_loser_match_id || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating match:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Exception in createMatch:', err)
    return { data: null, error: err }
  }
}

/**
 * Get matches for a tournament
 * @param {string} tournamentId
 * @param {number|null} roundNumber - Optional filter by round
 * @returns {Promise<{data: Array|null, error: object|null}>}
 */
export async function getMatches(tournamentId, roundNumber = null) {
  try {
    let query = supabase
      .from('tournament_matches')
      .select(`
        *,
        player1:tournament_players!tournament_matches_player1_id_fkey(id, name, seed),
        player2:tournament_players!tournament_matches_player2_id_fkey(id, name, seed),
        winner:tournament_players!tournament_matches_winner_id_fkey(id, name)
      `)
      .eq('tournament_id', tournamentId)
      .order('round_number', { ascending: true })
      .order('match_number', { ascending: true })

    if (roundNumber !== null) {
      query = query.eq('round_number', roundNumber)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching matches:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Exception in getMatches:', err)
    return { data: null, error: err }
  }
}

/**
 * Get a single match by ID
 * @param {string} matchId
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function getMatchById(matchId) {
  try {
    const { data, error } = await supabase
      .from('tournament_matches')
      .select(`
        *,
        player1:tournament_players!tournament_matches_player1_id_fkey(id, name, seed),
        player2:tournament_players!tournament_matches_player2_id_fkey(id, name, seed),
        winner:tournament_players!tournament_matches_winner_id_fkey(id, name)
      `)
      .eq('id', matchId)
      .single()

    if (error) {
      console.error('Error fetching match:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Exception in getMatchById:', err)
    return { data: null, error: err }
  }
}

/**
 * Update match result with score
 * Handles:
 * - Score validation
 * - Winner determination
 * - Bracket advancement (feeding winner to next match)
 * - Loser bracket feeding (double elimination)
 *
 * @param {string} matchId
 * @param {string} winnerId - Player ID of winner
 * @param {string|object} score - Score string or score_data object
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function updateMatchResult(matchId, winnerId, score = null) {
  try {
    // Get match details first
    const { data: match, error: fetchError } = await getMatchById(matchId)
    if (fetchError || !match) {
      return { data: null, error: fetchError || new Error('Match not found') }
    }

    // Parse score if string
    let scoreData = null
    if (score) {
      if (typeof score === 'string') {
        scoreData = parseScoreString(score)
      } else {
        scoreData = score
      }

      // Validate score
      const validation = validateScore(scoreData)
      if (!validation.valid) {
        return { data: null, error: new Error(validation.error) }
      }

      // Verify winner matches score
      const scoredWinner = determineWinnerFromScore(scoreData, match.player1_id, match.player2_id)
      if (scoredWinner && scoredWinner !== winnerId) {
        return { data: null, error: new Error('Winner does not match score') }
      }
    }

    // Determine loser for double elimination
    const loserId = winnerId === match.player1_id ? match.player2_id : match.player1_id

    // Update match
    const { data: updatedMatch, error: updateError } = await supabase
      .from('tournament_matches')
      .update({
        winner_id: winnerId,
        score_data: scoreData || match.score_data,
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', matchId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating match:', updateError)
      return { data: null, error: updateError }
    }

    // Advance winner to next match
    if (match.feeds_to_match_id) {
      await advancePlayerToMatch(winnerId, match.feeds_to_match_id, match)
    }

    // Advance loser to loser bracket (double elimination)
    if (match.feeds_to_loser_match_id && loserId) {
      await advancePlayerToMatch(loserId, match.feeds_to_loser_match_id, match, true)
    }

    return { data: updatedMatch, error: null }
  } catch (err) {
    console.error('Exception in updateMatchResult:', err)
    return { data: null, error: err }
  }
}

/**
 * Advance player to next match
 * @param {string} playerId
 * @param {string} nextMatchId
 * @param {object} currentMatch - Current match data for context
 * @param {boolean} isLoser - True if advancing to loser bracket
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
async function advancePlayerToMatch(playerId, nextMatchId, currentMatch, isLoser = false) {
  try {
    // Get next match
    const { data: nextMatch, error: fetchError } = await getMatchById(nextMatchId)
    if (fetchError || !nextMatch) {
      console.error('Next match not found:', nextMatchId)
      return { data: null, error: fetchError }
    }

    // Determine which slot to fill (player1 or player2)
    // Simple rule: if player1 is empty, fill player1, else fill player2
    const updateData = {}
    if (!nextMatch.player1_id) {
      updateData.player1_id = playerId
    } else if (!nextMatch.player2_id) {
      updateData.player2_id = playerId
    } else {
      console.warn('Next match already has both players:', nextMatchId)
      return { data: null, error: null } // Not an error, just no-op
    }

    // Update next match
    const { data, error } = await supabase
      .from('tournament_matches')
      .update(updateData)
      .eq('id', nextMatchId)
      .select()
      .single()

    if (error) {
      console.error('Error advancing player:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Exception in advancePlayerToMatch:', err)
    return { data: null, error: err }
  }
}

/**
 * Undo a match result
 * WARNING: This will revert the bracket state
 * @param {string} matchId
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function undoMatchResult(matchId) {
  try {
    // Get match details
    const { data: match, error: fetchError } = await getMatchById(matchId)
    if (fetchError || !match) {
      return { data: null, error: fetchError || new Error('Match not found') }
    }

    if (match.status !== 'completed') {
      return { data: null, error: new Error('Match is not completed') }
    }

    // Remove winner from next match (if exists)
    if (match.feeds_to_match_id && match.winner_id) {
      await removePlayerFromMatch(match.winner_id, match.feeds_to_match_id)
    }

    // Remove loser from loser bracket match (if exists)
    if (match.feeds_to_loser_match_id) {
      const loserId = match.winner_id === match.player1_id ? match.player2_id : match.player1_id
      if (loserId) {
        await removePlayerFromMatch(loserId, match.feeds_to_loser_match_id)
      }
    }

    // Reset match
    const { data, error } = await supabase
      .from('tournament_matches')
      .update({
        winner_id: null,
        score_data: { sets: [] },
        status: 'pending',
        completed_at: null
      })
      .eq('id', matchId)
      .select()
      .single()

    if (error) {
      console.error('Error undoing match:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Exception in undoMatchResult:', err)
    return { data: null, error: err }
  }
}

/**
 * Remove a player from a match
 * @param {string} playerId
 * @param {string} matchId
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
async function removePlayerFromMatch(playerId, matchId) {
  try {
    const { data: match, error: fetchError } = await getMatchById(matchId)
    if (fetchError || !match) return { data: null, error: fetchError }

    const updateData = {}
    if (match.player1_id === playerId) {
      updateData.player1_id = null
    } else if (match.player2_id === playerId) {
      updateData.player2_id = null
    }

    if (Object.keys(updateData).length === 0) {
      return { data: null, error: null } // Player not in this match
    }

    const { data, error } = await supabase
      .from('tournament_matches')
      .update(updateData)
      .eq('id', matchId)
      .select()
      .single()

    return { data, error }
  } catch (err) {
    return { data: null, error: err }
  }
}

/**
 * Update match scheduling (court assignment, time)
 * @param {string} matchId
 * @param {object} scheduleData - {court, scheduled_at}
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function updateMatchSchedule(matchId, scheduleData) {
  try {
    const { data, error } = await supabase
      .from('tournament_matches')
      .update({
        court: scheduleData.court || null,
        scheduled_at: scheduleData.scheduled_at || null
      })
      .eq('id', matchId)
      .select()
      .single()

    if (error) {
      console.error('Error updating match schedule:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Exception in updateMatchSchedule:', err)
    return { data: null, error: err }
  }
}

/**
 * Update match notes
 * @param {string} matchId
 * @param {string} notes
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function updateMatchNotes(matchId, notes) {
  try {
    const { data, error } = await supabase
      .from('tournament_matches')
      .update({ notes })
      .eq('id', matchId)
      .select()
      .single()

    if (error) {
      console.error('Error updating match notes:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Exception in updateMatchNotes:', err)
    return { data: null, error: err }
  }
}

/**
 * Delete a match (admin only, use with caution)
 * @param {string} matchId
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function deleteMatch(matchId) {
  try {
    const { data, error } = await supabase
      .from('tournament_matches')
      .delete()
      .eq('id', matchId)
      .select()
      .single()

    if (error) {
      console.error('Error deleting match:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Exception in deleteMatch:', err)
    return { data: null, error: err }
  }
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  // CRUD
  createMatch,
  getMatches,
  getMatchById,
  updateMatchResult,
  undoMatchResult,
  updateMatchSchedule,
  updateMatchNotes,
  deleteMatch,

  // Score utilities
  parseScoreString,
  formatScoreDisplay,
  determineWinnerFromScore,
  validateScore
}

/**
 * Pairing Service
 *
 * Handles dynamic pairing for Swiss system tournaments
 * Features:
 * - Swiss pairing algorithm (score groups)
 * - Avoid repeat pairings
 * - Color balance (player1/player2 alternation)
 * - Bye handling for odd players
 * - Buchholz tiebreaker calculation
 *
 * @module pairingService
 */

import { supabase } from '../../lib/supabase'
import { createMatch } from './matchService'

// =====================================================
// SWISS PAIRING ALGORITHM
// =====================================================

/**
 * Generate Swiss pairings for next round
 * Algorithm:
 * 1. Group players by score
 * 2. Within each group, pair highest vs lowest (to balance)
 * 3. Avoid repeat pairings
 * 4. Balance colors (player1/player2 assignment)
 * 5. Handle odd players with bye
 *
 * @param {string} tournamentId
 * @param {number} roundNumber
 * @returns {Promise<{data: Array|null, error: object|null}>}
 */
export async function generateSwissPairings(tournamentId, roundNumber) {
  try {
    // Get all players with their records
    const { data: players, error: playersError } = await supabase
      .from('tournament_players')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('points', { ascending: false })
      .order('buchholz_score', { ascending: false })

    if (playersError) {
      console.error('Error fetching players:', playersError)
      return { data: null, error: playersError }
    }

    // Get all previous matches to avoid repeats and track colors
    const { data: previousMatches, error: matchesError } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .lt('round_number', roundNumber)

    if (matchesError) {
      console.error('Error fetching previous matches:', matchesError)
      return { data: null, error: matchesError }
    }

    // Build opponent history and color balance
    const opponentHistory = buildOpponentHistory(players, previousMatches)
    const colorBalance = buildColorBalance(players, previousMatches)

    // Group players by score
    const scoreGroups = groupPlayersByScore(players)

    // Generate pairings
    const pairings = []
    const paired = new Set()
    let byePlayer = null

    for (const group of scoreGroups) {
      const availablePlayers = group.filter(p => !paired.has(p.id))

      while (availablePlayers.length >= 2) {
        // Try to pair first player with best available opponent
        const player1 = availablePlayers.shift()
        let player2 = null

        // Find best pairing (avoiding repeats, balancing colors)
        for (let i = 0; i < availablePlayers.length; i++) {
          const candidate = availablePlayers[i]

          // Check if they've played before
          if (opponentHistory[player1.id]?.includes(candidate.id)) {
            continue // Skip, they've played before
          }

          // Found valid opponent
          player2 = availablePlayers.splice(i, 1)[0]
          break
        }

        // If no valid opponent found, take first available (force pairing)
        if (!player2 && availablePlayers.length > 0) {
          player2 = availablePlayers.shift()
        }

        if (player2) {
          // Determine color assignment (balance)
          let p1, p2
          if (colorBalance[player1.id] < colorBalance[player2.id]) {
            p1 = player1
            p2 = player2
          } else if (colorBalance[player2.id] < colorBalance[player1.id]) {
            p1 = player2
            p2 = player1
          } else {
            // Equal balance, use score/seed
            p1 = player1.points >= player2.points ? player1 : player2
            p2 = player1.points >= player2.points ? player2 : player1
          }

          pairings.push({
            player1_id: p1.id,
            player1_name: p1.name,
            player2_id: p2.id,
            player2_name: p2.name
          })

          paired.add(p1.id)
          paired.add(p2.id)
        }
      }

      // If one player left unpaired, they might get bye
      if (availablePlayers.length === 1 && !byePlayer) {
        byePlayer = availablePlayers[0]
      }
    }

    // Handle bye (lowest-ranked unpaired player)
    if (byePlayer) {
      pairings.push({
        player1_id: byePlayer.id,
        player1_name: byePlayer.name,
        player2_id: null,
        player2_name: 'BYE',
        winner_id: byePlayer.id,
        winner_name: byePlayer.name,
        status: 'completed'
      })
    }

    return { data: pairings, error: null }
  } catch (err) {
    console.error('Exception in generateSwissPairings:', err)
    return { data: null, error: err }
  }
}

/**
 * Build opponent history map
 * @param {Array} players
 * @param {Array} matches
 * @returns {object} Map of player_id -> [opponent_ids]
 */
function buildOpponentHistory(players, matches) {
  const history = {}

  players.forEach(p => {
    history[p.id] = []
  })

  matches.forEach(match => {
    if (match.player1_id && match.player2_id) {
      history[match.player1_id].push(match.player2_id)
      history[match.player2_id].push(match.player1_id)
    }
  })

  return history
}

/**
 * Build color balance map
 * @param {Array} players
 * @param {Array} matches
 * @returns {object} Map of player_id -> balance (+1 for player1, -1 for player2)
 */
function buildColorBalance(players, matches) {
  const balance = {}

  players.forEach(p => {
    balance[p.id] = 0
  })

  matches.forEach(match => {
    if (match.player1_id) {
      balance[match.player1_id] = (balance[match.player1_id] || 0) + 1
    }
    if (match.player2_id) {
      balance[match.player2_id] = (balance[match.player2_id] || 0) - 1
    }
  })

  return balance
}

/**
 * Group players by score
 * @param {Array} players
 * @returns {Array<Array>} Array of score groups
 */
function groupPlayersByScore(players) {
  const groups = {}

  players.forEach(player => {
    const score = player.points || 0
    if (!groups[score]) {
      groups[score] = []
    }
    groups[score].push(player)
  })

  // Return groups sorted by score (descending)
  return Object.keys(groups)
    .map(Number)
    .sort((a, b) => b - a)
    .map(score => groups[score])
}

/**
 * Create Swiss round matches from pairings
 * @param {string} tournamentId
 * @param {number} roundNumber
 * @param {Array} pairings
 * @returns {Promise<{data: Array|null, error: object|null}>}
 */
export async function createSwissRound(tournamentId, roundNumber, pairings) {
  try {
    const createdMatches = []

    for (let i = 0; i < pairings.length; i++) {
      const pairing = pairings[i]

      const { data: match, error } = await createMatch({
        tournament_id: tournamentId,
        round_number: roundNumber,
        match_number: i + 1,
        bracket_type: 'main',
        player1_id: pairing.player1_id,
        player2_id: pairing.player2_id,
        winner_id: pairing.winner_id || null,
        status: pairing.status || 'pending'
      })

      if (error) {
        console.error('Error creating Swiss match:', error)
        return { data: null, error }
      }

      createdMatches.push(match)
    }

    // Update round status
    await supabase
      .from('tournament_rounds')
      .update({ status: 'in_progress' })
      .eq('tournament_id', tournamentId)
      .eq('round_number', roundNumber)

    return { data: createdMatches, error: null }
  } catch (err) {
    console.error('Exception in createSwissRound:', err)
    return { data: null, error: err }
  }
}

// =====================================================
// BUCHHOLZ TIEBREAKER CALCULATION
// =====================================================

/**
 * Calculate Buchholz scores for all players
 * Buchholz = Sum of opponents' scores
 * Used as tiebreaker in Swiss system
 *
 * @param {string} tournamentId
 * @returns {Promise<{data: boolean, error: object|null}>}
 */
export async function calculateBuchholzScores(tournamentId) {
  try {
    // Get all players
    const { data: players, error: playersError } = await supabase
      .from('tournament_players')
      .select('*')
      .eq('tournament_id', tournamentId)

    if (playersError) {
      console.error('Error fetching players:', playersError)
      return { data: false, error: playersError }
    }

    // Get all completed matches
    const { data: matches, error: matchesError } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('status', 'completed')

    if (matchesError) {
      console.error('Error fetching matches:', matchesError)
      return { data: false, error: matchesError }
    }

    // Build opponent history
    const opponentHistory = buildOpponentHistory(players, matches)

    // Calculate Buchholz for each player
    for (const player of players) {
      const opponents = opponentHistory[player.id] || []

      // Sum of opponents' points
      const buchholz = opponents.reduce((sum, opponentId) => {
        const opponent = players.find(p => p.id === opponentId)
        return sum + (opponent?.points || 0)
      }, 0)

      // Update player's Buchholz score
      await supabase
        .from('tournament_players')
        .update({ buchholz_score: buchholz })
        .eq('id', player.id)
    }

    return { data: true, error: null }
  } catch (err) {
    console.error('Exception in calculateBuchholzScores:', err)
    return { data: false, error: err }
  }
}

// =====================================================
// ROUND ROBIN UTILITIES
// =====================================================

/**
 * Check if round-robin tournament is complete
 * @param {string} tournamentId
 * @returns {Promise<{data: boolean, error: object|null}>}
 */
export async function isRoundRobinComplete(tournamentId) {
  try {
    const { data: matches, error } = await supabase
      .from('tournament_matches')
      .select('status')
      .eq('tournament_id', tournamentId)

    if (error) {
      console.error('Error checking round-robin completion:', error)
      return { data: false, error }
    }

    const allComplete = matches.every(m => m.status === 'completed')
    return { data: allComplete, error: null }
  } catch (err) {
    console.error('Exception in isRoundRobinComplete:', err)
    return { data: false, error: err }
  }
}

/**
 * Calculate round-robin standings
 * @param {string} tournamentId
 * @returns {Promise<{data: Array|null, error: object|null}>}
 */
export async function calculateRoundRobinStandings(tournamentId) {
  try {
    // Get all players with their stats
    const { data: players, error: playersError } = await supabase
      .from('tournament_players')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('points', { ascending: false })
      .order('matches_won', { ascending: false })
      .order('name', { ascending: true })

    if (playersError) {
      console.error('Error fetching players:', playersError)
      return { data: null, error: playersError }
    }

    // Add rank
    const standings = players.map((player, index) => ({
      ...player,
      rank: index + 1
    }))

    return { data: standings, error: null }
  } catch (err) {
    console.error('Exception in calculateRoundRobinStandings:', err)
    return { data: null, error: err }
  }
}

// =====================================================
// ROUND MANAGEMENT
// =====================================================

/**
 * Check if current round is complete
 * @param {string} tournamentId
 * @param {number} roundNumber
 * @returns {Promise<{data: boolean, error: object|null}>}
 */
export async function isRoundComplete(tournamentId, roundNumber) {
  try {
    const { data: matches, error } = await supabase
      .from('tournament_matches')
      .select('status')
      .eq('tournament_id', tournamentId)
      .eq('round_number', roundNumber)

    if (error) {
      console.error('Error checking round completion:', error)
      return { data: false, error }
    }

    const allComplete = matches.every(m => m.status === 'completed')
    return { data: allComplete, error: null }
  } catch (err) {
    console.error('Exception in isRoundComplete:', err)
    return { data: false, error: err }
  }
}

/**
 * Advance to next round (updates tournament.current_round)
 * @param {string} tournamentId
 * @returns {Promise<{data: boolean, error: object|null}>}
 */
export async function advanceToNextRound(tournamentId) {
  try {
    // Get tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('current_round, total_rounds')
      .eq('id', tournamentId)
      .single()

    if (tournamentError) {
      console.error('Error fetching tournament:', tournamentError)
      return { data: false, error: tournamentError }
    }

    if (tournament.current_round >= tournament.total_rounds) {
      return { data: false, error: new Error('Tournament already at final round') }
    }

    // Update current round
    await supabase
      .from('tournaments')
      .update({ current_round: tournament.current_round + 1 })
      .eq('id', tournamentId)

    // Mark previous round as completed
    await supabase
      .from('tournament_rounds')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('tournament_id', tournamentId)
      .eq('round_number', tournament.current_round)

    return { data: true, error: null }
  } catch (err) {
    console.error('Exception in advanceToNextRound:', err)
    return { data: false, error: err }
  }
}

/**
 * Generate and create next Swiss round
 * @param {string} tournamentId
 * @returns {Promise<{data: Array|null, error: object|null}>}
 */
export async function generateNextSwissRound(tournamentId) {
  try {
    // Get tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('current_round, total_rounds')
      .eq('id', tournamentId)
      .single()

    if (tournamentError) {
      return { data: null, error: tournamentError }
    }

    // Check if current round is complete
    const { data: isComplete, error: completeError } = await isRoundComplete(
      tournamentId,
      tournament.current_round
    )

    if (completeError) {
      return { data: null, error: completeError }
    }

    if (!isComplete) {
      return { data: null, error: new Error('Current round not complete') }
    }

    // Calculate Buchholz scores before pairing
    await calculateBuchholzScores(tournamentId)

    // Advance to next round
    const nextRound = tournament.current_round + 1

    if (nextRound > tournament.total_rounds) {
      return { data: null, error: new Error('Tournament complete') }
    }

    await advanceToNextRound(tournamentId)

    // Generate pairings
    const { data: pairings, error: pairingsError } = await generateSwissPairings(
      tournamentId,
      nextRound
    )

    if (pairingsError) {
      return { data: null, error: pairingsError }
    }

    // Create matches
    const { data: matches, error: matchesError } = await createSwissRound(
      tournamentId,
      nextRound,
      pairings
    )

    if (matchesError) {
      return { data: null, error: matchesError }
    }

    return { data: matches, error: null }
  } catch (err) {
    console.error('Exception in generateNextSwissRound:', err)
    return { data: null, error: err }
  }
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  // Swiss pairing
  generateSwissPairings,
  createSwissRound,
  generateNextSwissRound,

  // Tiebreakers
  calculateBuchholzScores,

  // Round-robin
  isRoundRobinComplete,
  calculateRoundRobinStandings,

  // Round management
  isRoundComplete,
  advanceToNextRound
}

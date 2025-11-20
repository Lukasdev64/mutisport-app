/**
 * Player Service
 *
 * Handles player management and seeding
 * @module playerService
 */

import { supabase } from '../../lib/supabase'

/**
 * Create players for a tournament
 * @param {string} tournamentId
 * @param {Array<{name: string, seed: number|null, email: string|null}>} players
 * @returns {Promise<{data: Array|null, error: object|null}>}
 */
export async function createPlayers(tournamentId, players) {
  try {
    const playersData = players.map(p => ({
      tournament_id: tournamentId,
      name: p.name,
      seed: p.seed || null,
      email: p.email || null,
      phone: p.phone || null
    }))

    const { data, error } = await supabase
      .from('tournament_players')
      .insert(playersData)
      .select()

    if (error) {
      console.error('Error creating players:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Exception in createPlayers:', err)
    return { data: null, error: err }
  }
}

/**
 * Get players for a tournament
 * @param {string} tournamentId
 * @returns {Promise<{data: Array|null, error: object|null}>}
 */
export async function getPlayers(tournamentId) {
  try {
    const { data, error } = await supabase
      .from('tournament_players')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('seed', { ascending: true, nullsLast: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching players:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Exception in getPlayers:', err)
    return { data: null, error: err }
  }
}

/**
 * Update player seeding
 * @param {string} playerId
 * @param {number} seed
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function updatePlayerSeed(playerId, seed) {
  try {
    const { data, error } = await supabase
      .from('tournament_players')
      .update({ seed })
      .eq('id', playerId)
      .select()
      .single()

    if (error) {
      console.error('Error updating player seed:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Exception in updatePlayerSeed:', err)
    return { data: null, error: err }
  }
}

/**
 * Bulk update player seeding (for drag-and-drop reordering)
 * @param {Array<{id: string, seed: number}>} seedUpdates
 * @returns {Promise<{data: boolean, error: object|null}>}
 */
export async function bulkUpdateSeeds(seedUpdates) {
  try {
    // Update each player's seed
    const updates = seedUpdates.map(update =>
      supabase
        .from('tournament_players')
        .update({ seed: update.seed })
        .eq('id', update.id)
    )

    await Promise.all(updates)

    return { data: true, error: null }
  } catch (err) {
    console.error('Exception in bulkUpdateSeeds:', err)
    return { data: null, error: err }
  }
}

/**
 * Get player standings (for round-robin and swiss)
 * @param {string} tournamentId
 * @returns {Promise<{data: Array|null, error: object|null}>}
 */
export async function getPlayerStandings(tournamentId) {
  try {
    const { data, error } = await supabase
      .from('tournament_players')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('points', { ascending: false })
      .order('buchholz_score', { ascending: false })
      .order('matches_won', { ascending: false })

    if (error) {
      console.error('Error fetching standings:', error)
      return { data: null, error }
    }

    return { data, error: null }
  } catch (err) {
    console.error('Exception in getPlayerStandings:', err)
    return { data: null, error: err }
  }
}

export default {
  createPlayers,
  getPlayers,
  updatePlayerSeed,
  bulkUpdateSeeds,
  getPlayerStandings
}

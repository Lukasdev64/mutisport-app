/**
 * Realtime Service
 * Handles Supabase Realtime subscriptions for live tournament updates
 *
 * Features:
 * - Match updates subscription
 * - Tournament updates subscription
 * - Player stats updates subscription
 * - Automatic reconnection
 * - Error handling
 */

import { supabase } from '../../lib/supabase'

/**
 * Subscribe to tournament matches updates
 * @param {string} tournamentId
 * @param {object} callbacks - { onMatchUpdate, onMatchInsert, onMatchDelete }
 * @returns {Function} Unsubscribe function
 */
export function subscribeToMatches(tournamentId, callbacks = {}) {
  const {
    onMatchUpdate = () => {},
    onMatchInsert = () => {},
    onMatchDelete = () => {}
  } = callbacks

  const channel = supabase
    .channel(`tournament:${tournamentId}:matches`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'tournament_matches',
        filter: `tournament_id=eq.${tournamentId}`
      },
      (payload) => {
        console.log('[Realtime] Match updated:', payload.new)
        onMatchUpdate(payload.new, payload.old)
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'tournament_matches',
        filter: `tournament_id=eq.${tournamentId}`
      },
      (payload) => {
        console.log('[Realtime] Match inserted:', payload.new)
        onMatchInsert(payload.new)
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'tournament_matches',
        filter: `tournament_id=eq.${tournamentId}`
      },
      (payload) => {
        console.log('[Realtime] Match deleted:', payload.old)
        onMatchDelete(payload.old)
      }
    )
    .subscribe((status) => {
      console.log('[Realtime] Matches subscription status:', status)
    })

  // Return unsubscribe function
  return () => {
    console.log('[Realtime] Unsubscribing from matches')
    supabase.removeChannel(channel)
  }
}

/**
 * Subscribe to tournament metadata updates
 * @param {string} tournamentId
 * @param {Function} onUpdate - Callback when tournament updates
 * @returns {Function} Unsubscribe function
 */
export function subscribeToTournament(tournamentId, onUpdate = () => {}) {
  const channel = supabase
    .channel(`tournament:${tournamentId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'tournaments',
        filter: `id=eq.${tournamentId}`
      },
      (payload) => {
        console.log('[Realtime] Tournament updated:', payload.new)
        onUpdate(payload.new, payload.old)
      }
    )
    .subscribe((status) => {
      console.log('[Realtime] Tournament subscription status:', status)
    })

  return () => {
    console.log('[Realtime] Unsubscribing from tournament')
    supabase.removeChannel(channel)
  }
}

/**
 * Subscribe to player stats updates
 * @param {string} tournamentId
 * @param {Function} onUpdate - Callback when player stats update
 * @returns {Function} Unsubscribe function
 */
export function subscribeToPlayers(tournamentId, onUpdate = () => {}) {
  const channel = supabase
    .channel(`tournament:${tournamentId}:players`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'tournament_players',
        filter: `tournament_id=eq.${tournamentId}`
      },
      (payload) => {
        console.log('[Realtime] Player updated:', payload.new)
        onUpdate(payload.new, payload.old)
      }
    )
    .subscribe((status) => {
      console.log('[Realtime] Players subscription status:', status)
    })

  return () => {
    console.log('[Realtime] Unsubscribing from players')
    supabase.removeChannel(channel)
  }
}

/**
 * Subscribe to all tournament data (matches + tournament + players)
 * @param {string} tournamentId
 * @param {object} callbacks - { onMatchUpdate, onTournamentUpdate, onPlayerUpdate }
 * @returns {Function} Unsubscribe function
 */
export function subscribeToTournamentData(tournamentId, callbacks = {}) {
  const {
    onMatchUpdate = () => {},
    onMatchInsert = () => {},
    onMatchDelete = () => {},
    onTournamentUpdate = () => {},
    onPlayerUpdate = () => {}
  } = callbacks

  // Subscribe to all relevant changes
  const unsubscribeMatches = subscribeToMatches(tournamentId, {
    onMatchUpdate,
    onMatchInsert,
    onMatchDelete
  })

  const unsubscribeTournament = subscribeToTournament(tournamentId, onTournamentUpdate)

  const unsubscribePlayers = subscribeToPlayers(tournamentId, onPlayerUpdate)

  // Return combined unsubscribe function
  return () => {
    unsubscribeMatches()
    unsubscribeTournament()
    unsubscribePlayers()
  }
}

/**
 * Subscribe to presence (who's viewing the tournament)
 * @param {string} tournamentId
 * @param {string} userId - Current user ID
 * @param {object} callbacks - { onJoin, onLeave, onSync }
 * @returns {Function} Unsubscribe function
 */
export function subscribeToPresence(tournamentId, userId, callbacks = {}) {
  const {
    onJoin = () => {},
    onLeave = () => {},
    onSync = () => {}
  } = callbacks

  const channel = supabase.channel(`tournament:${tournamentId}:presence`, {
    config: {
      presence: {
        key: userId
      }
    }
  })

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      console.log('[Realtime] Presence sync:', state)
      onSync(state)
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('[Realtime] User joined:', key, newPresences)
      onJoin(key, newPresences)
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('[Realtime] User left:', key, leftPresences)
      onLeave(key, leftPresences)
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: userId,
          online_at: new Date().toISOString()
        })
      }
    })

  return () => {
    console.log('[Realtime] Unsubscribing from presence')
    supabase.removeChannel(channel)
  }
}

/**
 * Get current connection status
 * @returns {string} 'SUBSCRIBED' | 'CLOSED' | 'CHANNEL_ERROR' | 'TIMED_OUT'
 */
export function getConnectionStatus() {
  // Supabase realtime connection status can be checked via channels
  return 'UNKNOWN' // Placeholder - implement if needed
}

export default {
  subscribeToMatches,
  subscribeToTournament,
  subscribeToPlayers,
  subscribeToTournamentData,
  subscribeToPresence,
  getConnectionStatus
}

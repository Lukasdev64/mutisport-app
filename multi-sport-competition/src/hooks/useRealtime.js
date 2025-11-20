/**
 * Realtime Hooks
 * React hooks for Supabase Realtime integration with React Query
 */

import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import realtimeService from '../services/tournament/realtimeService'

/**
 * Subscribe to match updates with automatic React Query invalidation
 * @param {string} tournamentId
 * @param {object} options - { enabled, onUpdate }
 */
export function useRealtimeMatches(tournamentId, options = {}) {
  const { enabled = true, onUpdate } = options
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled || !tournamentId) return

    const unsubscribe = realtimeService.subscribeToMatches(tournamentId, {
      onMatchUpdate: (newMatch, oldMatch) => {
        console.log('[useRealtimeMatches] Match updated', newMatch)

        // Invalidate matches queries
        queryClient.invalidateQueries(['matches', tournamentId])
        queryClient.invalidateQueries(['match', newMatch.id])

        // Also invalidate players (stats may have changed)
        queryClient.invalidateQueries(['players', tournamentId])

        // Call custom callback
        if (onUpdate) {
          onUpdate(newMatch, oldMatch)
        }
      },

      onMatchInsert: (newMatch) => {
        console.log('[useRealtimeMatches] Match inserted', newMatch)
        queryClient.invalidateQueries(['matches', tournamentId])

        if (onUpdate) {
          onUpdate(newMatch, null)
        }
      },

      onMatchDelete: (oldMatch) => {
        console.log('[useRealtimeMatches] Match deleted', oldMatch)
        queryClient.invalidateQueries(['matches', tournamentId])

        if (onUpdate) {
          onUpdate(null, oldMatch)
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [tournamentId, enabled, queryClient, onUpdate])
}

/**
 * Subscribe to tournament metadata updates
 * @param {string} tournamentId
 * @param {object} options - { enabled, onUpdate }
 */
export function useRealtimeTournament(tournamentId, options = {}) {
  const { enabled = true, onUpdate } = options
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled || !tournamentId) return

    const unsubscribe = realtimeService.subscribeToTournament(tournamentId, (newData, oldData) => {
      console.log('[useRealtimeTournament] Tournament updated', newData)

      // Invalidate tournament queries
      queryClient.invalidateQueries(['tournament', 'id', tournamentId])
      queryClient.invalidateQueries(['tournament', newData.unique_url_code])

      if (onUpdate) {
        onUpdate(newData, oldData)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [tournamentId, enabled, queryClient, onUpdate])
}

/**
 * Subscribe to player stats updates
 * @param {string} tournamentId
 * @param {object} options - { enabled, onUpdate }
 */
export function useRealtimePlayers(tournamentId, options = {}) {
  const { enabled = true, onUpdate } = options
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled || !tournamentId) return

    const unsubscribe = realtimeService.subscribeToPlayers(tournamentId, (newData, oldData) => {
      console.log('[useRealtimePlayers] Player updated', newData)

      // Invalidate player queries
      queryClient.invalidateQueries(['players', tournamentId])
      queryClient.invalidateQueries(['players', tournamentId, 'standings'])

      if (onUpdate) {
        onUpdate(newData, oldData)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [tournamentId, enabled, queryClient, onUpdate])
}

/**
 * Subscribe to all tournament data (matches + tournament + players)
 * Convenience hook that combines all subscriptions
 * @param {string} tournamentId
 * @param {object} options - { enabled, onMatchUpdate, onTournamentUpdate, onPlayerUpdate }
 */
export function useRealtimeTournamentData(tournamentId, options = {}) {
  const {
    enabled = true,
    onMatchUpdate,
    onTournamentUpdate,
    onPlayerUpdate
  } = options

  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled || !tournamentId) return

    const unsubscribe = realtimeService.subscribeToTournamentData(tournamentId, {
      onMatchUpdate: (newMatch, oldMatch) => {
        queryClient.invalidateQueries(['matches', tournamentId])
        queryClient.invalidateQueries(['match', newMatch.id])
        queryClient.invalidateQueries(['players', tournamentId])

        if (onMatchUpdate) {
          onMatchUpdate(newMatch, oldMatch)
        }
      },

      onMatchInsert: (newMatch) => {
        queryClient.invalidateQueries(['matches', tournamentId])

        if (onMatchUpdate) {
          onMatchUpdate(newMatch, null)
        }
      },

      onMatchDelete: (oldMatch) => {
        queryClient.invalidateQueries(['matches', tournamentId])

        if (onMatchUpdate) {
          onMatchUpdate(null, oldMatch)
        }
      },

      onTournamentUpdate: (newData, oldData) => {
        queryClient.invalidateQueries(['tournament', 'id', tournamentId])

        if (onTournamentUpdate) {
          onTournamentUpdate(newData, oldData)
        }
      },

      onPlayerUpdate: (newData, oldData) => {
        queryClient.invalidateQueries(['players', tournamentId])

        if (onPlayerUpdate) {
          onPlayerUpdate(newData, oldData)
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [tournamentId, enabled, queryClient, onMatchUpdate, onTournamentUpdate, onPlayerUpdate])
}

/**
 * Subscribe to presence (who's viewing the tournament)
 * @param {string} tournamentId
 * @param {string} userId
 * @param {object} options - { enabled, onJoin, onLeave, onSync }
 * @returns {object} { viewers: number, presenceState: object }
 */
export function useRealtimePresence(tournamentId, userId, options = {}) {
  const { enabled = true, onJoin, onLeave, onSync } = options

  useEffect(() => {
    if (!enabled || !tournamentId || !userId) return

    const unsubscribe = realtimeService.subscribeToPresence(tournamentId, userId, {
      onJoin,
      onLeave,
      onSync
    })

    return () => {
      unsubscribe()
    }
  }, [tournamentId, userId, enabled, onJoin, onLeave, onSync])
}

export default {
  useRealtimeMatches,
  useRealtimeTournament,
  useRealtimePlayers,
  useRealtimeTournamentData,
  useRealtimePresence
}

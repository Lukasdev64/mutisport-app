/**
 * Matches Hooks
 * React Query hooks for match data management with optimistic updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import matchService from '../services/tournament/matchService'

/**
 * Fetch matches for a tournament
 * @param {string} tournamentId
 * @param {number|null} roundNumber - Optional filter by round
 * @param {object} options
 */
export function useMatches(tournamentId, roundNumber = null, options = {}) {
  return useQuery({
    queryKey: roundNumber
      ? ['matches', tournamentId, 'round', roundNumber]
      : ['matches', tournamentId],
    queryFn: async () => {
      const { data, error } = await matchService.getMatches(tournamentId, roundNumber)
      if (error) throw error
      return data
    },
    enabled: !!tournamentId,
    staleTime: 60 * 1000, // 1 minute
    ...options
  })
}

/**
 * Fetch single match by ID
 * @param {string} matchId
 * @param {object} options
 */
export function useMatch(matchId, options = {}) {
  return useQuery({
    queryKey: ['match', matchId],
    queryFn: async () => {
      const { data, error } = await matchService.getMatchById(matchId)
      if (error) throw error
      return data
    },
    enabled: !!matchId,
    ...options
  })
}

/**
 * Update match result mutation with optimistic updates
 */
export function useUpdateMatchResult() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ matchId, winnerId, score }) => {
      const { data, error } = await matchService.updateMatchResult(matchId, winnerId, score)
      if (error) throw error
      return data
    },
    onMutate: async ({ matchId, winnerId, score }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries(['matches'])
      await queryClient.cancelQueries(['match', matchId])

      // Snapshot previous values
      const previousMatch = queryClient.getQueryData(['match', matchId])
      const tournamentId = previousMatch?.tournament_id

      // Optimistically update match
      if (previousMatch) {
        queryClient.setQueryData(['match', matchId], {
          ...previousMatch,
          winner_id: winnerId,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
      }

      // Optimistically update matches list
      if (tournamentId) {
        queryClient.setQueryData(['matches', tournamentId], (old) => {
          if (!old) return old
          return old.map(m =>
            m.id === matchId
              ? { ...m, winner_id: winnerId, status: 'completed', completed_at: new Date().toISOString() }
              : m
          )
        })
      }

      return { previousMatch, tournamentId }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousMatch) {
        queryClient.setQueryData(['match', variables.matchId], context.previousMatch)

        if (context.tournamentId) {
          queryClient.setQueryData(['matches', context.tournamentId], (old) => {
            if (!old) return old
            return old.map(m =>
              m.id === variables.matchId ? context.previousMatch : m
            )
          })
        }
      }
    },
    onSettled: (data, error, variables, context) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries(['match', variables.matchId])
      if (context?.tournamentId) {
        queryClient.invalidateQueries(['matches', context.tournamentId])
        queryClient.invalidateQueries(['tournament']) // Refetch full tournament data
        queryClient.invalidateQueries(['players', context.tournamentId]) // Stats changed
      }
    }
  })
}

/**
 * Undo match result mutation
 */
export function useUndoMatchResult() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ matchId }) => {
      const { data, error } = await matchService.undoMatchResult(matchId)
      if (error) throw error
      return data
    },
    onSuccess: (data, variables) => {
      const tournamentId = data?.tournament_id

      queryClient.invalidateQueries(['match', variables.matchId])
      if (tournamentId) {
        queryClient.invalidateQueries(['matches', tournamentId])
        queryClient.invalidateQueries(['tournament'])
        queryClient.invalidateQueries(['players', tournamentId])
      }
    }
  })
}

/**
 * Update match schedule mutation
 */
export function useUpdateMatchSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ matchId, scheduleData }) => {
      const { data, error } = await matchService.updateMatchSchedule(matchId, scheduleData)
      if (error) throw error
      return data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['match', variables.matchId])
      if (data?.tournament_id) {
        queryClient.invalidateQueries(['matches', data.tournament_id])
      }
    }
  })
}

/**
 * Update match notes mutation
 */
export function useUpdateMatchNotes() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ matchId, notes }) => {
      const { data, error } = await matchService.updateMatchNotes(matchId, notes)
      if (error) throw error
      return data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['match', variables.matchId])
      if (data?.tournament_id) {
        queryClient.invalidateQueries(['matches', data.tournament_id])
      }
    }
  })
}

/**
 * Create match mutation (for manual bracket editing)
 */
export function useCreateMatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (matchData) => {
      const { data, error } = await matchService.createMatch(matchData)
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      if (data?.tournament_id) {
        queryClient.invalidateQueries(['matches', data.tournament_id])
        queryClient.invalidateQueries(['tournament'])
      }
    }
  })
}

/**
 * Delete match mutation (admin only)
 */
export function useDeleteMatch() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ matchId }) => {
      const { data, error } = await matchService.deleteMatch(matchId)
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      if (data?.tournament_id) {
        queryClient.invalidateQueries(['matches', data.tournament_id])
        queryClient.invalidateQueries(['tournament'])
      }
    }
  })
}

export default {
  useMatches,
  useMatch,
  useUpdateMatchResult,
  useUndoMatchResult,
  useUpdateMatchSchedule,
  useUpdateMatchNotes,
  useCreateMatch,
  useDeleteMatch
}

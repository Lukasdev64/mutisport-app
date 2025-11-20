/**
 * Players Hooks
 * React Query hooks for player management and standings
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import playerService from '../services/tournament/playerService'

/**
 * Fetch players for a tournament
 * @param {string} tournamentId
 * @param {object} options
 */
export function usePlayers(tournamentId, options = {}) {
  return useQuery({
    queryKey: ['players', tournamentId],
    queryFn: async () => {
      const { data, error } = await playerService.getPlayers(tournamentId)
      if (error) throw error
      return data
    },
    enabled: !!tournamentId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options
  })
}

/**
 * Fetch player standings (sorted by points, buchholz)
 * @param {string} tournamentId
 * @param {object} options
 */
export function usePlayerStandings(tournamentId, options = {}) {
  return useQuery({
    queryKey: ['players', tournamentId, 'standings'],
    queryFn: async () => {
      const { data, error } = await playerService.getPlayerStandings(tournamentId)
      if (error) throw error
      return data
    },
    enabled: !!tournamentId,
    staleTime: 60 * 1000, // 1 minute
    ...options
  })
}

/**
 * Create players mutation (bulk)
 */
export function useCreatePlayers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tournamentId, players }) => {
      const { data, error } = await playerService.createPlayers(tournamentId, players)
      if (error) throw error
      return data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['players', variables.tournamentId])
      queryClient.invalidateQueries(['tournament'])
    }
  })
}

/**
 * Update player seed mutation
 */
export function useUpdatePlayerSeed() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ playerId, seed }) => {
      const { data, error } = await playerService.updatePlayerSeed(playerId, seed)
      if (error) throw error
      return data
    },
    onMutate: async ({ playerId, seed }) => {
      // Cancel outgoing queries
      const playerQueryKey = ['players']
      await queryClient.cancelQueries(playerQueryKey)

      // Snapshot previous value
      const previousPlayers = queryClient.getQueryData(playerQueryKey)

      // Optimistically update
      queryClient.setQueryData(playerQueryKey, (old) => {
        if (!old) return old
        return old.map(p => (p.id === playerId ? { ...p, seed } : p))
      })

      return { previousPlayers }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousPlayers) {
        queryClient.setQueryData(['players'], context.previousPlayers)
      }
    },
    onSettled: (data) => {
      if (data?.tournament_id) {
        queryClient.invalidateQueries(['players', data.tournament_id])
      }
    }
  })
}

/**
 * Bulk update seeds mutation (for drag-and-drop reordering)
 */
export function useBulkUpdateSeeds() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ seedUpdates }) => {
      const { data, error } = await playerService.bulkUpdateSeeds(seedUpdates)
      if (error) throw error
      return data
    },
    onMutate: async ({ seedUpdates, tournamentId }) => {
      // Cancel queries
      await queryClient.cancelQueries(['players', tournamentId])

      // Snapshot
      const previousPlayers = queryClient.getQueryData(['players', tournamentId])

      // Optimistically update
      queryClient.setQueryData(['players', tournamentId], (old) => {
        if (!old) return old

        const updates = Object.fromEntries(seedUpdates.map(u => [u.id, u.seed]))
        return old.map(p => (updates[p.id] !== undefined ? { ...p, seed: updates[p.id] } : p))
      })

      return { previousPlayers, tournamentId }
    },
    onError: (err, variables, context) => {
      // Rollback
      if (context?.previousPlayers && context?.tournamentId) {
        queryClient.setQueryData(['players', context.tournamentId], context.previousPlayers)
      }
    },
    onSettled: (data, error, variables, context) => {
      // Refetch to ensure consistency
      if (context?.tournamentId) {
        queryClient.invalidateQueries(['players', context.tournamentId])
      }
    }
  })
}

export default {
  usePlayers,
  usePlayerStandings,
  useCreatePlayers,
  useUpdatePlayerSeed,
  useBulkUpdateSeeds
}

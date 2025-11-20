/**
 * Tournament Hooks
 * React Query hooks for tournament data management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import tournamentService from '../services/tournament/tournamentService'

/**
 * Fetch full tournament data by URL code
 * @param {string} urlCode - Tournament unique URL code
 * @param {object} options - React Query options
 */
export function useTournament(urlCode, options = {}) {
  return useQuery({
    queryKey: ['tournament', urlCode],
    queryFn: async () => {
      const { data, error } = await tournamentService.getFullTournamentData(urlCode)
      if (error) throw error
      return data
    },
    enabled: !!urlCode,
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options
  })
}

/**
 * Fetch tournament by ID
 * @param {string} tournamentId
 * @param {object} options
 */
export function useTournamentById(tournamentId, options = {}) {
  return useQuery({
    queryKey: ['tournament', 'id', tournamentId],
    queryFn: async () => {
      const { data, error } = await tournamentService.getTournamentById(tournamentId)
      if (error) throw error
      return data
    },
    enabled: !!tournamentId,
    ...options
  })
}

/**
 * Fetch user's tournaments
 * @param {string} userId
 * @param {object} options
 */
export function useUserTournaments(userId, options = {}) {
  return useQuery({
    queryKey: ['tournaments', 'user', userId],
    queryFn: async () => {
      const { data, error } = await tournamentService.getTournamentsByOwner(userId)
      if (error) throw error
      return data
    },
    enabled: !!userId,
    ...options
  })
}

/**
 * Fetch public tournaments with filters
 * @param {object} filters
 * @param {object} options
 */
export function usePublicTournaments(filters = {}, options = {}) {
  return useQuery({
    queryKey: ['tournaments', 'public', filters],
    queryFn: async () => {
      const { data, error } = await tournamentService.getPublicTournaments(filters)
      if (error) throw error
      return data
    },
    ...options
  })
}

/**
 * Create tournament mutation
 */
export function useCreateTournament() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tournamentData, playersList, editToken }) => {
      const { data, error, editToken: returnedToken } = await tournamentService.createTournament(
        tournamentData,
        playersList,
        editToken
      )
      if (error) throw error
      return { tournament: data, editToken: returnedToken }
    },
    onSuccess: (result, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries(['tournaments'])
      if (variables.tournamentData.owner_id) {
        queryClient.invalidateQueries(['tournaments', 'user', variables.tournamentData.owner_id])
      }
    }
  })
}

/**
 * Update tournament mutation
 */
export function useUpdateTournament() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tournamentId, updates, editToken }) => {
      const { data, error } = await tournamentService.updateTournament(tournamentId, updates, editToken)
      if (error) throw error
      return data
    },
    onMutate: async ({ tournamentId, updates }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries(['tournament'])

      // Snapshot previous value
      const previousTournament = queryClient.getQueryData(['tournament', 'id', tournamentId])

      // Optimistically update
      if (previousTournament) {
        queryClient.setQueryData(['tournament', 'id', tournamentId], {
          ...previousTournament,
          ...updates
        })
      }

      return { previousTournament }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTournament) {
        queryClient.setQueryData(
          ['tournament', 'id', variables.tournamentId],
          context.previousTournament
        )
      }
    },
    onSettled: (data, error, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries(['tournament', 'id', variables.tournamentId])
      queryClient.invalidateQueries(['tournament', data?.unique_url_code])
    }
  })
}

/**
 * Update tournament status mutation
 */
export function useUpdateTournamentStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tournamentId, status }) => {
      const { data, error } = await tournamentService.updateTournamentStatus(tournamentId, status)
      if (error) throw error
      return data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['tournament', 'id', variables.tournamentId])
      queryClient.invalidateQueries(['tournament', data?.unique_url_code])
    }
  })
}

/**
 * Claim tournament mutation (convert anonymous to authenticated)
 */
export function useClaimTournament() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tournamentId, editToken, userId }) => {
      const { data, error } = await tournamentService.claimTournament(tournamentId, editToken, userId)
      if (error) throw error
      return data
    },
    onSuccess: (data, variables) => {
      // Invalidate all tournament queries
      queryClient.invalidateQueries(['tournament'])
      queryClient.invalidateQueries(['tournaments', 'user', variables.userId])
    }
  })
}

/**
 * Delete tournament mutation
 */
export function useDeleteTournament() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ tournamentId }) => {
      const { data, error } = await tournamentService.deleteTournament(tournamentId)
      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidate all tournament lists
      queryClient.invalidateQueries(['tournaments'])
    }
  })
}

export default {
  useTournament,
  useTournamentById,
  useUserTournaments,
  usePublicTournaments,
  useCreateTournament,
  useUpdateTournament,
  useUpdateTournamentStatus,
  useClaimTournament,
  useDeleteTournament
}

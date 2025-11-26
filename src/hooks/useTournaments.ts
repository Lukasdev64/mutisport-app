import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useTournamentStore } from '@/features/tournament/store/tournamentStore';
import type { Tournament, Match } from '@/types/tournament';
import type { Database } from '@/types/supabase';

// Helper to map Supabase row to Tournament type
const mapSupabaseToTournament = (row: any): Tournament => {
  // Map DB status to App status
  const appStatus = row.status === 'setup' ? 'draft'
    : row.status === 'in_progress' ? 'active'
    : 'completed';

  return {
    id: row.id,
    name: row.name,
    location: row.location,
    tournamentDate: row.tournament_date,
    format: row.format,
    sport: row.sport,
    status: appStatus,
    players: row.players || [], // Need to join with players table
    rounds: row.rounds || [],   // Need to join with rounds table
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archived: row.archived,
    settings: row.settings || { pointsForWin: 3, pointsForDraw: 1, pointsForLoss: 0 }
  };
};

// Fetch all tournaments for the current user
export const useTournaments = () => {
  return useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      if (isSupabaseConfigured()) {
        // Get current user for filtering (defense-in-depth with RLS)
        const { data: { user } } = await supabase.auth.getUser();

        const { data, error } = await supabase
          .from('tournaments')
          .select('*')
          .eq('organizer_id', user?.id) // Explicit user filter alongside RLS
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data.map(mapSupabaseToTournament);
      } else {
        // Fallback to localStorage via Zustand store
        return useTournamentStore.getState().tournaments;
      }
    }
  });
};

// Fetch single tournament
export const useTournament = (id: string) => {
  return useQuery({
    queryKey: ['tournament', id],
    queryFn: async () => {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('tournaments')
          .select(`
            *,
            players:tournament_players(
              seed,
              status,
              player:players(*)
            ),
            rounds:rounds(
              *,
              matches:matches(*)
            )
          `)
          .eq('id', id)
          .single();
        
        if (error) throw error;
        return mapSupabaseToTournament(data);
      } else {
        return useTournamentStore.getState().getTournament(id);
      }
    },
    enabled: !!id
  });
};

// Create tournament
export const useCreateTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['tournaments', 'create'],
    mutationFn: async (tournament: Tournament) => {
      if (isSupabaseConfigured()) {
        // 1. Create tournament record
        // Map application status to Supabase status
        const dbStatus = tournament.status === 'draft' ? 'setup' 
          : tournament.status === 'active' ? 'in_progress' 
          : 'completed';

        const insertData: Database['public']['Tables']['tournaments']['Insert'] = {
            id: tournament.id,
            name: tournament.name,
            format: tournament.format,
            sport: tournament.sport,
            status: dbStatus,
            players_count: tournament.players.length,
            unique_url_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
            settings: tournament.settings,
            location: tournament.location || 'TBD', 
            tournament_date: tournament.tournamentDate || new Date().toISOString(),
        };

        const { data: tournamentData, error: tournamentError } = await supabase
          .from('tournaments')
          .insert(insertData as any)
          .select()
          .single();

        if (tournamentError) throw tournamentError;
        
        return mapSupabaseToTournament(tournamentData);
      } else {
        useTournamentStore.getState().createTournament(tournament);
        return tournament;
      }
    },
    onSuccess: (newTournament) => {
      // Update cache directly instead of refetching
      queryClient.setQueryData(['tournaments'], (old: Tournament[] | undefined) =>
        old ? [newTournament, ...old] : [newTournament]
      );
    }
  });
};

// Update tournament
export const useUpdateTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['tournaments', 'update'],
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Tournament> }) => {
      // Always update local store first for immediate UI feedback
      useTournamentStore.getState().updateTournament(id, updates);

      if (isSupabaseConfigured()) {
        // Map app status to DB status if present
        const dbUpdates: Record<string, unknown> = { ...updates };
        if (updates.status) {
          dbUpdates.status = updates.status === 'draft' ? 'setup'
            : updates.status === 'active' ? 'in_progress'
            : 'completed';
        }

        const { error } = await (supabase
          .from('tournaments') as any)
          .update(dbUpdates)
          .eq('id', id);

        if (error) {
          console.error('Failed to sync tournament update to Supabase:', error);
          // Don't throw - local update already happened
        }
      }

      return { id, updates };
    },
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['tournament', id] });
    }
  });
};

// Update match result
export const useUpdateMatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['tournaments', 'match', 'update'],
    mutationFn: async ({
      tournamentId,
      matchId,
      data
    }: {
      tournamentId: string;
      matchId: string;
      data: Partial<Match>;
    }) => {
      // Always update local store first for immediate UI feedback
      useTournamentStore.getState().updateMatch(tournamentId, matchId, data);

      if (isSupabaseConfigured()) {
        // Update match in Supabase
        const { error } = await (supabase
          .from('tournament_matches') as any)
          .update({
            winner_id: data.result?.winnerId,
            status: data.status,
            details: data.result ? JSON.stringify(data.result) : undefined,
          })
          .eq('id', matchId);

        if (error) {
          console.error('Failed to sync match update to Supabase:', error);
          // Don't throw - local update already happened
        }
      }

      return { tournamentId, matchId, data };
    },
    onSuccess: ({ tournamentId }) => {
      queryClient.invalidateQueries({ queryKey: ['tournament', tournamentId] });
    }
  });
};

// Archive/Unarchive tournament
export const useArchiveTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['tournaments', 'archive'],
    mutationFn: async ({ id, archived }: { id: string; archived: boolean }) => {
      // Update local store first
      if (archived) {
        useTournamentStore.getState().archiveTournament(id);
      } else {
        useTournamentStore.getState().unarchiveTournament(id);
      }

      if (isSupabaseConfigured()) {
        const { error } = await (supabase
          .from('tournaments') as any)
          .update({ archived })
          .eq('id', id);

        if (error) {
          console.error('Failed to sync archive status to Supabase:', error);
        }
      }

      return { id, archived };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    }
  });
};

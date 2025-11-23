import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useTournamentStore } from '@/features/tournament/store/tournamentStore';
import type { Tournament } from '@/types/tournament';
import type { Database } from '@/types/supabase';

// Helper to map Supabase row to Tournament type
const mapSupabaseToTournament = (row: any): Tournament => {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    tournamentDate: row.tournament_date,
    format: row.format,
    sport: row.sport,
    status: row.status,
    players: row.players || [], // Need to join with players table
    rounds: row.rounds || [],   // Need to join with rounds table
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archived: row.archived,
    settings: row.settings || { pointsForWin: 3, pointsForDraw: 1, pointsForLoss: 0 }
  };
};

// Fetch all tournaments
export const useTournaments = () => {
  return useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from('tournaments')
          .select('*')
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
    mutationFn: async (tournament: Tournament) => {
      if (isSupabaseConfigured()) {
        // 1. Create tournament record
        const { data: tournamentData, error: tournamentError } = await supabase
          .from('tournaments')
          .insert({
            id: tournament.id,
            name: tournament.name,
            format: tournament.format,
            sport: tournament.sport,
            status: tournament.status,
            players_count: tournament.players.length,
            unique_url_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
            settings: tournament.settings,
            // Default required fields
            location: 'TBD', 
            tournament_date: new Date().toISOString(),
          })
          .select()
          .single();

        if (tournamentError) throw tournamentError;

        // 2. Create players if they don't exist and link them
        // This is complex because we need to handle existing players vs new ones
        // For Phase 2, we might simplify or just focus on the tournament record
        
        return mapSupabaseToTournament(tournamentData);
      } else {
        useTournamentStore.getState().createTournament(tournament);
        return tournament;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
    }
  });
};

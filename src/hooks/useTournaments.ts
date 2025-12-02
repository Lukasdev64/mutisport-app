import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useTournamentStore } from '@/features/tournament/store/tournamentStore';
import type { Tournament, Match, SyncStatus } from '@/types/tournament';
// import type { Database } from '@/types/supabase';
import { toast } from 'sonner';

// ============================================
// STATUS MAPPING HELPERS (DRY)
// ============================================

type AppStatus = 'draft' | 'active' | 'completed';
// DB status: 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
type DbStatus = 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

const mapStatusToDb = (appStatus: AppStatus): DbStatus => {
  switch (appStatus) {
    case 'draft': return 'draft';
    case 'active': return 'ongoing';
    case 'completed': return 'completed';
  }
};

const mapStatusFromDb = (dbStatus: string): AppStatus => {
  if (dbStatus === 'draft' || dbStatus === 'upcoming') return 'draft';
  if (dbStatus === 'ongoing') return 'active';
  return 'completed';
};

// ============================================
// FORMAT MAPPING HELPERS
// ============================================
// App uses underscores: 'single_elimination', 'round_robin'
// DB uses hyphens: 'single-elimination', 'round-robin'

type AppFormat = 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
type DbFormat = 'single-elimination' | 'double-elimination' | 'round-robin' | 'swiss';

const mapFormatToDb = (appFormat: string): DbFormat => {
  return appFormat.replace(/_/g, '-') as DbFormat;
};

const mapFormatFromDb = (dbFormat: string): AppFormat => {
  return dbFormat.replace(/-/g, '_') as AppFormat;
};

// ============================================
// DATA MAPPING HELPERS
// ============================================

// Helper to map Supabase row to Tournament type
const mapSupabaseToTournament = (row: any): Tournament => {
  const bracketData = row.bracket_data || {};

  return {
    id: row.id,
    name: row.name,
    location: row.location,
    tournamentDate: row.date,
    format: mapFormatFromDb(row.format),
    sport: row.sport,
    status: mapStatusFromDb(row.status),
    players: bracketData.players || [],
    rounds: bracketData.rounds || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archived: row.archived || false,
    settings: bracketData.settings || { pointsForWin: 3, pointsForDraw: 1, pointsForLoss: 0 },
    tennisConfig: bracketData.tennisConfig,
    syncStatus: 'synced' as SyncStatus, // Data from Supabase is always synced
  };
};

// Helper to map Tournament to Supabase insert format
// For upsert operations, pass isUpdate=true to omit unique_url_code (let DB keep existing)
const mapTournamentToDb = (tournament: Tournament, userId: string, isUpdate = false) => {
  const baseData = {
    id: tournament.id,
    name: tournament.name,
    format: mapFormatToDb(tournament.format),
    sport: tournament.sport,
    status: mapStatusToDb(tournament.status),
    current_participants: tournament.players.length,
    max_participants: Math.max(tournament.players.length, 16),
    bracket_data: {
      settings: tournament.settings,
      players: tournament.players,
      rounds: tournament.rounds,
      tennisConfig: tournament.tennisConfig,
    },
    location: tournament.location || null,
    date: tournament.tournamentDate ? new Date(tournament.tournamentDate).toISOString().split('T')[0] : null,
    organizer_id: userId,
    is_public: true,
  };

  // Only include unique_url_code on initial insert, not on updates
  // This prevents conflicts when upserting existing tournaments
  if (!isUpdate) {
    return {
      ...baseData,
      unique_url_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
    };
  }

  return baseData;
};

// Delay helper for retry logic
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch all tournaments for the current user
export const useTournaments = () => {
  return useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      if (isSupabaseConfigured()) {
        // Get current user for filtering (defense-in-depth with RLS)
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return [];

        const { data, error } = await supabase
          .from('tournaments')
          .select('*')
          .eq('organizer_id', user.id) // Explicit user filter alongside RLS
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

// Helper to check if string is valid UUID
const isValidUUID = (uuid: string) => {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
};

// Fetch single tournament (simplified query for spectator viewing)
export const useTournament = (id: string) => {
  return useQuery({
    queryKey: ['tournament', id],
    queryFn: async () => {
      if (isSupabaseConfigured()) {
        // Simple query - tournament data is stored as JSONB (bracket_data, match_results)
        const { data, error } = await supabase
          .from('tournaments')
          .select('*')
          .eq('id', id)
          .maybeSingle(); // Use maybeSingle() to avoid error when not found

        if (error) {
          console.error('[Supabase] Error fetching tournament:', error);
          throw error;
        }

        // If not found in Supabase, return null (let component handle it)
        if (!data) {
          console.log('[Supabase] Tournament not found in database:', id);
          return null;
        }

        return mapSupabaseToTournament(data);
      } else {
        return useTournamentStore.getState().getTournament(id);
      }
    },
    enabled: !!id && isValidUUID(id)
  });
};

// Create tournament
// If Supabase is configured AND user is authenticated: creates in cloud + local
// Otherwise: creates locally with syncStatus 'local-only'
export const useCreateTournament = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['tournaments', 'create'],
    mutationFn: async (tournament: Tournament) => {
      // Always create in local store first for immediate UI feedback
      const tournamentWithStatus: Tournament = {
        ...tournament,
        syncStatus: 'pending' as SyncStatus,
      };
      useTournamentStore.getState().createTournament(tournamentWithStatus);

      if (!isSupabaseConfigured()) {
        // No Supabase - mark as local-only
        useTournamentStore.getState().setSyncStatus(tournament.id, 'local-only');
        return { ...tournamentWithStatus, syncStatus: 'local-only' as SyncStatus };
      }

      // Get current user for organizer_id (required by RLS policy)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // User not authenticated - mark as local-only
        useTournamentStore.getState().setSyncStatus(tournament.id, 'local-only');
        toast.warning('Connectez-vous pour partager ce tournoi');
        return { ...tournamentWithStatus, syncStatus: 'local-only' as SyncStatus };
      }

      // Use the DRY helper function
      const insertData = mapTournamentToDb(tournament, user.id);

      const { data: tournamentData, error: tournamentError } = await supabase
        .from('tournaments')
        .insert(insertData as any)
        .select()
        .single();

      if (tournamentError) {
        console.error('[Supabase] Tournament creation failed:', tournamentError);
        // Mark as local-only - can be synced later
        useTournamentStore.getState().setSyncStatus(tournament.id, 'local-only');
        toast.error('Échec de la synchronisation cloud - tournoi sauvegardé localement');
        return { ...tournamentWithStatus, syncStatus: 'local-only' as SyncStatus };
      }

      // Success - mark as synced
      useTournamentStore.getState().setSyncStatus(tournament.id, 'synced');
      toast.success('Tournoi créé et synchronisé');
      return mapSupabaseToTournament(tournamentData);
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
          dbUpdates.status = mapStatusToDb(updates.status);
        }
        // Map app format to DB format if present
        if (updates.format) {
          dbUpdates.format = mapFormatToDb(updates.format);
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

// Sync local tournament to Supabase (for existing local-only tournaments)
// Uses insert-or-update pattern instead of upsert to handle unique constraints properly
// Includes retry logic with exponential backoff (3 attempts)
export const useSyncTournamentToCloud = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['tournaments', 'sync'],
    mutationFn: async (tournament: Tournament) => {
      if (!isSupabaseConfigured()) {
        throw new Error('SUPABASE_NOT_CONFIGURED');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('AUTH_REQUIRED');
      }

      // Mark as pending before sync attempt
      useTournamentStore.getState().setSyncStatus(tournament.id, 'pending');

      // Check if tournament already exists in database
      const { data: existing } = await supabase
        .from('tournaments')
        .select('id')
        .eq('id', tournament.id)
        .maybeSingle();

      const isUpdate = !!existing;

      // Retry logic with exponential backoff
      const MAX_ATTEMPTS = 3;
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
          let data;
          let error;

          if (isUpdate) {
            // Tournament exists - use UPDATE (omit unique_url_code)
            const updateData = mapTournamentToDb(tournament, user.id, true);
            const result = await (supabase
              .from('tournaments') as any)
              .update(updateData)
              .eq('id', tournament.id)
              .select()
              .single();
            data = result.data;
            error = result.error;
          } else {
            // New tournament - use INSERT (include unique_url_code)
            const insertData = mapTournamentToDb(tournament, user.id, false);
            const result = await supabase
              .from('tournaments')
              .insert(insertData as any)
              .select()
              .single();
            data = result.data;
            error = result.error;
          }

          if (error) {
            throw error;
          }

          // Success - mark as synced
          useTournamentStore.getState().setSyncStatus(tournament.id, 'synced');
          return mapSupabaseToTournament(data);
        } catch (err) {
          lastError = err as Error;
          console.warn(`[Supabase] Sync attempt ${attempt}/${MAX_ATTEMPTS} failed:`, err);

          if (attempt < MAX_ATTEMPTS) {
            // Exponential backoff: 1s, 2s, 4s
            await delay(Math.pow(2, attempt - 1) * 1000);
          }
        }
      }

      // All attempts failed - mark as local-only
      useTournamentStore.getState().setSyncStatus(tournament.id, 'local-only');
      throw new Error(`SYNC_FAILED: ${lastError?.message || 'Unknown error'}`);
    },
    onSuccess: (_syncedTournament, originalTournament) => {
      toast.success('Tournoi synchronisé avec le cloud');
      queryClient.invalidateQueries({ queryKey: ['tournaments'] });
      queryClient.invalidateQueries({ queryKey: ['tournament', originalTournament.id] });
    },
    onError: (error: Error) => {
      if (error.message === 'AUTH_REQUIRED') {
        toast.error('Connectez-vous pour synchroniser le tournoi');
      } else if (error.message === 'SUPABASE_NOT_CONFIGURED') {
        toast.error('Mode hors-ligne - synchronisation impossible');
      } else {
        toast.error('Échec de la synchronisation après 3 tentatives');
      }
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

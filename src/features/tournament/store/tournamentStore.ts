import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tournament, Match, SyncStatus } from '@/types/tournament';
import { MOCK_TOURNAMENTS } from '@/lib/mockData';
import { TournamentEngine } from '../logic/engine';
import { TENNIS_TOURNAMENT_PRESETS } from '@/sports/tennis/tournamentPresets';

/** Shape of the persisted state for migrations */
interface PersistedTournamentState {
  tournaments: Tournament[];
  activeTournamentId: string | null;
}

interface TournamentStore {
  tournaments: Tournament[];
  activeTournamentId: string | null;

  // Actions
  createTournament: (tournament: Tournament) => void;
  setActiveTournament: (id: string) => void;
  updateTournament: (id: string, updates: Partial<Tournament>) => void;
  updateMatch: (tournamentId: string, matchId: string, data: Partial<Match>) => void;
  generateNextRound: (tournamentId: string) => void;
  getTournament: (id: string) => Tournament | undefined;
  archiveTournament: (id: string) => void;
  unarchiveTournament: (id: string) => void;
  // Sync status actions
  setSyncStatus: (id: string, status: SyncStatus) => void;
}

export const useTournamentStore = create<TournamentStore>()(
  persist(
    (set, get) => ({
      tournaments: MOCK_TOURNAMENTS,
      activeTournamentId: null,

      createTournament: (tournament) => {
        console.log('Creating tournament:', tournament.name, 'with', tournament.players.length, 'players');
        set((state) => ({
          tournaments: [...state.tournaments, tournament],
          activeTournamentId: tournament.id
        }));
      },

  setActiveTournament: (id) => set({ activeTournamentId: id }),

  updateTournament: (id, updates) => set((state) => ({
    tournaments: state.tournaments.map((t) =>
      t.id === id
        ? { ...t, ...updates, updatedAt: new Date().toISOString() }
        : t
    ),
  })),

  updateMatch: (tournamentId, matchId, data) => set((state) => ({
    tournaments: state.tournaments.map((t) => {
      if (t.id !== tournamentId) return t;
      
      // Deep clone
      const newTournament = { ...t };
      let nextMatchId: string | undefined;
      let winnerId: string | undefined;

      // 1. Update the current match
      newTournament.rounds = newTournament.rounds.map((round) => ({
        ...round,
        matches: round.matches.map((match) => {
          if (match.id === matchId) {
            const updatedMatch = { ...match, ...data };
            nextMatchId = updatedMatch.nextMatchId;
            winnerId = updatedMatch.result?.winnerId;
            return updatedMatch;
          }
          return match;
        })
      }));

      // 2. If there's a winner and a next match, update the next match
      if (winnerId) {
        if (nextMatchId) {
          newTournament.rounds = newTournament.rounds.map((round) => ({
            ...round,
            matches: round.matches.map((match) => {
              if (match.id === nextMatchId) {
                // Determine if player should be player1 or player2 in the next match
                if (!match.player1Id) {
                  return { ...match, player1Id: winnerId };
                } else if (!match.player2Id && match.player1Id !== winnerId) {
                  return { ...match, player2Id: winnerId };
                }
              }
              return match;
            })
          }));
        } else {
          // 3. If no next match, check if it's the final to complete the tournament
          // We check if this match is in the last round
          const lastRound = newTournament.rounds[newTournament.rounds.length - 1];
          const isLastRoundMatch = lastRound.matches.some(m => m.id === matchId);
          
          if (isLastRoundMatch) {
            console.log('🏆 Tournament Completed! Winner:', winnerId);
            newTournament.status = 'completed';
          }
        }
      }

      return newTournament;
    })
  })),

  generateNextRound: (tournamentId) => set((state) => ({
    tournaments: state.tournaments.map((t) => {
      if (t.id !== tournamentId || t.format !== 'swiss') return t;
      
      const nextRoundNumber = t.rounds.length + 1;
      const newRound = TournamentEngine.generateSwissRound(t, nextRoundNumber);
      
      return {
        ...t,
        rounds: [...t.rounds, newRound]
      };
    })
  })),

  archiveTournament: (id) => set((state) => ({
    tournaments: state.tournaments.map((t) => 
      t.id === id ? { ...t, archived: true, updatedAt: new Date().toISOString() } : t
    )
  })),

  unarchiveTournament: (id) => set((state) => ({
    tournaments: state.tournaments.map((t) => 
      t.id === id ? { ...t, archived: false, updatedAt: new Date().toISOString() } : t
    )
  })),

  getTournament: (id) => get().tournaments.find((t) => t.id === id),

  setSyncStatus: (id, status) => set((state) => ({
    tournaments: state.tournaments.map((t) =>
      t.id === id ? { ...t, syncStatus: status } : t
    )
  }))
}),
    {
      name: 'tournament-storage', // LocalStorage key
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as PersistedTournamentState | undefined;
        if (version === 0) {
          // Safety check
          if (!state || !state.tournaments) {
            return state;
          }

          // Migration: Add default tennis config to existing tennis tournaments
          const defaultPreset = TENNIS_TOURNAMENT_PRESETS[0]; // Australian Open

          return {
            ...state,
            tournaments: state.tournaments.map((t) => {
              if (t.sport === 'tennis' && !t.tennisConfig) {
                return {
                  ...t,
                  tennisConfig: defaultPreset.config
                };
              }
              return t;
            })
          };
        }
        return state;
      }
    }
  )
);

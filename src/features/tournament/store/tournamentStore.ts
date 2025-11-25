import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Tournament, Match } from '@/types/tournament';
import { MOCK_TOURNAMENTS } from '@/lib/mockData';
import { TournamentEngine } from '../logic/engine';
import { TENNIS_TOURNAMENT_PRESETS } from '@/sports/tennis/tournamentPresets';

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
      if (nextMatchId && winnerId) {
        newTournament.rounds = newTournament.rounds.map((round) => ({
          ...round,
          matches: round.matches.map((match) => {
            if (match.id === nextMatchId) {
              // Determine if player should be player1 or player2 in the next match
              // This is a simplified logic. Ideally, the bracket generation should define this.
              // For now, we fill the first empty slot.
              if (!match.player1Id) {
                return { ...match, player1Id: winnerId };
              } else if (!match.player2Id && match.player1Id !== winnerId) {
                return { ...match, player2Id: winnerId };
              }
            }
            return match;
          })
        }));
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

  getTournament: (id) => get().tournaments.find((t) => t.id === id)
}),
    {
      name: 'tournament-storage', // LocalStorage key
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Safety check
          if (!persistedState || !persistedState.tournaments) {
            return persistedState;
          }

          // Migration: Add default tennis config to existing tennis tournaments
          const defaultPreset = TENNIS_TOURNAMENT_PRESETS[0]; // Australian Open
          
          return {
            ...persistedState,
            tournaments: persistedState.tournaments.map((t: any) => {
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
        return persistedState;
      }
    }
  )
);

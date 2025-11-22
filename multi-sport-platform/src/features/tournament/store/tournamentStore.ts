import { create } from 'zustand';
import type { Tournament, Match } from '@/types/tournament';
import { MOCK_TOURNAMENTS } from '@/lib/mockData';

interface TournamentStore {
  tournaments: Tournament[];
  activeTournamentId: string | null;
  
  // Actions
  createTournament: (tournament: Tournament) => void;
  setActiveTournament: (id: string) => void;
  updateMatch: (tournamentId: string, matchId: string, data: Partial<Match>) => void;
  generateNextRound: (tournamentId: string) => void;
  getTournament: (id: string) => Tournament | undefined;
}

export const useTournamentStore = create<TournamentStore>((set, get) => ({
  tournaments: MOCK_TOURNAMENTS,
  activeTournamentId: null,

  createTournament: (tournament) => set((state) => ({
    tournaments: [...state.tournaments, tournament],
    activeTournamentId: tournament.id
  })),

  setActiveTournament: (id) => set({ activeTournamentId: id }),

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
      
      // Import TournamentEngine dynamically to avoid circular dependency
      const { TournamentEngine } = require('../logic/engine');
      const nextRoundNumber = t.rounds.length + 1;
      const newRound = TournamentEngine.generateSwissRound(t, nextRoundNumber);
      
      return {
        ...t,
        rounds: [...t.rounds, newRound]
      };
    })
  })),

  getTournament: (id) => get().tournaments.find((t) => t.id === id)
}));

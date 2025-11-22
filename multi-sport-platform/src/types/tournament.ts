import type { SportType } from './sport';

export type TournamentFormat = 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';

export type TournamentStatus = 'draft' | 'active' | 'completed';

export interface Player {
  id: string;
  name: string;
  email?: string; // Optional for quick tournaments
  avatar?: string;
}

export interface MatchResult {
  player1Score: number;
  player2Score: number;
  winnerId?: string;
  isWalkover?: boolean;
}

export interface Match {
  id: string;
  tournamentId?: string; // optional for mock data
  roundId?: string; // optional for mock data
  player1Id?: string; // Undefined if TBD
  player2Id?: string; // Undefined if TBD
  result?: MatchResult;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'active'; // include active for compatibility
  nextMatchId?: string; // optional for mock data
}

export interface Round {
  id: string;
  tournamentId?: string; // optional for mock data
  number?: number; // optional for mock data
  name: string; // "Round 1", "Quarter-Finals", etc.
  matches: Match[];
  status?: 'pending' | 'active' | 'completed'; // optional for mock data
}

export interface Tournament {
  id: string;
  name: string;
  sport?: SportType; // optional for mock data
  format: TournamentFormat;
  status: TournamentStatus;
  players: Player[];
  rounds: Round[];
  createdAt: string;
  updatedAt: string;
  settings: {
    pointsForWin: number;
    pointsForDraw: number;
    pointsForLoss: number;
  };
}

export interface Standing {
  playerId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  buchholz?: number; // For Swiss
}

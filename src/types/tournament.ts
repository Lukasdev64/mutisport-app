import type { SportType } from './sport';
import type { TennisMatchConfig } from './tennis';

export type TournamentFormat = 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';

export type TournamentStatus = 'draft' | 'active' | 'completed';

export interface Player {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  age?: number;
  rank?: string;
  ranking?: string;
  registrationDate?: string;
  constraints?: {
    unavailableDates: string[];
    maxMatchesPerDay: number;
  };
}

export interface MatchResult {
  player1Score: number;
  player2Score: number;
  winnerId?: string;
  isWalkover?: boolean;
}

export interface Match {
  id: string;
  tournamentId?: string;
  roundId?: string;
  player1Id?: string;
  player2Id?: string;
  result?: MatchResult;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'active';
  nextMatchId?: string;
  scheduledAt?: string;
  location?: string;
  resourceId?: string;
}

export interface Round {
  id: string;
  tournamentId?: string;
  number?: number;
  name: string;
  matches: Match[];
  status?: 'pending' | 'active' | 'completed';
}

export interface Tournament {
  id: string;
  name: string;
  sport?: SportType;
  tennisConfig?: TennisMatchConfig; // NEW: Tennis specific config
  ageCategory?: string;
  isRanked?: boolean;
  rankingRange?: { min?: string; max?: string };
  format: TournamentFormat;
  status: TournamentStatus;
  archived?: boolean; // NEW: Archive flag
  location?: string; // NEW: Location field
  tournamentDate?: string; // NEW: Date field
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
  buchholz?: number;
}

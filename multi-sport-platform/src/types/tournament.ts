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
  tournamentId: string;
  roundId: string;
  player1Id?: string; // Undefined if TBD
  player2Id?: string; // Undefined if TBD
  result?: MatchResult;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed';
  nextMatchId?: string; // For progression
}

export interface Round {
  id: string;
  tournamentId: string;
  number: number;
  name: string; // "Round 1", "Quarter-Finals", etc.
  matches: Match[];
  status: 'pending' | 'active' | 'completed';
}

export interface Tournament {
  id: string;
  name: string;
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

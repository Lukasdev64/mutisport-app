// import type { SportType } from '@/types/sport';

export type TennisSurface = 'clay' | 'hard' | 'grass' | 'indoor';
export type TennisFormat = 'best_of_3' | 'best_of_5';

export interface TennisMatchConfig {
  format: TennisFormat;
  surface: TennisSurface;
  
  // Tie-break rules
  tiebreakAt: number; // Games count to trigger tiebreak (usually 6)
  finalSetTiebreak: boolean; // Some tournaments don't use tiebreak in final set
  finalSetTiebreakPoints?: number; // 7 for regular, 10 for super tie-break
  
  // Scoring variations
  decidingPointAtDeuce: boolean; // No-Ad scoring (sudden death at deuce)
  
  // Service rules
  letRule: boolean; // false = No-Let (service let is played)
  
  // Match rules
  coachingAllowed: boolean; // On-court coaching permitted
  challengesPerSet?: number; // Hawk-Eye video review challenges (usually 3)
  
  // Time rules (in seconds/minutes)
  warmupMinutes: number; // Pre-match warm-up time
  changeoverSeconds: number; // Time between odd games
  betweenPointsSeconds: number; // Shot clock between points
}

export interface TennisGameScore {
  player1Points: number; // 0, 1, 2, 3 (represents 0, 15, 30, 40)
  player2Points: number;
  isDeuce: boolean;
  advantage?: 1 | 2; // Which player has advantage
}

export interface TennisSetScore {
  player1Games: number;
  player2Games: number;
  isTiebreak: boolean;
  tiebreakScore?: {
    player1: number;
    player2: number;
  };
}

export interface TennisMatchScore {
  player1Sets: number;
  player2Sets: number;
  sets: TennisSetScore[];
  currentSet: number; // 0-indexed
  currentGame: TennisGameScore;
  isComplete: boolean;
  winnerId?: string;
}

export interface TennisMatchStats {
  aces: number;
  doubleFaults: number;
  firstServePercentage: number;
  firstServePointsWon: number;
  secondServePointsWon: number;
  breakPointsWon: number;
  breakPointsTotal: number;
  winners: number;
  unforcedErrors: number;
  totalPoints: number;
}

export interface TennisMatch {
  id: string;
  tournamentId: string;
  roundId: string;
  player1Id: string;
  player2Id: string;
  config: TennisMatchConfig;
  score?: TennisMatchScore;
  stats?: {
    player1: TennisMatchStats;
    player2: TennisMatchStats;
  };
  status: 'scheduled' | 'in_progress' | 'completed';
}

// Helper to display tennis score
export function getTennisPointDisplay(points: number): string {
  const pointsMap = ['0', '15', '30', '40'];
  return pointsMap[points] || '40';
}

// Helper to get set score display
export function getTennisSetDisplay(set: TennisSetScore): string {
  if (set.isTiebreak && set.tiebreakScore) {
    return `${set.player1Games}-${set.player2Games} (${set.tiebreakScore.player1}-${set.tiebreakScore.player2})`;
  }
  return `${set.player1Games}-${set.player2Games}`;
}

// Helper to get full match score display
export function getTennisMatchDisplay(score: TennisMatchScore): string {
  return score.sets.map(getTennisSetDisplay).join(', ');
}

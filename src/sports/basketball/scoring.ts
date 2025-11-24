import type { Match } from '@/types/tournament';

export const calculateBasketballScore = (match: Match): { winnerId: string | null, score: string } => {
  // Basic implementation for basketball scoring
  // Assumes scores are stored as simple integers in the match result
  
  if (!match.result) return { winnerId: null, score: '0-0' };

  const scoreA = match.result.player1Score || 0;
  const scoreB = match.result.player2Score || 0;

  if (scoreA > scoreB) {
    return { winnerId: match.player1Id || null, score: `${scoreA}-${scoreB}` };
  } else if (scoreB > scoreA) {
    return { winnerId: match.player2Id || null, score: `${scoreA}-${scoreB}` };
  } else {
    return { winnerId: null, score: `${scoreA}-${scoreB}` }; // Draw
  }
};

export type TennisRanking = string;

export const RANKINGS = [
  // 4th Series
  'NC', '40', '30/5', '30/4', '30/3', '30/2', '30/1',
  // 3rd Series
  '30', '15/5', '15/4', '15/3', '15/2', '15/1',
  // 2nd Series
  '15', '5/6', '4/6', '3/6', '2/6', '1/6', '0', '-2/6', '-4/6', '-15', '-30',
  // 1st Series
  'Promotion'
] as const;

/**
 * Returns the numeric value of a ranking (higher index = higher rank)
 * NC = 0, 40 = 1, ..., Promotion = 24
 */
export function getRankingValue(ranking: string | undefined): number {
  if (!ranking) return -1;
  return RANKINGS.indexOf(ranking as any);
}

/**
 * Checks if a player's ranking is within the allowed range (inclusive)
 */
export function isRankingEligible(
  playerRanking: string | undefined,
  minRanking: string | undefined,
  maxRanking: string | undefined
): boolean {
  // If player has no ranking, assume they are NC (index 0) or handle as needed.
  // Let's assume undefined = NC for eligibility checks if strict mode is off, 
  // but usually unranked players are NC.
  const pValue = getRankingValue(playerRanking || 'NC');
  
  if (minRanking) {
    const minValue = getRankingValue(minRanking);
    if (pValue < minValue) return false;
  }
  
  if (maxRanking) {
    const maxValue = getRankingValue(maxRanking);
    if (pValue > maxValue) return false;
  }
  
  return true;
}

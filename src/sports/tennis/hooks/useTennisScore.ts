import { useState, useCallback, useMemo } from 'react';
import { TennisScoringEngine } from '../scoring';
import type { TennisMatchScore, TennisMatchConfig } from '@/types/tennis';

interface UseTennisScoreOptions {
  config: TennisMatchConfig;
  player1Id: string;
  player2Id: string;
  initialScore?: TennisMatchScore;
  onMatchComplete?: (score: TennisMatchScore) => void;
}

interface UseTennisScoreReturn {
  score: TennisMatchScore;
  history: TennisMatchScore[];
  awardPoint: (player: 1 | 2) => void;
  undo: () => void;
  canUndo: boolean;
  isComplete: boolean;
  winnerId: string | undefined;
  currentGameDisplay: { p1: string; p2: string };
  setsDisplay: string;
  servingPlayer: 1 | 2;
  reset: () => void;
}

/**
 * Custom hook for managing tennis match scoring with undo functionality
 * Uses TennisScoringEngine for all scoring logic
 */
export function useTennisScore({
  config,
  player1Id,
  player2Id,
  initialScore,
  onMatchComplete
}: UseTennisScoreOptions): UseTennisScoreReturn {
  // Initialize score state
  const [score, setScore] = useState<TennisMatchScore>(() =>
    initialScore ?? TennisScoringEngine.initializeMatch(config)
  );

  // History for undo (stack of previous states)
  const [history, setHistory] = useState<TennisMatchScore[]>([]);

  // Track serving player (alternates each game, special rules for tiebreak)
  const [servingPlayer, setServingPlayer] = useState<1 | 2>(1);

  // Calculate total games played to track serving
  const totalGames = useMemo(() => {
    return score.sets.reduce((total, set) => total + set.player1Games + set.player2Games, 0);
  }, [score.sets]);

  // Award a point to a player
  const awardPoint = useCallback((player: 1 | 2) => {
    if (score.isComplete) return;

    // Save current state to history
    setHistory(prev => [...prev, score]);

    // Check if we're in a tiebreak
    const currentSet = score.sets[score.currentSet];
    const isTiebreak = currentSet?.isTiebreak;

    let newScore: TennisMatchScore;

    if (isTiebreak) {
      // Use tiebreak scoring
      newScore = TennisScoringEngine.awardTiebreakPoint(
        score,
        player,
        { player1Id, player2Id }
      );
    } else {
      // Regular point
      newScore = TennisScoringEngine.awardPoint(
        score,
        player,
        { player1Id, player2Id }
      );
    }

    setScore(newScore);

    // Update serving player based on game changes
    const newTotalGames = newScore.sets.reduce(
      (total, set) => total + set.player1Games + set.player2Games,
      0
    );

    if (newTotalGames !== totalGames) {
      // Game ended, switch server (unless in tiebreak where it's every 2 points)
      setServingPlayer(prev => (prev === 1 ? 2 : 1));
    }

    // Check for match completion
    if (newScore.isComplete && onMatchComplete) {
      onMatchComplete(newScore);
    }
  }, [score, player1Id, player2Id, totalGames, onMatchComplete]);

  // Undo last point
  const undo = useCallback(() => {
    if (history.length === 0) return;

    const previousState = history[history.length - 1];
    setScore(previousState);
    setHistory(prev => prev.slice(0, -1));
  }, [history]);

  // Check if undo is available
  const canUndo = history.length > 0;

  // Get current game score display
  const currentGameDisplay = useMemo(() => {
    return TennisScoringEngine.getGameScoreDisplay(score.currentGame);
  }, [score.currentGame]);

  // Get sets display
  const setsDisplay = useMemo(() => {
    return TennisScoringEngine.getScoreDisplay(score);
  }, [score]);

  // Reset the match
  const reset = useCallback(() => {
    setScore(TennisScoringEngine.initializeMatch(config));
    setHistory([]);
    setServingPlayer(1);
  }, [config]);

  return {
    score,
    history,
    awardPoint,
    undo,
    canUndo,
    isComplete: score.isComplete,
    winnerId: score.winnerId,
    currentGameDisplay,
    setsDisplay,
    servingPlayer,
    reset
  };
}

/**
 * Helper function to get display-friendly tiebreak score
 */
export function getTiebreakDisplay(score: TennisMatchScore): string | null {
  const currentSet = score.sets[score.currentSet];
  if (!currentSet?.isTiebreak || !currentSet.tiebreakScore) {
    return null;
  }
  return `${currentSet.tiebreakScore.player1}-${currentSet.tiebreakScore.player2}`;
}

/**
 * Helper to determine if it's a deciding set based on config
 */
export function isDecidingSet(score: TennisMatchScore, config: TennisMatchConfig): boolean {
  const setsToWin = config.format === 'best_of_5' ? 3 : 2;
  return score.player1Sets === setsToWin - 1 && score.player2Sets === setsToWin - 1;
}

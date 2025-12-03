import { useState, useCallback, useMemo } from 'react';
import type { TennisMatchScore, TennisMatchConfig } from '@/types/tennis';
import { TennisScoringEngine } from '../scoring';
import { validateMatchScore, validateSetScore } from '../validation';

interface UseTennisScoreEditorOptions {
  initialScore: TennisMatchScore;
  config: TennisMatchConfig;
  player1Id: string;
  player2Id: string;
  onSave?: (score: TennisMatchScore) => void;
}

interface SetScoreInput {
  player1Games: number;
  player2Games: number;
  tiebreakScore?: { player1: number; player2: number };
}

export interface UseTennisScoreEditorReturn {
  // État actuel (brouillon, non commité)
  editingScore: TennisMatchScore;

  // Validation
  validationErrors: string[];
  isValid: boolean;

  // Actions d'édition de set
  setSetScore: (setIndex: number, p1Games: number, p2Games: number, tiebreak?: { player1: number; player2: number }) => void;
  addSet: (p1Games: number, p2Games: number, tiebreak?: { player1: number; player2: number }) => void;
  removeSet: (setIndex: number) => void;

  // Actions d'édition de jeu
  setGameScore: (p1Games: number, p2Games: number) => void;
  adjustGame: (player: 1 | 2, delta: 1 | -1) => void;

  // Actions d'édition de point
  setPointScore: (p1Points: number, p2Points: number) => void;
  setTiebreakPoints: (p1Points: number, p2Points: number) => void;

  // Actions de commit
  save: () => void;
  reset: () => void;
  hasChanges: boolean;

  // Helpers
  reopenMatch: () => void;
  reconstructFromSets: (sets: SetScoreInput[]) => void;
}

export function useTennisScoreEditor({
  initialScore,
  config,
  player1Id,
  player2Id,
  onSave
}: UseTennisScoreEditorOptions): UseTennisScoreEditorReturn {
  const [editingScore, setEditingScore] = useState<TennisMatchScore>(
    () => JSON.parse(JSON.stringify(initialScore))
  );

  const playerIds = useMemo(() => ({ player1Id, player2Id }), [player1Id, player2Id]);

  // Validation
  const validation = useMemo(
    () => validateMatchScore(editingScore, config),
    [editingScore, config]
  );

  // Vérifier s'il y a des changements
  const hasChanges = useMemo(
    () => JSON.stringify(editingScore) !== JSON.stringify(initialScore),
    [editingScore, initialScore]
  );

  // ============================================
  // Actions d'édition de set
  // ============================================

  const setSetScore = useCallback((
    setIndex: number,
    p1Games: number,
    p2Games: number,
    tiebreak?: { player1: number; player2: number }
  ) => {
    setEditingScore(prev =>
      TennisScoringEngine.setSetScore(prev, setIndex, p1Games, p2Games, tiebreak, playerIds, config)
    );
  }, [playerIds, config]);

  const addSet = useCallback((
    p1Games: number,
    p2Games: number,
    tiebreak?: { player1: number; player2: number }
  ) => {
    // Valider d'abord
    const valid = validateSetScore(p1Games, p2Games, tiebreak);
    if (!valid.isValid) {
      console.warn('Set invalide:', valid.error);
      return;
    }

    setEditingScore(prev =>
      TennisScoringEngine.addCompletedSet(prev, p1Games, p2Games, tiebreak, playerIds, config)
    );
  }, [playerIds, config]);

  const removeSet = useCallback((_setIndex: number) => {
    // Note: removeLastSet supprime toujours le dernier set
    // Pour une suppression arbitraire, il faudrait implémenter removeSetAtIndex
    setEditingScore(prev =>
      TennisScoringEngine.removeLastSet(prev, playerIds, config)
    );
  }, [playerIds, config]);

  // ============================================
  // Actions d'édition de jeu
  // ============================================

  const setGameScore = useCallback((p1Games: number, p2Games: number) => {
    setEditingScore(prev =>
      TennisScoringEngine.setGameScore(prev, p1Games, p2Games)
    );
  }, []);

  const adjustGame = useCallback((player: 1 | 2, delta: 1 | -1) => {
    setEditingScore(prev =>
      TennisScoringEngine.adjustGameCount(prev, player, delta)
    );
  }, []);

  // ============================================
  // Actions d'édition de point
  // ============================================

  const setPointScore = useCallback((p1Points: number, p2Points: number) => {
    setEditingScore(prev =>
      TennisScoringEngine.setPointScore(prev, p1Points, p2Points)
    );
  }, []);

  const setTiebreakPoints = useCallback((p1Points: number, p2Points: number) => {
    setEditingScore(prev =>
      TennisScoringEngine.setTiebreakScore(prev, p1Points, p2Points)
    );
  }, []);

  // ============================================
  // Actions de commit
  // ============================================

  const save = useCallback(() => {
    if (!validation.isValid) {
      console.warn('Cannot save invalid score:', validation.errors);
      return;
    }
    onSave?.(editingScore);
  }, [editingScore, validation, onSave]);

  const reset = useCallback(() => {
    setEditingScore(JSON.parse(JSON.stringify(initialScore)));
  }, [initialScore]);

  // ============================================
  // Helpers
  // ============================================

  const reopenMatch = useCallback(() => {
    setEditingScore(prev => TennisScoringEngine.reopenMatch(prev));
  }, []);

  const reconstructFromSets = useCallback((sets: SetScoreInput[]) => {
    setEditingScore(
      TennisScoringEngine.reconstructMatch(config, sets, playerIds)
    );
  }, [config, playerIds]);

  return {
    editingScore,
    validationErrors: validation.errors,
    isValid: validation.isValid,
    setSetScore,
    addSet,
    removeSet,
    setGameScore,
    adjustGame,
    setPointScore,
    setTiebreakPoints,
    save,
    reset,
    hasChanges,
    reopenMatch,
    reconstructFromSets
  };
}

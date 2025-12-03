import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import type { SwipeableHandlers } from 'react-swipeable';
import type { Round } from '@/types/tournament';

interface UseBracketNavigationOptions {
  rounds: Round[];
  /** Auto-navigate to first incomplete round on mount */
  autoNavigateToIncomplete?: boolean;
}

interface UseBracketNavigationReturn {
  currentRoundIndex: number;
  totalRounds: number;
  currentRound: Round | null;
  setRoundIndex: (index: number) => void;
  swipeHandlers: SwipeableHandlers;
  goToNextRound: () => void;
  goToPrevRound: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  /** Direction of last navigation: -1 (prev), 0 (none), 1 (next) */
  direction: number;
}

/**
 * Hook for bracket round navigation with swipe gesture support.
 * Manages round state and provides swipe handlers for carousel navigation.
 *
 * @param options - Configuration options including rounds array
 * @returns Navigation state and handlers
 */
export function useBracketNavigation(
  options: UseBracketNavigationOptions
): UseBracketNavigationReturn {
  const { rounds, autoNavigateToIncomplete = true } = options;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Auto-navigate to first incomplete round on mount
  useEffect(() => {
    if (autoNavigateToIncomplete && rounds.length > 0) {
      const firstIncompleteIndex = rounds.findIndex((r) =>
        r.matches.some((m) => m.status !== 'completed' && !m.result?.winnerId)
      );
      if (firstIncompleteIndex >= 0 && firstIncompleteIndex !== currentIndex) {
        setCurrentIndex(firstIncompleteIndex);
      }
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canGoNext = currentIndex < rounds.length - 1;
  const canGoPrev = currentIndex > 0;

  const goToNextRound = useCallback(() => {
    if (canGoNext) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
    }
  }, [canGoNext]);

  const goToPrevRound = useCallback(() => {
    if (canGoPrev) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  }, [canGoPrev]);

  const setRoundIndex = useCallback(
    (index: number) => {
      if (index >= 0 && index < rounds.length && index !== currentIndex) {
        setDirection(index > currentIndex ? 1 : -1);
        setCurrentIndex(index);
      }
    },
    [currentIndex, rounds.length]
  );

  const swipeHandlers = useSwipeable({
    onSwipedLeft: goToNextRound,
    onSwipedRight: goToPrevRound,
    trackMouse: false,
    trackTouch: true,
    delta: 50, // Minimum swipe distance
    swipeDuration: 500, // Maximum swipe duration
    preventScrollOnSwipe: true,
  });

  return useMemo(
    () => ({
      currentRoundIndex: currentIndex,
      totalRounds: rounds.length,
      currentRound: rounds[currentIndex] || null,
      setRoundIndex,
      swipeHandlers,
      goToNextRound,
      goToPrevRound,
      canGoNext,
      canGoPrev,
      direction,
    }),
    [
      currentIndex,
      rounds,
      setRoundIndex,
      swipeHandlers,
      goToNextRound,
      goToPrevRound,
      canGoNext,
      canGoPrev,
      direction,
    ]
  );
}

/**
 * Get round display name (French)
 */
export function getRoundDisplayName(round: Round, index: number, total: number): string {
  // Use round.name if defined, otherwise generate
  if (round.name) return round.name;

  if (index === total - 1) return 'Finale';
  if (index === total - 2 && total > 2) return 'Demi-finales';
  if (index === total - 3 && total > 3) return 'Quarts de finale';

  return `Round ${index + 1}`;
}

import { TennisMatchModal } from '../TennisMatchModal';
import type { SportMatchModalProps } from '@/sports/core/types';

/**
 * Wrapper component that adapts TennisMatchModal to the SportMatchModalProps interface.
 *
 * This allows the existing TennisMatchModal to be used through the plugin system
 * without modifying its original implementation.
 */
export function TennisMatchModalWrapper({
  isOpen,
  onClose,
  match,
  tournament,
  // onUpdateResult,
}: SportMatchModalProps) {
  // TennisMatchModal uses its own internal logic for updating results
  // through useTournamentStore, so we don't need to pass onUpdateResult
  // However, we need to extract the player IDs from the match

  if (!match.player1Id || !match.player2Id) {
    return null;
  }

  return (
    <TennisMatchModal
      isOpen={isOpen}
      onClose={onClose}
      matchId={match.id}
      player1Id={match.player1Id}
      player2Id={match.player2Id}
      tournament={tournament}
    />
  );
}

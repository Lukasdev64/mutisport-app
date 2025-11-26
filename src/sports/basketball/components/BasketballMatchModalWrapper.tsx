import { BasketballMatchModal } from '../BasketballMatchModal';
import type { SportMatchModalProps } from '@/sports/core/types';

/**
 * Wrapper component that adapts BasketballMatchModal to the SportMatchModalProps interface.
 */
export function BasketballMatchModalWrapper({
  isOpen,
  onClose,
  match,
  tournament,
  onUpdateResult,
}: SportMatchModalProps) {
  return (
    <BasketballMatchModal
      isOpen={isOpen}
      onClose={onClose}
      match={match}
      onUpdateResult={onUpdateResult}
    />
  );
}

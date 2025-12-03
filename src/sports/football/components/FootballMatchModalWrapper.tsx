import { FootballMatchModal } from './FootballMatchModal';
import type { SportMatchModalProps } from '@/sports/core/types';

export function FootballMatchModalWrapper({
  isOpen,
  onClose,
  match,
  onUpdateResult,
}: SportMatchModalProps) {
  return (
    <FootballMatchModal
      isOpen={isOpen}
      onClose={onClose}
      match={match}
      onUpdateResult={onUpdateResult}
    />
  );
}

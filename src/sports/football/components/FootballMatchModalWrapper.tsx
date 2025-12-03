import { FootballMatchModal } from './FootballMatchModal';
import type { SportMatchModalProps } from '@/sports/core/types';

export function FootballMatchModalWrapper({
  isOpen,
  onClose,
  match,
  tournament,
  onUpdateResult,
}: SportMatchModalProps) {
  return (
    <FootballMatchModal
      isOpen={isOpen}
      onClose={onClose}
      match={match}
      tournamentId={tournament.id}
      onUpdateResult={onUpdateResult}
    />
  );
}

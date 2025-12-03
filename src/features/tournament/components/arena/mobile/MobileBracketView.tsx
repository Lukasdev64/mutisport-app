import { GitBranch } from 'lucide-react';
import { BracketRoundCarousel } from './bracket';
import type { MobileBracketViewProps } from '@/types/arena';

/**
 * Mobile-native bracket view with horizontal swipe carousel.
 * Users swipe left/right to navigate between tournament rounds.
 * Replaces the old pinch-to-zoom desktop-style approach.
 */
export function MobileBracketView({
  tournament,
  onMatchSelect,
}: MobileBracketViewProps) {
  // Empty state - no rounds generated yet
  if (tournament.rounds.length === 0) {
    return (
      <div className="relative h-full w-full bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <GitBranch className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-sm">Bracket non généré</p>
        <p className="text-xs text-slate-500 mt-1">
          Lancez le tournoi pour générer le bracket
        </p>
      </div>
    );
  }

  return (
    <BracketRoundCarousel
      rounds={tournament.rounds}
      players={tournament.players}
      format={tournament.format}
      onMatchSelect={onMatchSelect}
    />
  );
}

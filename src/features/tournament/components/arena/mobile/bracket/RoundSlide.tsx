import { useMemo } from 'react';
import { BracketMatchCard } from './BracketMatchCard';
import { getRoundDisplayName } from '@/hooks/useBracketNavigation';
import type { Round, Player, Match, TournamentFormat } from '@/types/tournament';

interface RoundSlideProps {
  round: Round;
  roundIndex: number;
  totalRounds: number;
  players: Player[];
  format: TournamentFormat;
  onMatchSelect: (match: Match) => void;
}

interface LayoutConfig {
  columns: 1 | 2;
  cardSize: 'large' | 'compact';
  gap: string;
}

/**
 * Get optimal layout based on number of matches in round
 */
function getLayoutConfig(matchCount: number): LayoutConfig {
  if (matchCount <= 2) {
    return { columns: 1, cardSize: 'large', gap: 'gap-4' };
  }
  if (matchCount <= 4) {
    return { columns: 1, cardSize: 'large', gap: 'gap-3' };
  }
  if (matchCount <= 8) {
    return { columns: 1, cardSize: 'compact', gap: 'gap-2' };
  }
  // 9+ matches: use 2-column grid
  return { columns: 2, cardSize: 'compact', gap: 'gap-2' };
}

/**
 * Single round view displaying all matches in an adaptive grid layout.
 * Used within BracketRoundCarousel for swipeable round navigation.
 */
export function RoundSlide({
  round,
  roundIndex,
  totalRounds,
  players,
  format,
  onMatchSelect,
}: RoundSlideProps) {
  const layout = useMemo(
    () => getLayoutConfig(round.matches.length),
    [round.matches.length]
  );

  const getPlayer = (playerId?: string): Player | undefined => {
    return players.find((p) => p.id === playerId);
  };

  const isLastRound = roundIndex === totalRounds - 1;
  const isSingleElimination = format === 'single_elimination';

  // Stats for the round
  const completedCount = round.matches.filter(
    (m) => m.status === 'completed' || m.result?.winnerId
  ).length;
  const liveCount = round.matches.filter(
    (m) => m.status === 'in_progress' || m.status === 'active'
  ).length;

  return (
    <div className="h-full overflow-y-auto custom-scrollbar-mobile px-4 py-4 pb-24">
      {/* Round Header */}
      <div className="mb-4 text-center">
        <h2 className="text-lg font-semibold text-white">
          {getRoundDisplayName(round, roundIndex, totalRounds)}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {round.matches.length} match{round.matches.length > 1 ? 's' : ''}
          {completedCount > 0 && ` • ${completedCount} terminé${completedCount > 1 ? 's' : ''}`}
          {liveCount > 0 && (
            <span className="text-emerald-400"> • {liveCount} en cours</span>
          )}
        </p>
      </div>

      {/* Matches Grid */}
      <div
        className={`grid ${layout.gap} ${
          layout.columns === 2 ? 'grid-cols-2' : 'grid-cols-1'
        }`}
      >
        {round.matches.map((match, matchIndex) => (
          <BracketMatchCard
            key={match.id}
            match={match}
            player1={getPlayer(match.player1Id)}
            player2={getPlayer(match.player2Id)}
            size={layout.cardSize}
            showProgression={isSingleElimination}
            matchNumber={matchIndex + 1}
            isLastRound={isLastRound}
            onTap={() => onMatchSelect(match)}
          />
        ))}
      </div>

      {/* Empty round message */}
      {round.matches.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <p className="text-sm">Aucun match dans ce round</p>
        </div>
      )}
    </div>
  );
}

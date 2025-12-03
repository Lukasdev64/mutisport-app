import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePinchZoom } from '@/hooks/usePinchZoom';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';
import type { MobileBracketViewProps } from '@/types/arena';
import type { Match, Round, Player } from '@/types/tournament';

/**
 * Mobile-optimized bracket view with pinch-to-zoom and pan.
 * Supports single elimination and round robin formats.
 */
export function MobileBracketView({
  tournament,
  onMatchSelect,
}: MobileBracketViewProps) {
  const { scale, x, y, currentScale, handlers, zoomIn, zoomOut, resetZoom } =
    usePinchZoom({
      minScale: 0.5,
      maxScale: 2.5,
      initialScale: 0.8, // Start slightly zoomed out to show more
    });

  const getPlayer = useCallback(
    (playerId?: string): Player | undefined => {
      return tournament.players.find((p) => p.id === playerId);
    },
    [tournament.players]
  );

  const isRoundRobin = tournament.format === 'round_robin';

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950 no-select">
      {/* Zoomable content */}
      <motion.div
        style={{ scale, x, y }}
        className="absolute inset-0 origin-center"
        {...handlers}
      >
        <div className="absolute inset-0 flex items-center justify-center p-8">
          {isRoundRobin ? (
            <RoundRobinBracket
              rounds={tournament.rounds}
              getPlayer={getPlayer}
              onMatchSelect={onMatchSelect}
            />
          ) : (
            <SingleEliminationBracket
              rounds={tournament.rounds}
              getPlayer={getPlayer}
              onMatchSelect={onMatchSelect}
            />
          )}
        </div>
      </motion.div>

      {/* Zoom controls overlay - positioned above the FAB */}
      <div className="absolute bottom-40 right-4 flex flex-col gap-2 z-20">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={zoomIn}
          disabled={currentScale >= 2.5}
          className="w-12 h-12 rounded-full bg-slate-800/90 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white disabled:opacity-50 touch-target"
        >
          <ZoomIn className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={zoomOut}
          disabled={currentScale <= 0.5}
          className="w-12 h-12 rounded-full bg-slate-800/90 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white disabled:opacity-50 touch-target"
        >
          <ZoomOut className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={resetZoom}
          className="w-12 h-12 rounded-full bg-slate-800/90 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white touch-target"
        >
          <Maximize2 className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute top-4 right-4 px-2 py-1 rounded bg-slate-800/80 text-xs text-slate-400">
        {Math.round(currentScale * 100)}%
      </div>

      {/* Empty state */}
      {tournament.rounds.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
          <GitBranch className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-sm">Bracket non généré</p>
          <p className="text-xs text-slate-500">
            Lancez le tournoi pour générer le bracket
          </p>
        </div>
      )}
    </div>
  );
}

interface BracketProps {
  rounds: Round[];
  getPlayer: (id?: string) => Player | undefined;
  onMatchSelect: (match: Match) => void;
}

function SingleEliminationBracket({
  rounds,
  getPlayer,
  onMatchSelect,
}: BracketProps) {
  return (
    <div className="flex items-center min-w-max min-h-[400px]">
      {rounds.map((round, roundIndex) => {
        const isLastRound = roundIndex === rounds.length - 1;

        return (
          <div key={round.id} className="flex flex-row h-full">
            {/* Matches Column */}
            <div className="flex flex-col justify-around w-48 relative z-10">
              {/* Round header */}
              <div className="absolute -top-8 left-0 w-full text-center">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {round.name}
                </span>
              </div>

              {/* Matches */}
              {round.matches.map((match) => (
                <MobileBracketMatchCard
                  key={match.id}
                  match={match}
                  player1={getPlayer(match.player1Id)}
                  player2={getPlayer(match.player2Id)}
                  onTap={() => onMatchSelect(match)}
                />
              ))}
            </div>

            {/* Connectors Column (if not last round) */}
            {!isLastRound && (
              <div className="flex flex-col justify-around w-10">
                {Array.from({ length: Math.floor(round.matches.length / 2) }).map((_, i) => (
                  <div
                    key={i}
                    className="relative border-r border-t border-b border-white/20"
                    style={{
                      height: `${100 / round.matches.length}%`,
                      minHeight: '60px',
                      width: '50%'
                    }}
                  >
                    {/* Line to next match */}
                    <div className="absolute top-1/2 -right-5 w-5 border-b border-white/20" />
                  </div>
                ))}
                {/* Handle odd match if any (straight line) */}
                {round.matches.length % 2 !== 0 && (
                  <div className="relative h-px border-b border-white/20 w-full" />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RoundRobinBracket({ rounds, getPlayer, onMatchSelect }: BracketProps) {
  return (
    <div className="grid grid-cols-1 gap-6 min-w-max">
      {rounds.map((round) => (
        <div key={round.id} className="space-y-2">
          {/* Round header */}
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
            {round.name}
          </div>

          {/* Matches in row */}
          <div className="flex flex-wrap gap-3">
            {round.matches.map((match) => (
              <MobileBracketMatchCard
                key={match.id}
                match={match}
                player1={getPlayer(match.player1Id)}
                player2={getPlayer(match.player2Id)}
                onTap={() => onMatchSelect(match)}
                compact
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface MobileBracketMatchCardProps {
  match: Match;
  player1?: Player;
  player2?: Player;
  onTap: () => void;
  compact?: boolean;
}

function MobileBracketMatchCard({
  match,
  player1,
  player2,
  onTap,
  compact = false,
}: MobileBracketMatchCardProps) {
  const isComplete = !!match.result?.winnerId;
  const isLive = match.status === 'in_progress' || match.status === 'active';

  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      onClick={onTap}
      className={cn(
        'bg-slate-900/80 rounded-lg border overflow-hidden cursor-pointer transition-colors',
        isLive && 'border-emerald-500/50 shadow-lg shadow-emerald-500/10',
        isComplete && 'border-white/5',
        !isLive && !isComplete && 'border-white/10 hover:border-white/20',
        compact ? 'w-40' : 'w-48'
      )}
    >
      {/* Live indicator */}
      {isLive && (
        <div className="bg-emerald-500 text-black text-[10px] font-bold text-center py-0.5">
          EN COURS
        </div>
      )}

      {/* Players */}
      <div className="p-2 space-y-1">
        <PlayerSlot
          player={player1}
          score={match.result?.player1Score}
          isWinner={match.result?.winnerId === player1?.id}
          compact={compact}
        />
        <div className="border-t border-white/5" />
        <PlayerSlot
          player={player2}
          score={match.result?.player2Score}
          isWinner={match.result?.winnerId === player2?.id}
          compact={compact}
        />
      </div>
    </motion.div>
  );
}

interface PlayerSlotProps {
  player?: Player;
  score?: number;
  isWinner: boolean;
  compact: boolean;
}

function PlayerSlot({ player, score, isWinner, compact }: PlayerSlotProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 py-1',
        isWinner && 'text-emerald-400'
      )}
    >
      <PlayerAvatar name={player?.name || 'TBD'} className="w-5 h-5 text-[8px]" />
      <span
        className={cn(
          'flex-1 truncate text-xs font-medium',
          isWinner ? 'text-emerald-400' : player ? 'text-white' : 'text-slate-500',
          compact && 'text-[10px]'
        )}
      >
        {player?.name || 'TBD'}
      </span>
      {score !== undefined && (
        <span
          className={cn(
            'text-sm font-bold tabular-nums',
            isWinner ? 'text-emerald-400' : 'text-slate-300'
          )}
        >
          {score}
        </span>
      )}
    </div>
  );
}

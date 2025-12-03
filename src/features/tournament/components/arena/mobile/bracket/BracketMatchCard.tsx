import { motion } from 'framer-motion';
import { Check, Trophy, ChevronRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';
import type { Match, Player } from '@/types/tournament';
import { getMatchDisplayStatus } from '@/types/arena';

interface BracketMatchCardProps {
  match: Match;
  player1?: Player;
  player2?: Player;
  size: 'large' | 'compact';
  showProgression?: boolean;
  matchNumber?: number;
  isLastRound?: boolean;
  onTap: () => void;
}

/**
 * Bracket-optimized match card with compact layout and progression badges.
 * Designed for carousel round view with adaptive sizing.
 */
export function BracketMatchCard({
  match,
  player1,
  player2,
  size,
  showProgression = false,
  matchNumber,
  isLastRound = false,
  onTap,
}: BracketMatchCardProps) {
  const status = getMatchDisplayStatus(match);
  const isComplete = status === 'completed';
  const isLive = status === 'live';
  const isCompact = size === 'compact';

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onTap}
      className={cn(
        'relative bg-slate-900/80 rounded-xl border overflow-hidden cursor-pointer transition-colors touch-target',
        isLive && 'border-emerald-500/50 shadow-lg shadow-emerald-500/10',
        isComplete && 'border-white/5',
        !isLive && !isComplete && 'border-white/10'
      )}
    >
      {/* Match Number Badge (top-left corner) */}
      {matchNumber && (
        <div className="absolute top-2 left-2 text-[10px] text-slate-500 font-mono z-10">
          #{matchNumber}
        </div>
      )}

      {/* Live Indicator Banner */}
      {isLive && (
        <div className="bg-emerald-500 text-black text-[10px] font-bold text-center py-1 flex items-center justify-center gap-1">
          <Zap className="w-3 h-3" />
          EN COURS
        </div>
      )}

      {/* Players Section */}
      <div className={cn('space-y-1', isCompact ? 'p-2' : 'p-3')}>
        <PlayerSlot
          player={player1}
          score={match.result?.player1Score}
          isWinner={match.result?.winnerId === player1?.id}
          size={size}
        />

        <div className="border-t border-white/5" />

        <PlayerSlot
          player={player2}
          score={match.result?.player2Score}
          isWinner={match.result?.winnerId === player2?.id}
          size={size}
        />
      </div>

      {/* Progression Badge (shown for single elimination completed matches) */}
      {showProgression && isComplete && (
        <ProgressionBadge isLastRound={isLastRound} isCompact={isCompact} />
      )}
    </motion.div>
  );
}

interface PlayerSlotProps {
  player?: Player;
  score?: number;
  isWinner: boolean;
  size: 'large' | 'compact';
}

function PlayerSlot({ player, score, isWinner, size }: PlayerSlotProps) {
  const isCompact = size === 'compact';

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        isCompact ? 'py-1' : 'py-1.5'
      )}
    >
      {/* Winner Check Icon */}
      {isWinner && (
        <Check
          className={cn(
            'flex-shrink-0 text-emerald-400',
            isCompact ? 'w-3 h-3' : 'w-4 h-4'
          )}
        />
      )}

      {/* Avatar */}
      <PlayerAvatar
        name={player?.name || 'TBD'}
        className={cn(
          isCompact ? 'w-5 h-5 text-[8px]' : 'w-6 h-6 text-[10px]'
        )}
      />

      {/* Name */}
      <span
        className={cn(
          'flex-1 truncate font-medium',
          isCompact ? 'text-xs' : 'text-sm',
          isWinner
            ? 'text-emerald-400'
            : player
              ? 'text-white'
              : 'text-slate-500 italic'
        )}
      >
        {player?.name || 'À déterminer'}
      </span>

      {/* Score */}
      {score !== undefined && (
        <span
          className={cn(
            'font-bold tabular-nums',
            isCompact ? 'text-sm' : 'text-lg',
            isWinner ? 'text-emerald-400' : 'text-slate-300'
          )}
        >
          {score}
        </span>
      )}
    </div>
  );
}

interface ProgressionBadgeProps {
  isLastRound: boolean;
  isCompact: boolean;
}

function ProgressionBadge({ isLastRound, isCompact }: ProgressionBadgeProps) {
  if (isLastRound) {
    return (
      <div
        className={cn(
          'flex items-center justify-center gap-1 border-t border-white/5 bg-yellow-500/10',
          isCompact ? 'px-2 py-1' : 'px-3 py-1.5'
        )}
      >
        <Trophy className="w-3 h-3 text-yellow-400" />
        <span className="text-[10px] text-yellow-400 font-medium">
          Vainqueur
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-1 border-t border-white/5 bg-emerald-500/10',
        isCompact ? 'px-2 py-1' : 'px-3 py-1.5'
      )}
    >
      <ChevronRight className="w-3 h-3 text-emerald-400" />
      <span className="text-[10px] text-emerald-400 font-medium">
        Qualifié
      </span>
    </div>
  );
}

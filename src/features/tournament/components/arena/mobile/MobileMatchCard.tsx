import { motion } from 'framer-motion';
import { MapPin, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';
import type { MobileMatchCardProps } from '@/types/arena';
import { getMatchDisplayStatus } from '@/types/arena';

/**
 * Mobile-optimized match card with large touch targets.
 * Full-width card showing players, score, status, and quick actions.
 */
export function MobileMatchCard({
  match,
  player1,
  player2,
  role,
  onTap,
  onQuickScore,
}: MobileMatchCardProps) {
  const status = getMatchDisplayStatus(match);
  const isLive = status === 'live';
  const isCompleted = status === 'completed';
  const canScore = (role === 'organizer' || role === 'referee') && !isCompleted;

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onTap}
      className={cn(
        'relative bg-slate-900/80 rounded-xl border p-4 touch-target touch-ripple',
        isLive && 'border-emerald-500/50 shadow-lg shadow-emerald-500/10',
        isCompleted && 'border-white/5 opacity-75',
        !isLive && !isCompleted && 'border-white/10'
      )}
    >
      {/* Status badge */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Time */}
          {match.scheduledAt && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              {new Date(match.scheduledAt).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}

          {/* Live indicator */}
          {isLive && (
            <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-emerald-500 text-black rounded animate-pulse">
              <Zap className="w-3 h-3" />
              LIVE
            </span>
          )}

          {/* Completed indicator */}
          {isCompleted && (
            <span className="px-2 py-0.5 text-xs font-medium bg-slate-700 text-slate-300 rounded">
              Terminé
            </span>
          )}
        </div>

        {/* Location */}
        {match.location && (
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin className="w-3 h-3" />
            {match.location}
          </span>
        )}
      </div>

      {/* Players */}
      <div className="space-y-3">
        {/* Player 1 */}
        <PlayerRow
          player={player1}
          score={match.result?.player1Score}
          isWinner={match.result?.winnerId === player1?.id}
        />

        {/* VS Divider or Player 2 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          {!isCompleted && (
            <div className="relative flex justify-center">
              <span className="bg-slate-900 px-2 text-xs text-slate-500">vs</span>
            </div>
          )}
        </div>

        {/* Player 2 */}
        <PlayerRow
          player={player2}
          score={match.result?.player2Score}
          isWinner={match.result?.winnerId === player2?.id}
        />
      </div>

      {/* Quick Score Button (Referee/Organizer only) */}
      {canScore && onQuickScore && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onQuickScore();
          }}
          className="mt-4 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium touch-target flex items-center justify-center gap-2 transition-colors"
        >
          <Zap className="w-4 h-4" />
          Scorer ce match
        </motion.button>
      )}
    </motion.div>
  );
}

interface PlayerRowProps {
  player?: { id: string; name: string };
  score?: number;
  isWinner: boolean;
}

function PlayerRow({ player, score, isWinner }: PlayerRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3',
        isWinner && 'text-emerald-400'
      )}
    >
      {/* Avatar */}
      <PlayerAvatar
        name={player?.name || 'TBD'}
        className="w-8 h-8 flex-shrink-0"
      />

      {/* Name */}
      <div className="flex-1 min-w-0">
        <span
          className={cn(
            'font-medium truncate block',
            isWinner ? 'text-emerald-400' : 'text-white',
            !player && 'text-slate-500 italic'
          )}
        >
          {player?.name || 'À déterminer'}
        </span>
      </div>

      {/* Score */}
      {score !== undefined && (
        <span
          className={cn(
            'text-xl font-bold tabular-nums',
            isWinner ? 'text-emerald-400' : 'text-white'
          )}
        >
          {score}
        </span>
      )}
    </div>
  );
}

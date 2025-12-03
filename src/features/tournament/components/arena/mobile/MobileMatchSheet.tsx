import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, Clock, MapPin, Zap, Trophy, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';
import { Button } from '@/components/ui/button';
import { MatchModal } from '../MatchModal';
import type { MobileMatchSheetProps } from '@/types/arena';
import { getMatchDisplayStatus } from '@/types/arena';

/**
 * Mobile bottom sheet for match details and scoring.
 * Draggable sheet that can be dismissed by swiping down.
 * Shows scoring interface for referees/organizers, read-only view for spectators.
 */
export function MobileMatchSheet({
  match,
  tournament,
  role,
  isOpen,
  onClose,
}: MobileMatchSheetProps) {
  const dragControls = useDragControls();
  const canScore = role === 'organizer' || role === 'referee';

  // État pour contrôler l'ouverture du modal de scoring
  const [isScoringModalOpen, setIsScoringModalOpen] = useState(false);

  // Get players
  const player1 = tournament.players.find((p) => p.id === match?.player1Id);
  const player2 = tournament.players.find((p) => p.id === match?.player2Id);

  // Get match status
  const status = match ? getMatchDisplayStatus(match) : 'upcoming';
  const isLive = status === 'live';
  const isCompleted = status === 'completed';

  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle drag end
  const handleDragEnd = useCallback(
    (_: never, info: { offset: { y: number } }) => {
      if (info.offset.y > 100) {
        onClose();
      }
    },
    [onClose]
  );

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && match && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 rounded-t-3xl max-h-[85vh] flex flex-col safe-area-bottom"
          >
            {/* Drag handle */}
            <div
              className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
              style={{ touchAction: 'none' }}
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="sheet-handle" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-white">
                  Détails du match
                </h2>
                {isLive && (
                  <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-emerald-500 text-black rounded">
                    <Zap className="w-3 h-3" />
                    LIVE
                  </span>
                )}
                {isCompleted && (
                  <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-slate-700 text-slate-300 rounded">
                    <Trophy className="w-3 h-3" />
                    Terminé
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar-mobile">
              {/* Match info - pb-24 pour compenser la barre de navigation */}
              <div className="p-4 pb-24 space-y-4">
                {/* Time & Location */}
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  {match.scheduledAt && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(match.scheduledAt).toLocaleString('fr-FR', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                  {match.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {match.location}
                    </span>
                  )}
                </div>

                {/* Players display */}
                <div className="bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    {/* Player 1 */}
                    <PlayerDisplay
                      player={player1}
                      score={match.result?.player1Score}
                      isWinner={match.result?.winnerId === player1?.id}
                    />

                    {/* VS */}
                    <div className="px-4">
                      <span className="text-2xl font-bold text-slate-600">VS</span>
                    </div>

                    {/* Player 2 */}
                    <PlayerDisplay
                      player={player2}
                      score={match.result?.player2Score}
                      isWinner={match.result?.winnerId === player2?.id}
                      reverse
                    />
                  </div>
                </div>

                {/* Scoring section - only for referees/organizers */}
                {canScore && !isCompleted && (
                  <div className="mt-4 p-4 bg-slate-800/50 rounded-xl">
                    <Button
                      onClick={() => setIsScoringModalOpen(true)}
                      className="w-full py-6 bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-semibold"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Scorer ce match
                    </Button>
                    <MatchModal
                      match={match}
                      tournament={tournament}
                      isOpen={isScoringModalOpen}
                      onClose={() => {
                        setIsScoringModalOpen(false);
                        // Optionnel: fermer aussi le sheet parent si le match est terminé
                      }}
                    />
                  </div>
                )}

                {/* Read-only result for spectators or completed matches */}
                {(!canScore || isCompleted) && match.result && (
                  <MatchResultDisplay match={match} tournament={tournament} />
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface PlayerDisplayProps {
  player?: { id: string; name: string };
  score?: number;
  isWinner: boolean;
  reverse?: boolean;
}

function PlayerDisplay({ player, score, isWinner, reverse }: PlayerDisplayProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-2 flex-1',
        reverse && 'items-center'
      )}
    >
      <PlayerAvatar
        name={player?.name || 'TBD'}
        className={cn(
          'w-16 h-16 text-xl ring-2 ring-offset-2 ring-offset-slate-900',
          isWinner ? 'ring-emerald-500' : 'ring-transparent'
        )}
      />
      <span
        className={cn(
          'font-medium text-center truncate max-w-[100px]',
          isWinner ? 'text-emerald-400' : player ? 'text-white' : 'text-slate-500'
        )}
      >
        {player?.name || 'TBD'}
      </span>
      {score !== undefined && (
        <span
          className={cn(
            'text-3xl font-bold tabular-nums',
            isWinner ? 'text-emerald-400' : 'text-white'
          )}
        >
          {score}
        </span>
      )}
    </div>
  );
}

interface MatchResultDisplayProps {
  match: NonNullable<MobileMatchSheetProps['match']>;
  tournament: MobileMatchSheetProps['tournament'];
}

function MatchResultDisplay({ match, tournament }: MatchResultDisplayProps) {
  const winner = tournament.players.find((p) => p.id === match.result?.winnerId);
  const player1 = tournament.players.find((p) => p.id === match.player1Id);
  const player2 = tournament.players.find((p) => p.id === match.player2Id);

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
      <h3 className="text-sm font-medium text-slate-400">Résultat</h3>

      {/* Score display */}
      {match.result && (
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <span className={cn(
              'text-2xl font-bold',
              match.result.winnerId === player1?.id ? 'text-emerald-400' : 'text-white'
            )}>
              {match.result.player1Score ?? '-'}
            </span>
          </div>
          <span className="text-slate-500">-</span>
          <div className="text-center">
            <span className={cn(
              'text-2xl font-bold',
              match.result.winnerId === player2?.id ? 'text-emerald-400' : 'text-white'
            )}>
              {match.result.player2Score ?? '-'}
            </span>
          </div>
        </div>
      )}

      {/* Winner */}
      {winner && (
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/10">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <span className="font-medium text-yellow-400">
            {winner.name} remporte le match
          </span>
        </div>
      )}
    </div>
  );
}

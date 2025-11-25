import { motion, AnimatePresence } from 'framer-motion';
import { Undo2, Check, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTennisScore, getTiebreakDisplay } from '../hooks/useTennisScore';
import type { TennisMatchConfig, TennisMatchScore } from '@/types/tennis';

interface TennisLiveScoringProps {
  config: TennisMatchConfig;
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  initialScore?: TennisMatchScore;
  onMatchComplete: (score: TennisMatchScore) => void;
  onCancel: () => void;
}

export function TennisLiveScoring({
  config,
  player1Id,
  player2Id,
  player1Name,
  player2Name,
  initialScore,
  onMatchComplete,
  onCancel
}: TennisLiveScoringProps) {
  const {
    score,
    awardPoint,
    undo,
    canUndo,
    isComplete,
    winnerId,
    currentGameDisplay,
    setsDisplay,
    servingPlayer
  } = useTennisScore({
    config,
    player1Id,
    player2Id,
    initialScore,
    onMatchComplete
  });

  const tiebreakDisplay = getTiebreakDisplay(score);
  const currentSet = score.sets[score.currentSet];
  const isTiebreak = currentSet?.isTiebreak;

  // Determine winner name
  const winnerName = winnerId === player1Id ? player1Name : player2Name;

  return (
    <div className="flex flex-col h-full">
      {/* Match Complete Overlay */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-center p-8"
            >
              <Trophy className="w-20 h-20 mx-auto text-yellow-400 mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">Match Terminé</h2>
              <p className="text-xl text-emerald-400 font-semibold mb-2">{winnerName}</p>
              <p className="text-lg text-slate-300 mb-6">{setsDisplay}</p>
              <Button
                onClick={() => onMatchComplete(score)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 text-lg"
              >
                <Check className="w-5 h-5 mr-2" />
                Confirmer
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Score Header */}
      <div className="bg-slate-800/80 border-b border-slate-700 px-4 py-3">
        {/* Sets Score */}
        <div className="flex items-center justify-center gap-4 mb-2">
          <span className="text-sm text-slate-400">SETS</span>
          <div className="flex items-center gap-2">
            <span className="score-text-lg font-bold text-white">{score.player1Sets}</span>
            <span className="text-slate-500">-</span>
            <span className="score-text-lg font-bold text-white">{score.player2Sets}</span>
          </div>
        </div>

        {/* Games in Current Set */}
        <div className="flex items-center justify-center gap-4">
          <span className="text-xs text-slate-500 uppercase">Jeux</span>
          <div className="flex items-center gap-2 text-lg">
            <span className="text-white font-medium">{currentSet?.player1Games ?? 0}</span>
            <span className="text-slate-500">-</span>
            <span className="text-white font-medium">{currentSet?.player2Games ?? 0}</span>
          </div>
          {isTiebreak && tiebreakDisplay && (
            <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded">
              TB: {tiebreakDisplay}
            </span>
          )}
        </div>

        {/* Previous Sets Summary */}
        {score.sets.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-2 text-xs text-slate-500">
            {score.sets.slice(0, score.currentSet).map((set, idx) => (
              <span key={idx} className="px-2 py-1 bg-slate-900 rounded">
                {set.player1Games}-{set.player2Games}
                {set.isTiebreak && set.tiebreakScore && ` (${set.tiebreakScore.player1}-${set.tiebreakScore.player2})`}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Scoring Area */}
      <div className="flex-1 flex flex-col p-4 gap-4">
        {/* Current Game Score Display */}
        {!isTiebreak && (
          <div className="text-center py-4">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Points du Jeu</div>
            <div className="flex items-center justify-center gap-6">
              <motion.span
                key={`p1-${currentGameDisplay.p1}`}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="score-text-xl font-bold text-emerald-400"
              >
                {currentGameDisplay.p1}
              </motion.span>
              <span className="text-2xl text-slate-600">-</span>
              <motion.span
                key={`p2-${currentGameDisplay.p2}`}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="score-text-xl font-bold text-blue-400"
              >
                {currentGameDisplay.p2}
              </motion.span>
            </div>
          </div>
        )}

        {/* Tiebreak Score Display */}
        {isTiebreak && tiebreakDisplay && (
          <div className="text-center py-4">
            <div className="text-xs text-amber-400 uppercase tracking-wider mb-2">Tie-Break</div>
            <div className="flex items-center justify-center gap-6">
              <span className="score-text-xl font-bold text-emerald-400">
                {currentSet.tiebreakScore?.player1 ?? 0}
              </span>
              <span className="text-2xl text-slate-600">-</span>
              <span className="score-text-xl font-bold text-blue-400">
                {currentSet.tiebreakScore?.player2 ?? 0}
              </span>
            </div>
          </div>
        )}

        {/* Player Scoring Buttons */}
        <div className="flex-1 grid grid-cols-2 gap-4">
          {/* Player 1 Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => awardPoint(1)}
            disabled={isComplete}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-2xl border-2 transition-all touch-target-score no-zoom",
              "bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/20",
              "active:bg-emerald-500/30",
              isComplete && "opacity-50 cursor-not-allowed"
            )}
          >
            {servingPlayer === 1 && (
              <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50" />
            )}
            <span className="text-emerald-400 text-sm font-medium uppercase tracking-wide mb-2">
              {player1Name}
            </span>
            <span className="text-4xl font-bold text-white">POINT</span>
          </motion.button>

          {/* Player 2 Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => awardPoint(2)}
            disabled={isComplete}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-2xl border-2 transition-all touch-target-score no-zoom",
              "bg-blue-500/10 border-blue-500/30 hover:border-blue-500/50 hover:bg-blue-500/20",
              "active:bg-blue-500/30",
              isComplete && "opacity-50 cursor-not-allowed"
            )}
          >
            {servingPlayer === 2 && (
              <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50" />
            )}
            <span className="text-blue-400 text-sm font-medium uppercase tracking-wide mb-2">
              {player2Name}
            </span>
            <span className="text-4xl font-bold text-white">POINT</span>
          </motion.button>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex gap-3 p-4 border-t border-slate-700 bg-slate-800/50">
        <Button
          variant="ghost"
          onClick={undo}
          disabled={!canUndo}
          className={cn(
            "flex-1 py-6 touch-target",
            canUndo ? "text-white hover:bg-slate-700" : "text-slate-600"
          )}
        >
          <Undo2 className="w-5 h-5 mr-2" />
          Annuler
        </Button>

        <Button
          variant="ghost"
          onClick={onCancel}
          className="flex-1 py-6 text-slate-400 hover:text-white hover:bg-slate-700 touch-target"
        >
          Quitter
        </Button>

        {isComplete && (
          <Button
            onClick={() => onMatchComplete(score)}
            className="flex-1 py-6 bg-emerald-600 hover:bg-emerald-500 text-white touch-target"
          >
            <Check className="w-5 h-5 mr-2" />
            Terminer
          </Button>
        )}
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TennisSetScore } from '@/types/tennis';

interface GameScoreEditorProps {
  currentSet: TennisSetScore;
  setIndex: number;
  onGameChange: (p1Games: number, p2Games: number) => void;
  onAdjustGame: (player: 1 | 2, delta: 1 | -1) => void;
  player1Name?: string;
  player2Name?: string;
}

export function GameScoreEditor({
  currentSet,
  setIndex,
  onAdjustGame,
  player1Name,
  player2Name
}: GameScoreEditorProps) {
  const p1Games = currentSet.player1Games;
  const p2Games = currentSet.player2Games;
  const isTiebreak = currentSet.isTiebreak;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white">Set {setIndex + 1} en cours</h3>
        <p className="text-sm text-slate-400 mt-1">
          Ajustez le nombre de jeux dans ce set
        </p>
      </div>

      {/* Score actuel */}
      <div className="bg-slate-800/50 rounded-2xl p-6">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
          {/* Player 1 */}
          <div className="text-center">
            <div className="text-sm text-emerald-400 mb-3 font-medium truncate">
              {player1Name || 'Joueur 1'}
            </div>

            <div className="flex flex-col items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => onAdjustGame(1, 1)}
                disabled={p1Games >= 7}
                className={cn(
                  "h-14 w-14 rounded-full touch-target-lg",
                  "bg-emerald-500/20 hover:bg-emerald-500/30 border-2 border-emerald-500/30",
                  "disabled:opacity-30"
                )}
              >
                <Plus className="w-6 h-6 text-emerald-400" />
              </Button>

              <motion.span
                key={p1Games}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-5xl font-bold text-white"
              >
                {p1Games}
              </motion.span>

              <Button
                variant="ghost"
                onClick={() => onAdjustGame(1, -1)}
                disabled={p1Games <= 0}
                className={cn(
                  "h-14 w-14 rounded-full touch-target-lg",
                  "bg-slate-700 hover:bg-slate-600 border-2 border-slate-600",
                  "disabled:opacity-30"
                )}
              >
                <Minus className="w-6 h-6 text-slate-300" />
              </Button>
            </div>
          </div>

          {/* Separator */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl text-slate-600 font-bold">-</span>
            <span className="text-xs text-slate-500 uppercase">Jeux</span>
          </div>

          {/* Player 2 */}
          <div className="text-center">
            <div className="text-sm text-blue-400 mb-3 font-medium truncate">
              {player2Name || 'Joueur 2'}
            </div>

            <div className="flex flex-col items-center gap-3">
              <Button
                variant="ghost"
                onClick={() => onAdjustGame(2, 1)}
                disabled={p2Games >= 7}
                className={cn(
                  "h-14 w-14 rounded-full touch-target-lg",
                  "bg-blue-500/20 hover:bg-blue-500/30 border-2 border-blue-500/30",
                  "disabled:opacity-30"
                )}
              >
                <Plus className="w-6 h-6 text-blue-400" />
              </Button>

              <motion.span
                key={p2Games}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-5xl font-bold text-white"
              >
                {p2Games}
              </motion.span>

              <Button
                variant="ghost"
                onClick={() => onAdjustGame(2, -1)}
                disabled={p2Games <= 0}
                className={cn(
                  "h-14 w-14 rounded-full touch-target-lg",
                  "bg-slate-700 hover:bg-slate-600 border-2 border-slate-600",
                  "disabled:opacity-30"
                )}
              >
                <Minus className="w-6 h-6 text-slate-300" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tiebreak indicator */}
        {isTiebreak && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 pt-4 border-t border-slate-700 text-center"
          >
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm rounded-full">
              Tie-Break en cours
            </span>
          </motion.div>
        )}
      </div>

      {/* Info */}
      <div className="text-xs text-slate-500 text-center">
        <p>Le set est gagné à 6 jeux avec 2 jeux d'écart</p>
        <p>ou 7-6 après tie-break</p>
      </div>

      {/* Quick set buttons */}
      <div className="space-y-2">
        <div className="text-xs text-slate-400 text-center mb-2">Scores rapides</div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { p1: 6, p2: 0 },
            { p1: 6, p2: 2 },
            { p1: 6, p2: 4 },
            { p1: 7, p2: 5 },
          ].map(({ p1, p2 }) => (
            <Button
              key={`${p1}-${p2}`}
              variant="outline"
              size="sm"
              onClick={() => {
                // Appliquer plusieurs changements pour atteindre ce score
                const diff1 = p1 - p1Games;
                const diff2 = p2 - p2Games;
                for (let i = 0; i < Math.abs(diff1); i++) {
                  onAdjustGame(1, diff1 > 0 ? 1 : -1);
                }
                for (let i = 0; i < Math.abs(diff2); i++) {
                  onAdjustGame(2, diff2 > 0 ? 1 : -1);
                }
              }}
              className="text-xs py-2"
            >
              {p1}-{p2}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { p1: 0, p2: 6 },
            { p1: 2, p2: 6 },
            { p1: 4, p2: 6 },
            { p1: 5, p2: 7 },
          ].map(({ p1, p2 }) => (
            <Button
              key={`${p1}-${p2}`}
              variant="outline"
              size="sm"
              onClick={() => {
                const diff1 = p1 - p1Games;
                const diff2 = p2 - p2Games;
                for (let i = 0; i < Math.abs(diff1); i++) {
                  onAdjustGame(1, diff1 > 0 ? 1 : -1);
                }
                for (let i = 0; i < Math.abs(diff2); i++) {
                  onAdjustGame(2, diff2 > 0 ? 1 : -1);
                }
              }}
              className="text-xs py-2"
            >
              {p1}-{p2}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

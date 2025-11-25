import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { TennisMatchConfig } from '@/types/tennis';

interface TennisScorePreviewProps {
  config: TennisMatchConfig;
  className?: string;
}

/**
 * Shows a preview of how a tennis score will look with the given config
 * Uses realistic example scores based on the format
 */
export function TennisScorePreview({ config, className }: TennisScorePreviewProps) {
  // Generate realistic example score based on config
  const isBestOf5 = config.format === 'best_of_5';

  // Example scores for different formats
  const exampleScores = isBestOf5
    ? {
        sets: [
          { p1: 6, p2: 4 },
          { p1: 3, p2: 6 },
          { p1: 7, p2: 6, tiebreak: { p1: 7, p2: 5 } },
          { p1: 6, p2: 3 }
        ],
        winner: 1,
        setsWon: { p1: 3, p2: 1 }
      }
    : {
        sets: [
          { p1: 6, p2: 4 },
          { p1: 4, p2: 6 },
          { p1: 7, p2: 6, tiebreak: { p1: 10, p2: 8 } }
        ],
        winner: 1,
        setsWon: { p1: 2, p2: 1 }
      };

  // Show super tiebreak score if config has it
  if (config.finalSetTiebreak && config.finalSetTiebreakPoints === 10) {
    const lastSet = exampleScores.sets[exampleScores.sets.length - 1];
    if (lastSet.tiebreak) {
      lastSet.tiebreak = { p1: 10, p2: 8 };
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "bg-slate-900/80 border border-slate-700 rounded-xl p-4 text-center",
        className
      )}
    >
      <div className="text-xs text-slate-500 uppercase tracking-wider mb-3">
        Aperçu du Score
      </div>

      {/* Scoreboard Preview */}
      <div className="bg-slate-800 rounded-lg p-3 inline-block min-w-[200px]">
        {/* Header */}
        <div className="grid grid-cols-[1fr_repeat(5,32px)] gap-1 text-xs text-slate-500 mb-2">
          <div className="text-left">Joueur</div>
          {exampleScores.sets.map((_, idx) => (
            <div key={idx} className="text-center">S{idx + 1}</div>
          ))}
          {!isBestOf5 && <div className="text-center opacity-0">S4</div>}
        </div>

        {/* Player 1 Row */}
        <div className="grid grid-cols-[1fr_repeat(5,32px)] gap-1 items-center mb-1">
          <div className={cn(
            "text-left text-sm font-medium",
            exampleScores.winner === 1 ? "text-emerald-400" : "text-white"
          )}>
            Alice {exampleScores.winner === 1 && "✓"}
          </div>
          {exampleScores.sets.map((set, idx) => (
            <div
              key={idx}
              className={cn(
                "text-center text-sm font-mono",
                set.p1 > set.p2 ? "text-white font-bold" : "text-slate-400"
              )}
            >
              {set.p1}
              {set.tiebreak && (
                <sup className="text-[8px] text-slate-500 ml-0.5">
                  {set.tiebreak.p1}
                </sup>
              )}
            </div>
          ))}
          {!isBestOf5 && exampleScores.sets.length < 4 && (
            <div className="text-center text-slate-700">-</div>
          )}
        </div>

        {/* Player 2 Row */}
        <div className="grid grid-cols-[1fr_repeat(5,32px)] gap-1 items-center">
          <div className={cn(
            "text-left text-sm font-medium",
            exampleScores.winner === 2 ? "text-emerald-400" : "text-white"
          )}>
            Bob {exampleScores.winner === 2 && "✓"}
          </div>
          {exampleScores.sets.map((set, idx) => (
            <div
              key={idx}
              className={cn(
                "text-center text-sm font-mono",
                set.p2 > set.p1 ? "text-white font-bold" : "text-slate-400"
              )}
            >
              {set.p2}
              {set.tiebreak && (
                <sup className="text-[8px] text-slate-500 ml-0.5">
                  {set.tiebreak.p2}
                </sup>
              )}
            </div>
          ))}
          {!isBestOf5 && exampleScores.sets.length < 4 && (
            <div className="text-center text-slate-700">-</div>
          )}
        </div>
      </div>

      {/* Format Info */}
      <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs">
        <span className="px-2 py-1 bg-slate-800 rounded text-slate-300">
          {isBestOf5 ? 'Meilleur des 5' : 'Meilleur des 3'}
        </span>
        {config.decidingPointAtDeuce && (
          <span className="px-2 py-1 bg-purple-500/20 rounded text-purple-300">
            No-Ad
          </span>
        )}
        {config.finalSetTiebreak && (
          <span className="px-2 py-1 bg-amber-500/20 rounded text-amber-300">
            TB: {config.finalSetTiebreakPoints}pts
          </span>
        )}
        {!config.letRule && (
          <span className="px-2 py-1 bg-yellow-500/20 rounded text-yellow-300">
            No-Let
          </span>
        )}
      </div>

      {/* Surface indicator */}
      <div className="mt-2 text-xs text-slate-500">
        Surface: <span className="capitalize text-slate-400">{config.surface}</span>
      </div>
    </motion.div>
  );
}

/**
 * Compact version for inline display
 */
export function TennisScorePreviewCompact({ config }: { config: TennisMatchConfig }) {
  const isBestOf5 = config.format === 'best_of_5';

  return (
    <div className="flex items-center gap-2 text-xs text-slate-400">
      <span className="px-2 py-0.5 bg-slate-800 rounded">
        {isBestOf5 ? '5 sets' : '3 sets'}
      </span>
      <span className="capitalize">{config.surface}</span>
      {config.decidingPointAtDeuce && (
        <span className="text-purple-400">No-Ad</span>
      )}
    </div>
  );
}

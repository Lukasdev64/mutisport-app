import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Round } from '@/types/tournament';
import { getRoundDisplayName } from '@/hooks/useBracketNavigation';

interface RoundIndicatorProps {
  rounds: Round[];
  currentIndex: number;
  onRoundSelect: (index: number) => void;
}

/**
 * Round indicator showing progress through tournament rounds.
 * Uses dots for simple brackets (< 5 rounds) or pills for complex ones.
 */
export function RoundIndicator({
  rounds,
  currentIndex,
  onRoundSelect,
}: RoundIndicatorProps) {
  // Use pills for many rounds or when names are long
  const usePills = rounds.length > 4 || rounds.some((r) => (r.name?.length || 0) > 12);

  if (usePills) {
    return (
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-xl border-b border-white/5">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-3">
          {rounds.map((round, idx) => {
            const isActive = currentIndex === idx;
            const hasIncompleteMatch = round.matches.some(
              (m) => m.status !== 'completed' && !m.result?.winnerId
            );
            const isCompleted = round.matches.every(
              (m) => m.status === 'completed' || m.result?.winnerId
            );

            return (
              <button
                key={round.id}
                onClick={() => onRoundSelect(idx)}
                className={cn(
                  'relative px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all touch-target',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                )}
              >
                {getRoundDisplayName(round, idx, rounds.length)}

                {/* Live indicator dot */}
                {hasIncompleteMatch && !isActive && !isCompleted && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Dots mode for simple brackets
  return (
    <div className="flex items-center justify-center gap-3 py-3 bg-slate-950/95 backdrop-blur-xl border-b border-white/5">
      {rounds.map((round, idx) => {
        const isActive = currentIndex === idx;
        const isCompleted = round.matches.every(
          (m) => m.status === 'completed' || m.result?.winnerId
        );

        return (
          <button
            key={round.id}
            onClick={() => onRoundSelect(idx)}
            className="p-2 touch-target"
            aria-label={getRoundDisplayName(round, idx, rounds.length)}
          >
            <motion.div
              animate={{
                scale: isActive ? 1.4 : 1,
                backgroundColor: isActive
                  ? 'rgb(59, 130, 246)' // blue-500
                  : isCompleted
                    ? 'rgb(16, 185, 129)' // emerald-500
                    : 'rgba(255, 255, 255, 0.3)',
              }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="w-2.5 h-2.5 rounded-full"
            />
          </button>
        );
      })}
    </div>
  );
}

import { useState, useCallback, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useAnimation,
} from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RoundIndicator } from './RoundIndicator';
import { RoundSlide } from './RoundSlide';
import type { Round, Player, Match, TournamentFormat } from '@/types/tournament';

interface BracketRoundCarouselProps {
  rounds: Round[];
  players: Player[];
  format: TournamentFormat;
  onMatchSelect: (match: Match) => void;
}

/** Minimum drag distance to trigger navigation (px) */
const SWIPE_THRESHOLD = 80;
/** Velocity threshold for fast swipes (px/s) */
const VELOCITY_THRESHOLD = 500;

/**
 * Horizontal swipe carousel for bracket round navigation.
 * Animation follows finger movement in real-time for native feel.
 */
export function BracketRoundCarousel({
  rounds,
  players,
  format,
  onMatchSelect,
}: BracketRoundCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    // Auto-navigate to first incomplete round
    const firstIncomplete = rounds.findIndex((r) =>
      r.matches.some((m) => m.status !== 'completed' && !m.result?.winnerId)
    );
    return firstIncomplete >= 0 ? firstIncomplete : 0;
  });

  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Motion values for drag tracking
  const dragX = useMotionValue(0);
  const controls = useAnimation();

  // Transform drag position to opacity (fade as you drag)
  const currentOpacity = useTransform(dragX, [-200, 0, 200], [0.5, 1, 0.5]);

  // Navigation helpers
  const canGoNext = currentIndex < rounds.length - 1;
  const canGoPrev = currentIndex > 0;

  const goToRound = useCallback(
    (index: number, dir: number) => {
      if (index >= 0 && index < rounds.length && index !== currentIndex) {
        setDirection(dir);
        setCurrentIndex(index);
      }
    },
    [currentIndex, rounds.length]
  );

  const goToNextRound = useCallback(() => {
    if (canGoNext) goToRound(currentIndex + 1, 1);
  }, [canGoNext, currentIndex, goToRound]);

  const goToPrevRound = useCallback(() => {
    if (canGoPrev) goToRound(currentIndex - 1, -1);
  }, [canGoPrev, currentIndex, goToRound]);

  // Handle drag end - decide whether to navigate or snap back
  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const { offset, velocity } = info;
      const swipeDistance = offset.x;
      const swipeVelocity = velocity.x;

      // Fast swipe or sufficient distance triggers navigation
      const shouldNavigate =
        Math.abs(swipeDistance) > SWIPE_THRESHOLD ||
        Math.abs(swipeVelocity) > VELOCITY_THRESHOLD;

      if (shouldNavigate) {
        // Swipe left (negative) = go to next round
        // Swipe right (positive) = go to previous round
        if (swipeDistance < 0 && canGoNext) {
          goToNextRound();
        } else if (swipeDistance > 0 && canGoPrev) {
          goToPrevRound();
        }
      }

      // Reset drag position (spring back)
      controls.start({ x: 0 });
      dragX.set(0);
    },
    [canGoNext, canGoPrev, goToNextRound, goToPrevRound, controls, dragX]
  );

  // Constrain drag at boundaries
  const handleDrag = useCallback(
    (_: unknown, info: PanInfo) => {
      let constrainedX = info.offset.x;

      // Add resistance at boundaries
      if (!canGoPrev && constrainedX > 0) {
        constrainedX = constrainedX * 0.3; // Rubber band effect
      }
      if (!canGoNext && constrainedX < 0) {
        constrainedX = constrainedX * 0.3;
      }

      dragX.set(constrainedX);
    },
    [canGoNext, canGoPrev, dragX]
  );

  const currentRound = rounds[currentIndex];
  if (!currentRound) return null;

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full bg-slate-950 flex flex-col overflow-hidden"
    >
      {/* Round Indicator */}
      <RoundIndicator
        rounds={rounds}
        currentIndex={currentIndex}
        onRoundSelect={(index) => goToRound(index, index > currentIndex ? 1 : -1)}
      />

      {/* Swipeable Round Content */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
          <motion.div
            key={currentRound.id}
            custom={direction}
            initial={(dir: number) => ({
              x: dir > 0 ? '100%' : '-100%',
              opacity: 0,
            })}
            animate={{ x: 0, opacity: 1 }}
            exit={(dir: number) => ({
              x: dir < 0 ? '100%' : '-100%',
              opacity: 0,
            })}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0"
          >
            {/* Inner draggable wrapper - separated from transition animation */}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              style={{
                x: dragX,
                opacity: currentOpacity,
              }}
              className="h-full w-full cursor-grab active:cursor-grabbing touch-pan-y"
            >
              <RoundSlide
                round={currentRound}
                roundIndex={currentIndex}
                totalRounds={rounds.length}
                players={players}
                format={format}
                onMatchSelect={onMatchSelect}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Peek indicators showing adjacent rounds */}
        <PeekIndicators
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          dragX={dragX}
        />
      </main>

      {/* Navigation Arrows */}
      <NavigationArrows
        canGoNext={canGoNext}
        canGoPrev={canGoPrev}
        onNext={goToNextRound}
        onPrev={goToPrevRound}
      />

      {/* Swipe Hint */}
      <div className="text-center text-[10px] text-slate-600 py-2 border-t border-white/5 bg-slate-950/50">
        <span className="flex items-center justify-center gap-2">
          <ChevronLeft className="w-3 h-3" />
          Swipez pour changer de round
          <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}

interface PeekIndicatorsProps {
  canGoPrev: boolean;
  canGoNext: boolean;
  dragX: ReturnType<typeof useMotionValue<number>>;
}

/**
 * Visual indicators that appear when dragging, showing there's more content
 */
function PeekIndicators({ canGoPrev, canGoNext, dragX }: PeekIndicatorsProps) {
  // Transform drag to indicator opacity with clamping to prevent NaN/extrapolation
  const leftOpacity = useTransform(dragX, (latest) => {
    // Only show when dragging right (positive x = going to previous)
    if (typeof latest !== 'number' || isNaN(latest) || latest <= 0) return 0;
    return Math.min(0.8, (latest / 100) * 0.8);
  });

  const rightOpacity = useTransform(dragX, (latest) => {
    // Only show when dragging left (negative x = going to next)
    if (typeof latest !== 'number' || isNaN(latest) || latest >= 0) return 0;
    return Math.min(0.8, (Math.abs(latest) / 100) * 0.8);
  });

  return (
    <>
      {/* Left peek (previous round) */}
      {canGoPrev && (
        <motion.div
          style={{ opacity: leftOpacity }}
          className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-blue-500/20 to-transparent pointer-events-none z-10 flex items-center justify-start pl-2"
        >
          <ChevronLeft className="w-6 h-6 text-blue-400" />
        </motion.div>
      )}

      {/* Right peek (next round) */}
      {canGoNext && (
        <motion.div
          style={{ opacity: rightOpacity }}
          className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-blue-500/20 to-transparent pointer-events-none z-10 flex items-center justify-end pr-2"
        >
          <ChevronRight className="w-6 h-6 text-blue-400" />
        </motion.div>
      )}
    </>
  );
}

interface NavigationArrowsProps {
  canGoNext: boolean;
  canGoPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
}

function NavigationArrows({
  canGoNext,
  canGoPrev,
  onNext,
  onPrev,
}: NavigationArrowsProps) {
  return (
    <>
      {/* Previous Arrow */}
      <AnimatePresence>
        {canGoPrev && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onClick={onPrev}
            className={cn(
              'absolute left-2 top-1/2 -translate-y-1/2 z-20',
              'w-10 h-10 rounded-full',
              'bg-slate-800/90 backdrop-blur-sm border border-white/10',
              'flex items-center justify-center',
              'text-white hover:bg-slate-700 transition-colors',
              'touch-target'
            )}
            aria-label="Round précédent"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Next Arrow */}
      <AnimatePresence>
        {canGoNext && (
          <motion.button
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onClick={onNext}
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 z-20',
              'w-10 h-10 rounded-full',
              'bg-slate-800/90 backdrop-blur-sm border border-white/10',
              'flex items-center justify-center',
              'text-white hover:bg-slate-700 transition-colors',
              'touch-target'
            )}
            aria-label="Round suivant"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}

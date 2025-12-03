import { useState, useCallback, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Wifi, Cloud, CloudOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ArenaBottomNav } from './ArenaBottomNav';
import { MobileBracketView } from './MobileBracketView';
import { MobileMatchList } from './MobileMatchList';
import { MobileStandingsView } from './MobileStandingsView';
import { MobileQuickActions } from './MobileQuickActions';
import { MatchModal } from '../MatchModal';
import type { ArenaMobileLayoutProps, ArenaTab } from '@/types/arena';
import type { Match } from '@/types/tournament';

/** Minimum drag distance to trigger navigation (px) */
const SWIPE_THRESHOLD = 80;
/** Velocity threshold for fast swipes (px/s) */
const VELOCITY_THRESHOLD = 500;
/** All tabs in order */
const TABS: ArenaTab[] = ['bracket', 'matches', 'standings'];

/**
 * Main mobile layout for tournament arena.
 * Provides swipeable navigation between Bracket, Matches, and Standings views.
 * Includes header, bottom nav, FAB, and match detail sheet.
 */
export function ArenaMobileLayout({
  tournament,
  role,
  onOpenSettings,
  onOpenShare,
}: ArenaMobileLayoutProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLElement>(null);

  // Tab navigation state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Match sheet state
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Motion values for drag tracking
  const dragX = useMotionValue(0);

  // Transform drag position to opacity (fade as you drag)
  const currentOpacity = useTransform(dragX, [-200, 0, 200], [0.5, 1, 0.5]);

  // Navigation helpers
  const activeTab = TABS[currentIndex];
  const canGoNext = currentIndex < TABS.length - 1;
  const canGoPrev = currentIndex > 0;

  const goToTab = useCallback(
    (index: number, dir: number) => {
      if (index >= 0 && index < TABS.length && index !== currentIndex) {
        setDirection(dir);
        setCurrentIndex(index);
      }
    },
    [currentIndex]
  );

  const goToNextTab = useCallback(() => {
    if (canGoNext) goToTab(currentIndex + 1, 1);
  }, [canGoNext, currentIndex, goToTab]);

  const goToPrevTab = useCallback(() => {
    if (canGoPrev) goToTab(currentIndex - 1, -1);
  }, [canGoPrev, currentIndex, goToTab]);

  // Handle drag - constrain at boundaries with rubber band effect
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
        // Swipe left (negative) = go to next tab
        // Swipe right (positive) = go to previous tab
        if (swipeDistance < 0 && canGoNext) {
          goToNextTab();
        } else if (swipeDistance > 0 && canGoPrev) {
          goToPrevTab();
        }
      }

      // Reset drag position
      dragX.set(0);
    },
    [canGoNext, canGoPrev, goToNextTab, goToPrevTab, dragX]
  );

  // Handle tab change from bottom nav
  const handleTabChange = useCallback(
    (tab: ArenaTab) => {
      const newIndex = TABS.indexOf(tab);
      const dir = newIndex > currentIndex ? 1 : -1;
      goToTab(newIndex, dir);
    },
    [currentIndex, goToTab]
  );

  // Handle match selection
  const handleMatchSelect = useCallback((match: Match) => {
    setSelectedMatch(match);
    setIsSheetOpen(true);
  }, []);

  // Handle quick score from FAB
  const handleQuickScore = useCallback((matchId: string) => {
    const match = tournament.rounds
      .flatMap((r) => r.matches)
      .find((m) => m.id === matchId);
    if (match) {
      setSelectedMatch(match);
      setIsSheetOpen(true);
    }
  }, [tournament.rounds]);

  // Sync status display
  const getSyncStatusIcon = () => {
    switch (tournament.syncStatus) {
      case 'synced':
        return <Cloud className="w-3 h-3 text-green-400" />;
      case 'pending':
        return <Cloud className="w-3 h-3 text-yellow-400 animate-pulse" />;
      case 'local-only':
        return <CloudOff className="w-3 h-3 text-orange-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col md:hidden">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 safe-area-top">
        <div className="flex items-center h-14 px-4">
          {/* Back button */}
          <button
            onClick={() => navigate('/tournaments')}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors touch-target"
          >
            <ChevronLeft className="w-6 h-6 text-slate-400" />
          </button>

          {/* Tournament info */}
          <div className="flex-1 min-w-0 ml-2">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-white truncate">
                {tournament.name}
              </h1>
              {getSyncStatusIcon()}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded text-[10px] font-medium uppercase',
                  tournament.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : tournament.status === 'completed'
                      ? 'bg-slate-500/20 text-slate-400'
                      : 'bg-blue-500/20 text-blue-400'
                )}
              >
                {tournament.status}
              </span>
              <span>{tournament.players.length} joueurs</span>
            </div>
          </div>

          {/* Live indicator */}
          {tournament.status === 'active' && (
            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <Wifi className="w-3 h-3 text-emerald-400" />
            </div>
          )}
        </div>

        {/* Swipe indicator dots */}
        <div className="swipe-indicator pb-2">
          {['bracket', 'matches', 'standings'].map((tab, idx) => (
            <div
              key={tab}
              className={cn(
                'swipe-indicator-dot',
                currentIndex === idx && 'active'
              )}
            />
          ))}
        </div>
      </header>

      {/* Main content with swipe */}
      <main
        ref={containerRef}
        className="flex-1 overflow-hidden relative no-bounce"
      >
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={{
              enter: (dir: number) => ({
                x: dir > 0 ? '100%' : '-100%',
                opacity: 0,
              }),
              center: { x: 0, opacity: 1 },
              exit: (dir: number) => ({
                x: dir < 0 ? '100%' : '-100%',
                opacity: 0,
              }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
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
              {activeTab === 'bracket' && (
                <MobileBracketView
                  tournament={tournament}
                  onMatchSelect={handleMatchSelect}
                />
              )}
              {activeTab === 'matches' && (
                <MobileMatchList
                  tournament={tournament}
                  role={role}
                  onMatchSelect={handleMatchSelect}
                  onQuickScore={(match) => handleMatchSelect(match)}
                />
              )}
              {activeTab === 'standings' && (
                <MobileStandingsView
                  tournament={tournament}
                  onPlayerTap={(playerId) => {
                    // TODO: Show player details/match history
                    console.log('Player tapped:', playerId);
                  }}
                />
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Peek indicators showing adjacent tabs */}
        <TabPeekIndicators
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          dragX={dragX}
        />
      </main>

      {/* FAB */}
      <MobileQuickActions
        role={role}
        tournament={tournament}
        onSettings={onOpenSettings}
        onShare={onOpenShare}
        onScoreMatch={handleQuickScore}
      />

      {/* Bottom navigation */}
      <ArenaBottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Match scoring modal - direct, sans intermédiaire */}
      {selectedMatch && (
        <MatchModal
          match={selectedMatch}
          tournament={tournament}
          isOpen={isSheetOpen}
          onClose={() => {
            setIsSheetOpen(false);
            setSelectedMatch(null);
          }}
        />
      )}
    </div>
  );
}

interface TabPeekIndicatorsProps {
  canGoPrev: boolean;
  canGoNext: boolean;
  dragX: ReturnType<typeof useMotionValue<number>>;
}

/**
 * Visual indicators that appear when dragging, showing there's more content
 */
function TabPeekIndicators({ canGoPrev, canGoNext, dragX }: TabPeekIndicatorsProps) {
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
      {/* Left peek (previous tab) */}
      {canGoPrev && (
        <motion.div
          style={{ opacity: leftOpacity }}
          className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-blue-500/20 to-transparent pointer-events-none z-10 flex items-center justify-start pl-2"
        >
          <ChevronLeft className="w-5 h-5 text-blue-400" />
        </motion.div>
      )}

      {/* Right peek (next tab) */}
      {canGoNext && (
        <motion.div
          style={{ opacity: rightOpacity }}
          className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-blue-500/20 to-transparent pointer-events-none z-10 flex items-center justify-end pr-2"
        >
          <ChevronRight className="w-5 h-5 text-blue-400" />
        </motion.div>
      )}
    </>
  );
}

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Wifi, Cloud, CloudOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useArenaNavigation } from '@/hooks/useArenaNavigation';
import { ArenaBottomNav } from './ArenaBottomNav';
import { MobileBracketView } from './MobileBracketView';
import { MobileMatchList } from './MobileMatchList';
import { MobileStandingsView } from './MobileStandingsView';
import { MobileMatchSheet } from './MobileMatchSheet';
import { MobileQuickActions } from './MobileQuickActions';
import type { ArenaMobileLayoutProps, ArenaTab } from '@/types/arena';
import type { Match } from '@/types/tournament';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

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
  const { activeTab, setActiveTab, swipeHandlers, currentIndex } = useArenaNavigation();

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [direction, setDirection] = useState(0);
  const [previousTab, setPreviousTab] = useState<ArenaTab>('bracket');

  // Handle tab change with direction tracking for animation
  const handleTabChange = useCallback((tab: ArenaTab) => {
    const tabs: ArenaTab[] = ['bracket', 'matches', 'standings'];
    const newIndex = tabs.indexOf(tab);
    const oldIndex = tabs.indexOf(previousTab);
    setDirection(newIndex > oldIndex ? 1 : -1);
    setPreviousTab(activeTab);
    setActiveTab(tab);
  }, [activeTab, previousTab, setActiveTab]);

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
        {...swipeHandlers}
        className="flex-1 overflow-hidden relative no-bounce"
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute inset-0"
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
        </AnimatePresence>
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

      {/* Match detail sheet */}
      <MobileMatchSheet
        match={selectedMatch}
        tournament={tournament}
        role={role}
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setSelectedMatch(null);
        }}
        onScoreUpdate={() => {
          // Refresh will happen automatically via store
        }}
      />
    </div>
  );
}

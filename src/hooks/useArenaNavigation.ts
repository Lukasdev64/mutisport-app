import { useState, useCallback, useMemo } from 'react';
import { useSwipeable } from 'react-swipeable';
import type { SwipeableHandlers } from 'react-swipeable';
import type { ArenaTab } from '@/types/arena';

const TABS: ArenaTab[] = ['bracket', 'matches', 'standings'];

interface UseArenaNavigationReturn {
  activeTab: ArenaTab;
  setActiveTab: (tab: ArenaTab) => void;
  currentIndex: number;
  totalTabs: number;
  swipeHandlers: SwipeableHandlers;
  goNext: () => void;
  goPrev: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

/**
 * Hook for arena tab navigation with swipe gesture support.
 * Manages tab state and provides swipe handlers for mobile navigation.
 *
 * @param initialTab - The initial active tab (default: 'bracket')
 * @returns Navigation state and handlers
 */
export function useArenaNavigation(initialTab: ArenaTab = 'bracket'): UseArenaNavigationReturn {
  const [activeTab, setActiveTab] = useState<ArenaTab>(initialTab);

  const currentIndex = TABS.indexOf(activeTab);

  const canGoNext = currentIndex < TABS.length - 1;
  const canGoPrev = currentIndex > 0;

  const goNext = useCallback(() => {
    if (canGoNext) {
      setActiveTab(TABS[currentIndex + 1]);
    }
  }, [currentIndex, canGoNext]);

  const goPrev = useCallback(() => {
    if (canGoPrev) {
      setActiveTab(TABS[currentIndex - 1]);
    }
  }, [currentIndex, canGoPrev]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: goNext,
    onSwipedRight: goPrev,
    trackMouse: false,
    trackTouch: true,
    delta: 50, // Minimum swipe distance
    swipeDuration: 500, // Maximum swipe duration
    preventScrollOnSwipe: true,
  });

  return useMemo(
    () => ({
      activeTab,
      setActiveTab,
      currentIndex,
      totalTabs: TABS.length,
      swipeHandlers,
      goNext,
      goPrev,
      canGoNext,
      canGoPrev,
    }),
    [activeTab, currentIndex, swipeHandlers, goNext, goPrev, canGoNext, canGoPrev]
  );
}

/**
 * Get tab label in French
 */
export function getTabLabel(tab: ArenaTab): string {
  switch (tab) {
    case 'bracket':
      return 'Bracket';
    case 'matches':
      return 'Matchs';
    case 'standings':
      return 'Classement';
    default:
      return tab;
  }
}

/**
 * Get all tabs for rendering
 */
export function getTabs(): ArenaTab[] {
  return TABS;
}

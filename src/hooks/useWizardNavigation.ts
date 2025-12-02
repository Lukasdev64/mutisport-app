/**
 * Hook for sport-specific wizard navigation
 *
 * Returns the correct wizard URL based on the active sport.
 * Implemented sports get their dedicated wizard, WIP sports go to the hub.
 */

import { useSportStore } from '@/store/sportStore';
import type { SportType } from '@/types/sport';
import {
  isSportImplemented,
  isSportUsable,
  getImplementationStatusLabel,
  SPORT_IMPLEMENTATION_STATUS,
} from '@/types/sport';

/**
 * Sport-specific wizard routes
 * Only add entries for sports with dedicated wizards
 */
const SPORT_WIZARD_ROUTES: Partial<Record<SportType, string>> = {
  tennis: '/tournaments/new/tennis',
  basketball: '/tournaments/new/basketball',
  // Add more sports as wizards are implemented:
  // football: '/tournaments/new/football',
  // ping_pong: '/tournaments/new/ping-pong',
};

/**
 * Get the wizard URL for a specific sport
 */
export function getWizardUrl(sport: SportType): string {
  return SPORT_WIZARD_ROUTES[sport] ?? '/tournaments/new';
}

/**
 * Check if a sport can create tournaments (has a working wizard)
 */
export function canCreateTournament(sport: SportType): boolean {
  return isSportImplemented(sport);
}

/**
 * Get the status label for a sport's wizard
 */
export function getWizardStatusLabel(sport: SportType): string | null {
  const status = SPORT_IMPLEMENTATION_STATUS[sport];
  if (status === 'implemented') return null;
  return getImplementationStatusLabel(status);
}

/**
 * Hook that returns the wizard URL for the current active sport
 */
export function useWizardUrl(): string {
  const activeSport = useSportStore((s) => s.activeSport);
  return getWizardUrl(activeSport);
}

/**
 * Hook that returns wizard navigation info with implementation status
 */
export function useWizardNavigation() {
  const activeSport = useSportStore((s) => s.activeSport);
  const wizardUrl = getWizardUrl(activeSport);
  const canCreate = canCreateTournament(activeSport);
  const statusLabel = getWizardStatusLabel(activeSport);
  const status = SPORT_IMPLEMENTATION_STATUS[activeSport];

  return {
    wizardUrl,
    activeSport,
    canCreate,
    statusLabel,
    status,
    isImplemented: isSportImplemented(activeSport),
    isUsable: isSportUsable(activeSport),
  };
}

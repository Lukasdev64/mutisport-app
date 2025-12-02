export type SportType = 'tennis' | 'football' | 'basketball' | 'ping_pong' | 'chess' | 'generic';

export type ScoringSystemType = 'tennis' | 'points' | 'goals' | 'games';

/**
 * Implementation status for sports in the wizard/tournament creation
 * - 'implemented': Full support with presets, rules customizer, scoring engine
 * - 'partial': Basic support, can create tournaments but limited customization
 * - 'wip': Work in progress, not ready for use
 */
export type SportImplementationStatus = 'implemented' | 'partial' | 'wip';

/**
 * Defines which sports are implemented in the tournament creation wizard
 * This prevents tennis-specific code from "contaminating" other sports
 */
export const SPORT_IMPLEMENTATION_STATUS: Record<SportType, SportImplementationStatus> = {
  tennis: 'implemented',      // Full support: presets, rules customizer, scoring
  basketball: 'partial',      // Has plugin but no wizard UI for rules
  football: 'wip',            // No plugin registered
  ping_pong: 'wip',           // No plugin registered
  chess: 'wip',               // No plugin registered
  generic: 'wip'              // No plugin registered
};

/**
 * Check if a sport is fully implemented
 */
export function isSportImplemented(sport: SportType): boolean {
  return SPORT_IMPLEMENTATION_STATUS[sport] === 'implemented';
}

/**
 * Check if a sport can be used (implemented or partial)
 */
export function isSportUsable(sport: SportType): boolean {
  const status = SPORT_IMPLEMENTATION_STATUS[sport];
  return status === 'implemented' || status === 'partial';
}

/**
 * Get label for implementation status
 */
export function getImplementationStatusLabel(status: SportImplementationStatus): string {
  switch (status) {
    case 'implemented': return '';
    case 'partial': return 'Beta';
    case 'wip': return 'Bientot';
  }
}

export interface Sport {
  id: SportType;
  name: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color
  emoji: string;
  scoringSystem: ScoringSystemType;
}

export interface SportConfig {
  sport: Sport;
  // Sport-specific configurations will extend this
}

// Available sports
export const SPORTS: Record<SportType, Sport> = {
  tennis: {
    id: 'tennis',
    name: 'Tennis',
    icon: 'Trophy',
    color: 'emerald',
    emoji: '🎾',
    scoringSystem: 'tennis'
  },
  football: {
    id: 'football',
    name: 'Football',
    icon: 'Goal',
    color: 'blue',
    emoji: '⚽',
    scoringSystem: 'goals'
  },
  basketball: {
    id: 'basketball',
    name: 'Basketball',
    icon: 'Circle', // Using Lucide icon 'Circle' as placeholder or change to specific if available
    color: 'orange',
    emoji: '🏀',
    scoringSystem: 'points'
  },
  ping_pong: {
    id: 'ping_pong',
    name: 'Ping Pong',
    icon: 'Circle',
    color: 'red',
    emoji: '🏓',
    scoringSystem: 'points'
  },
  chess: {
    id: 'chess',
    name: 'Chess',
    icon: 'Crown',
    color: 'slate',
    emoji: '♟️',
    scoringSystem: 'games'
  },
  generic: {
    id: 'generic',
    name: 'Generic',
    icon: 'Trophy',
    color: 'slate',
    emoji: '🏆',
    scoringSystem: 'points'
  }
};

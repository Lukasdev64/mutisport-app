export type SportType = 'tennis' | 'football' | 'basketball' | 'ping_pong' | 'chess' | 'generic';

export type ScoringSystemType = 'tennis' | 'points' | 'goals' | 'games';

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

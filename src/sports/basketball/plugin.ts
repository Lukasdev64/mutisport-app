import { SPORTS } from '@/types/sport';
import { BasketballMatchModalWrapper } from './components/BasketballMatchModalWrapper';
// import { calculateBasketballScore } from './scoring';
import type { SportPlugin } from '@/sports/core/types';
// import type { Match } from '@/types/tournament';

/**
 * Basketball Sport Plugin
 *
 * Provides basketball-specific functionality:
 * - Simple point-based scoring
 * - Match modal for entering scores
 */

interface BasketballConfig {
  format: 'standard' | 'college' | 'nba';
  overtimeEnabled: boolean;
}

const DEFAULT_BASKETBALL_CONFIG: BasketballConfig = {
  format: 'standard',
  overtimeEnabled: true,
};

export const basketballPlugin: SportPlugin = {
  id: 'basketball',
  sport: SPORTS.basketball,

  // -------------------------------------------------------------------------
  // Configuration
  // -------------------------------------------------------------------------

  defaultConfig: DEFAULT_BASKETBALL_CONFIG,

  presets: [
    {
      id: 'standard',
      name: 'Standard',
      description: 'Format standard',
      config: { format: 'standard', overtimeEnabled: true },
    },
    {
      id: 'nba',
      name: 'NBA',
      description: 'Format NBA (4x12 min)',
      config: { format: 'nba', overtimeEnabled: true },
    },
    {
      id: 'college',
      name: 'College',
      description: 'Format universitaire (2x20 min)',
      config: { format: 'college', overtimeEnabled: true },
    },
  ],

  // -------------------------------------------------------------------------
  // Components
  // -------------------------------------------------------------------------

  components: {
    MatchModal: BasketballMatchModalWrapper,
    // No RulesModule for basketball yet
  },

  // -------------------------------------------------------------------------
  // Scoring Engine
  // -------------------------------------------------------------------------

  scoringEngine: {
    initializeMatch: () => ({
      player1Score: 0,
      player2Score: 0,
    }),

    getWinner: (score: unknown) => {
      const s = score as { player1Score: number; player2Score: number; winnerId?: string };
      if (s.winnerId) return s.winnerId;
      if (s.player1Score > s.player2Score) return 'player1';
      if (s.player2Score > s.player1Score) return 'player2';
      return undefined;
    },

    getScoreDisplay: (score: unknown) => {
      const s = score as { player1Score: number; player2Score: number };
      return `${s.player1Score} - ${s.player2Score}`;
    },
  },

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------

  validateConfig: (config: unknown): boolean => {
    if (!config || typeof config !== 'object') return false;
    const c = config as Partial<BasketballConfig>;
    return (
      c.format === 'standard' || c.format === 'college' || c.format === 'nba'
    );
  },

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  onRegister: () => {
    console.log('[Basketball Plugin] Registered');
  },

  onUnregister: () => {
    console.log('[Basketball Plugin] Unregistered');
  },
};

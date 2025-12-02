import { SPORTS } from '@/types/sport';
import { TennisScoringEngine } from './scoring';
import { DEFAULT_TENNIS_CONFIG } from './config';
import { TENNIS_TOURNAMENT_PRESETS } from './tournamentPresets';
import { TennisMatchModalWrapper } from './components/TennisMatchModalWrapper';
import { TennisRulesModule } from './components/TennisRulesModule';
import type { SportPlugin, SportPreset } from '@/sports/core/types';
import type { TennisMatchConfig, TennisMatchScore } from '@/types/tennis';

/**
 * Tennis Sport Plugin
 *
 * Provides tennis-specific functionality:
 * - Match modal with quick result and live scoring modes
 * - Tennis scoring engine (games, sets, tiebreaks)
 * - Tournament presets (Grand Slams, ATP, WTA, etc.)
 * - Rules display module
 */
export const tennisPlugin: SportPlugin = {
  id: 'tennis',
  sport: SPORTS.tennis,

  // -------------------------------------------------------------------------
  // Configuration
  // -------------------------------------------------------------------------

  defaultConfig: DEFAULT_TENNIS_CONFIG,

  presets: TENNIS_TOURNAMENT_PRESETS.map((preset): SportPreset => ({
    id: preset.id,
    name: preset.name,
    description: preset.description,
    category: preset.category,
    config: preset.config,
  })),

  // -------------------------------------------------------------------------
  // Components
  // -------------------------------------------------------------------------

  components: {
    MatchModal: TennisMatchModalWrapper,
    RulesModule: TennisRulesModule as any,
    // RulesCustomizer and PresetSelector can be added later
  },

  // -------------------------------------------------------------------------
  // Scoring Engine
  // -------------------------------------------------------------------------

  scoringEngine: {
    initializeMatch: (config: unknown) => {
      return TennisScoringEngine.initializeMatch(config as TennisMatchConfig);
    },

    getWinner: (score: unknown) => {
      const tennisScore = score as TennisMatchScore;
      return tennisScore.winnerId;
    },

    getScoreDisplay: (score: unknown) => {
      return TennisScoringEngine.getScoreDisplay(score as TennisMatchScore);
    },
  },

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------

  validateConfig: (config: unknown): boolean => {
    if (!config || typeof config !== 'object') return false;

    const c = config as Partial<TennisMatchConfig>;

    return (
      (c.format === 'best_of_3' || c.format === 'best_of_5') &&
      typeof c.tiebreakAt === 'number' &&
      c.tiebreakAt >= 0 &&
      c.tiebreakAt <= 12
    );
  },

  // -------------------------------------------------------------------------
  // Lifecycle
  // -------------------------------------------------------------------------

  onRegister: () => {
    console.log('[Tennis Plugin] Registered');
  },

  onUnregister: () => {
    console.log('[Tennis Plugin] Unregistered');
  },
};

import { SPORTS } from '@/types/sport';
import { DEFAULT_FOOTBALL_CONFIG, FOOTBALL_PRESETS } from './config';
import { FootballMatchModalWrapper } from './components/FootballMatchModalWrapper';
import { FootballRulesModule } from './components/FootballRulesModule';
import type { SportPlugin, SportPreset } from '@/sports/core/types';

export const footballPlugin: SportPlugin = {
  id: 'football',
  sport: SPORTS.football,

  // -------------------------------------------------------------------------
  // Configuration
  // -------------------------------------------------------------------------

  defaultConfig: DEFAULT_FOOTBALL_CONFIG,

  presets: FOOTBALL_PRESETS.map((preset): SportPreset => ({
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
    MatchModal: FootballMatchModalWrapper,
    RulesModule: FootballRulesModule as any,
  },
};

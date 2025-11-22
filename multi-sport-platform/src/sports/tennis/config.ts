import type { TennisMatchConfig, TennisSurface, TennisFormat } from '@/types/tennis';

export const TENNIS_CONFIG: {
  surfaces: { id: TennisSurface; name: string; color: string; emoji: string }[];
  formats: { id: TennisFormat; name: string; description: string }[];
} = {
  surfaces: [
    { id: 'clay', name: 'Clay', color: 'orange', emoji: '🟧' },
    { id: 'hard', name: 'Hard Court', color: 'blue', emoji: '🔵' },
    { id: 'grass', name: 'Grass', color: 'green', emoji: '🟢' },
    { id: 'indoor', name: 'Indoor', color: 'slate', emoji: '⚪' }
  ],
  formats: [
    { id: 'best_of_3', name: 'Best of 3 Sets', description: 'First to win 2 sets' },
    { id: 'best_of_5', name: 'Best of 5 Sets', description: 'First to win 3 sets (Grand Slam format)' }
  ]
};

export const DEFAULT_TENNIS_CONFIG: TennisMatchConfig = {
  format: 'best_of_3',
  surface: 'hard',
  tiebreakAt: 6,
  finalSetTiebreak: true
};

// Famous tennis tournaments configuration
export const FAMOUS_TOURNAMENTS = {
  'roland-garros': {
    name: 'Roland Garros',
    surface: 'clay' as TennisSurface,
    format: 'best_of_5' as TennisFormat,
    finalSetTiebreak: false // No tiebreak in 5th set at Roland Garros
  },
  'wimbledon': {
    name: 'Wimbledon',
    surface: 'grass' as TennisSurface,
    format: 'best_of_5' as TennisFormat,
    finalSetTiebreak: true
  },
  'us-open': {
    name: 'US Open',
    surface: 'hard' as TennisSurface,
    format: 'best_of_5' as TennisFormat,
    finalSetTiebreak: true
  },
  'australian-open': {
    name: 'Australian Open',
    surface: 'hard' as TennisSurface,
    format: 'best_of_5' as TennisFormat,
    finalSetTiebreak: true
  }
};

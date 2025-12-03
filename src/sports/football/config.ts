import type { FootballMatchConfig, FootballFormat } from '@/types/football';

export const FOOTBALL_CONFIG: {
  formats: { id: FootballFormat; name: string; description: string }[];
} = {
  formats: [
    { id: 'standard', name: 'Standard (11v11)', description: '90 minutes, 11 joueurs' },
    { id: 'futsal', name: 'Futsal (5v5)', description: '40 minutes, 5 joueurs, intérieur' },
    { id: 'seven_a_side', name: 'Foot à 7', description: 'Terrain réduit, 7 joueurs' },
    { id: 'five_a_side', name: 'Foot à 5', description: 'Petit terrain, 5 joueurs' }
  ]
};

export const DEFAULT_FOOTBALL_CONFIG: FootballMatchConfig = {
  format: 'standard',
  halfDurationMinutes: 45,
  halvesCount: 2,
  extraTimeEnabled: true,
  extraTimeDurationMinutes: 15,
  penaltiesEnabled: true,
  maxSubstitutions: 5
};

export const FOOTBALL_PRESETS = [
  {
    id: 'fifa_standard',
    name: 'Standard FIFA',
    description: 'Règles standards pour match officiel',
    category: 'Standard',
    config: DEFAULT_FOOTBALL_CONFIG
  },
  {
    id: 'futsal_official',
    name: 'Futsal Officiel',
    description: 'Règles officielles de Futsal',
    category: 'Indoor',
    config: {
      ...DEFAULT_FOOTBALL_CONFIG,
      format: 'futsal',
      halfDurationMinutes: 20,
      maxSubstitutions: 99 // Unlimited
    } as FootballMatchConfig
  },
  {
    id: 'urban_5',
    name: 'Urban 5',
    description: 'Match court 5 contre 5',
    category: 'Recreational',
    config: {
      ...DEFAULT_FOOTBALL_CONFIG,
      format: 'five_a_side',
      halfDurationMinutes: 25,
      extraTimeEnabled: false,
      penaltiesEnabled: false
    } as FootballMatchConfig
  }
];

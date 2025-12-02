import type { SportRule } from '@/types/rules';

/**
 * Fallback basketball rules data for offline/development mode
 * Based on FIBA Official Basketball Rules
 *
 * WIP: Rules to be added when implementing basketball rules library
 */
export const BASKETBALL_FALLBACK_RULES: SportRule[] = [
  // Example structure - uncomment when implementing
  // {
  //   id: 'court-1',
  //   sport: 'basketball',
  //   categoryId: 'court',
  //   categoryName: 'Le Terrain',
  //   categoryOrder: 1,
  //   title: 'Dimensions du Terrain',
  //   slug: 'dimensions-terrain',
  //   content: `## Dimensions officielles du terrain de basketball
  //
  //   Le terrain est rectangulaire avec les dimensions suivantes :
  //   - **Longueur** : 28 metres
  //   - **Largeur** : 15 metres
  //   ...`,
  //   summary: 'Dimensions officielles FIBA : 28m x 15m',
  //   tags: ['terrain', 'dimensions', 'panier'],
  //   source: 'FIBA Official Basketball Rules 2024',
  //   sourceUrl: 'https://www.fiba.basketball/en/rules/official-basketball-rules',
  //   difficulty: 'beginner',
  //   createdAt: new Date().toISOString(),
  //   updatedAt: new Date().toISOString(),
  // },
];

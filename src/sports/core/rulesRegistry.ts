import type { RuleCategory } from '@/types/rules';
import type { SportType } from '@/types/sport';
import type { SportRule } from '@/types/rules';

/**
 * Rules Registry - Centralized management of sport rules
 *
 * Each sport can register its own:
 * - Categories (for grouping rules)
 * - Fallback data (for offline mode)
 *
 * To add rules for a new sport:
 * 1. Create `src/sports/[sport]/rules/categories.ts`
 * 2. Create `src/sports/[sport]/rules/fallbackData.ts`
 * 3. Register in this file's SPORT_RULE_CATEGORIES and SPORT_FALLBACK_RULES
 */

// ============================================================================
// Import sport-specific categories and data
// ============================================================================

import { TENNIS_RULE_CATEGORIES } from '@/types/rules';
import { TENNIS_FALLBACK_RULES } from '@/sports/tennis/rules/fallbackData';

// Future imports:
// import { BASKETBALL_RULE_CATEGORIES } from '@/sports/basketball/rules/categories';
// import { BASKETBALL_FALLBACK_RULES } from '@/sports/basketball/rules/fallbackData';

// ============================================================================
// Category Registry
// ============================================================================

/**
 * All rule categories indexed by sport
 */
export const SPORT_RULE_CATEGORIES: Record<SportType, RuleCategory[]> = {
  tennis: TENNIS_RULE_CATEGORIES,
  basketball: [],  // WIP - add BASKETBALL_RULE_CATEGORIES when implemented
  football: [],    // WIP
  ping_pong: [],   // WIP
  chess: [],       // WIP
  generic: [],     // N/A
};

/**
 * Get rule categories for a sport
 */
export function getRuleCategoriesForSport(sport: SportType): RuleCategory[] {
  return SPORT_RULE_CATEGORIES[sport] || [];
}

/**
 * Check if a sport has categories defined
 */
export function hasCategoriesForSport(sport: SportType): boolean {
  return SPORT_RULE_CATEGORIES[sport]?.length > 0;
}

// ============================================================================
// Fallback Data Registry
// ============================================================================

/**
 * All fallback rules indexed by sport
 */
export const SPORT_FALLBACK_RULES: Record<SportType, SportRule[]> = {
  tennis: TENNIS_FALLBACK_RULES,
  basketball: [],  // WIP - add BASKETBALL_FALLBACK_RULES when implemented
  football: [],    // WIP
  ping_pong: [],   // WIP
  chess: [],       // WIP
  generic: [],     // N/A
};

/**
 * Get fallback rules for a sport
 */
export function getFallbackRulesForSport(sport: SportType): SportRule[] {
  return SPORT_FALLBACK_RULES[sport] || [];
}

/**
 * Get fallback rules for a sport filtered by category
 */
export function getFallbackRulesByCategory(sport: SportType, categoryId: string): SportRule[] {
  return getFallbackRulesForSport(sport).filter(rule => rule.categoryId === categoryId);
}

/**
 * Get a single fallback rule by slug
 */
export function getFallbackRuleBySlug(sport: SportType, slug: string): SportRule | undefined {
  return getFallbackRulesForSport(sport).find(rule => rule.slug === slug);
}

// ============================================================================
// Source Attribution
// ============================================================================

export interface RulesSourceInfo {
  name: string;
  url?: string;
  year?: string;
}

/**
 * Official sources for sport rules
 */
export const RULES_SOURCES: Record<SportType, RulesSourceInfo | null> = {
  tennis: {
    name: 'ITF Rules of Tennis',
    url: 'https://www.itftennis.com/en/about-us/governance/rules-and-regulations/',
    year: '2025'
  },
  basketball: {
    name: 'FIBA Official Basketball Rules',
    url: 'https://www.fiba.basketball/en/rules/official-basketball-rules',
    year: '2024'
  },
  football: {
    name: 'FIFA Laws of the Game',
    url: 'https://www.theifab.com/laws-of-the-game/',
    year: '2024'
  },
  ping_pong: {
    name: 'ITTF Handbook',
    url: 'https://www.ittf.com/handbook/',
    year: '2024'
  },
  chess: {
    name: 'FIDE Laws of Chess',
    url: 'https://www.fide.com/FIDE/handbook/',
    year: '2024'
  },
  generic: null
};

/**
 * Get source info for a sport
 */
export function getRulesSource(sport: SportType): RulesSourceInfo | null {
  return RULES_SOURCES[sport];
}

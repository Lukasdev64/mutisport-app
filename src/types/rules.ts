import type { SportType } from './sport';

/**
 * Difficulty level for understanding a rule
 */
export type RuleDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Implementation status for sport rules
 * - 'implemented': Full rules library available
 * - 'partial': Some rules available, more coming
 * - 'wip': Work in progress, no rules yet
 */
export type RulesImplementationStatus = 'implemented' | 'partial' | 'wip';

/**
 * Rules implementation status per sport
 */
export const RULES_IMPLEMENTATION_STATUS: Record<SportType, RulesImplementationStatus> = {
  tennis: 'implemented',    // Full ITF rules library
  basketball: 'wip',        // Coming soon
  football: 'wip',          // Coming soon
  ping_pong: 'wip',         // Coming soon
  chess: 'wip',             // Coming soon
  generic: 'wip'            // N/A
};

/**
 * Check if a sport has rules implemented
 */
export function hasRulesImplemented(sport: SportType): boolean {
  return RULES_IMPLEMENTATION_STATUS[sport] === 'implemented';
}

/**
 * Check if a sport has any rules available (implemented or partial)
 */
export function hasRulesAvailable(sport: SportType): boolean {
  const status = RULES_IMPLEMENTATION_STATUS[sport];
  return status === 'implemented' || status === 'partial';
}

/**
 * Get label for rules implementation status
 */
export function getRulesStatusLabel(status: RulesImplementationStatus): string {
  switch (status) {
    case 'implemented': return '';
    case 'partial': return 'Partiel';
    case 'wip': return 'Bientot';
  }
}

/**
 * Category for organizing rules
 */
export interface RuleCategory {
  id: string;
  name: string;
  description?: string;
  icon: string;        // Lucide icon name
  color: string;       // Tailwind color class
  displayOrder: number;
  ruleCount?: number;  // Populated at runtime
}

/**
 * A single sport rule entry
 */
export interface SportRule {
  id: string;
  sport: SportType;
  categoryId: string;
  categoryName: string;
  categoryOrder: number;
  title: string;
  slug: string;
  content: string;     // Markdown
  summary?: string;
  tags: string[];
  keywords?: string;
  source?: string;
  sourceUrl?: string;
  difficulty: RuleDifficulty;
  createdAt: string;
  updatedAt: string;
}

/**
 * Search result from full-text search
 */
export interface RuleSearchResult {
  id: string;
  sport: string;
  categoryId: string;
  categoryName: string;
  title: string;
  slug: string;
  summary?: string;
  tags: string[];
  rank: number;
}

/**
 * Tennis rule categories based on ITF Rules of Tennis 2025 structure
 */
export const TENNIS_RULE_CATEGORIES: RuleCategory[] = [
  {
    id: 'court',
    name: 'Le Court',
    description: 'Dimensions, filet, lignes',
    icon: 'Square',
    color: 'emerald',
    displayOrder: 1
  },
  {
    id: 'service',
    name: 'Le Service',
    description: 'Position, execution, ordre',
    icon: 'Zap',
    color: 'blue',
    displayOrder: 2
  },
  {
    id: 'fautes',
    name: 'Les Fautes',
    description: 'Service, pied, filet',
    icon: 'AlertTriangle',
    color: 'red',
    displayOrder: 3
  },
  {
    id: 'scoring',
    name: 'Le Comptage des Points',
    description: '15-30-40, jeux, sets',
    icon: 'Calculator',
    color: 'purple',
    displayOrder: 4
  },
  {
    id: 'tiebreak',
    name: 'Le Tie-Break',
    description: 'Regles, super tie-break',
    icon: 'Swords',
    color: 'orange',
    displayOrder: 5
  },
  {
    id: 'let',
    name: 'Le Let',
    description: 'Service let, interruptions',
    icon: 'Repeat',
    color: 'slate',
    displayOrder: 6
  },
  {
    id: 'doubles',
    name: 'Le Double',
    description: 'Regles specifiques',
    icon: 'Users',
    color: 'cyan',
    displayOrder: 7
  },
  {
    id: 'conduct',
    name: 'Le Code de Conduite',
    description: 'Violations, penalites',
    icon: 'Shield',
    color: 'amber',
    displayOrder: 8
  },
  {
    id: 'rest',
    name: 'Repos et Temps',
    description: 'Changements de cote, pauses',
    icon: 'Clock',
    color: 'teal',
    displayOrder: 9
  },
];

/**
 * Get a category by ID
 */
export function getRuleCategoryById(categoryId: string, categories: RuleCategory[] = TENNIS_RULE_CATEGORIES): RuleCategory | undefined {
  return categories.find(cat => cat.id === categoryId);
}

/**
 * Get difficulty label in French
 */
export function getDifficultyLabel(difficulty: RuleDifficulty): string {
  switch (difficulty) {
    case 'beginner': return 'Debutant';
    case 'intermediate': return 'Intermediaire';
    case 'advanced': return 'Avance';
  }
}

/**
 * Get difficulty color
 */
export function getDifficultyColor(difficulty: RuleDifficulty): string {
  switch (difficulty) {
    case 'beginner': return 'emerald';
    case 'intermediate': return 'amber';
    case 'advanced': return 'red';
  }
}

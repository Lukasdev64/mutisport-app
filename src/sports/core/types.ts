import type { ComponentType } from 'react';
import type { SportType, Sport } from '@/types/sport';
import type { Match, Tournament, MatchResult } from '@/types/tournament';

/**
 * Sport Plugin System - Core Types
 *
 * This module defines the plugin interface that all sports must implement.
 * Allows adding new sports without modifying core tournament code.
 */

// ============================================================================
// Scoring Engine Interface
// ============================================================================

export interface SportScoringEngine {
  /** Initialize a match score state from config */
  initializeMatch(config: unknown): unknown;

  /** Determine winner from score state */
  getWinner(score: unknown): string | undefined;

  /** Format score for display */
  getScoreDisplay(score: unknown): string;

  /** Check if undo is possible */
  canUndo?: (score: unknown) => boolean;

  /** Undo last action */
  undo?: (score: unknown, history: unknown[]) => unknown;
}

// ============================================================================
// Component Props Interfaces
// ============================================================================

export interface SportMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  tournament: Tournament;
  onUpdateResult: (matchId: string, result: MatchResult) => void;
}

export interface SportRulesModuleProps {
  config: unknown;
  onChange?: (config: unknown) => void;
  readOnly?: boolean;
  compact?: boolean;
}

export interface SportRulesCustomizerProps {
  config: unknown;
  onChange: (config: unknown) => void;
  disabled?: boolean;
}

export interface SportPresetSelectorProps {
  onSelect: (preset: SportPreset) => void;
  selectedPresetId?: string;
}

// ============================================================================
// Preset Interface
// ============================================================================

export interface SportPreset {
  id: string;
  name: string;
  description?: string;
  category?: string;
  config: unknown;
}

// ============================================================================
// Sport Plugin Interface
// ============================================================================

export interface SportPlugin {
  /** Unique sport identifier */
  id: SportType;

  /** Sport metadata (name, icon, color, etc.) */
  sport: Sport;

  // -------------------------------------------------------------------------
  // Configuration
  // -------------------------------------------------------------------------

  /** Default configuration for new tournaments */
  defaultConfig: unknown;

  /** Pre-defined tournament presets (e.g., "Grand Slam", "ATP") */
  presets?: SportPreset[];

  // -------------------------------------------------------------------------
  // Components (can be lazy loaded)
  // -------------------------------------------------------------------------

  components: {
    /** Match result entry modal - REQUIRED */
    MatchModal: ComponentType<SportMatchModalProps>;

    /** Display rules summary (sidebar) - OPTIONAL */
    RulesModule?: ComponentType<SportRulesModuleProps>;

    /** Configure sport-specific rules (wizard/settings) - OPTIONAL */
    RulesCustomizer?: ComponentType<SportRulesCustomizerProps>;

    /** Select from presets (wizard/settings) - OPTIONAL */
    PresetSelector?: ComponentType<SportPresetSelectorProps>;
  };

  // -------------------------------------------------------------------------
  // Scoring (optional - for live scoring support)
  // -------------------------------------------------------------------------

  scoringEngine?: SportScoringEngine;

  // -------------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------------

  /** Validate sport-specific configuration */
  validateConfig?: (config: unknown) => boolean;

  /** Validate score state */
  validateScore?: (score: unknown) => boolean;

  // -------------------------------------------------------------------------
  // Lifecycle Hooks (optional)
  // -------------------------------------------------------------------------

  /** Called when plugin is registered */
  onRegister?: () => void;

  /** Called when plugin is unregistered */
  onUnregister?: () => void;
}

// ============================================================================
// Type Guards
// ============================================================================

export function isValidSportPlugin(plugin: unknown): plugin is SportPlugin {
  if (!plugin || typeof plugin !== 'object') return false;

  const p = plugin as Partial<SportPlugin>;

  return (
    typeof p.id === 'string' &&
    p.sport !== undefined &&
    typeof p.sport.id === 'string' &&
    typeof p.sport.name === 'string' &&
    p.defaultConfig !== undefined &&
    p.components !== undefined &&
    typeof p.components.MatchModal === 'function'
  );
}

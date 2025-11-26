import { useSportStore } from '@/store/sportStore';
import type { SportType } from '@/types/sport';
import type { Tournament } from '@/types/tournament';
import type { SportPlugin } from './types';

/**
 * Sport Plugin Hooks
 *
 * React hooks for accessing sport plugins and configurations.
 */

// ============================================================================
// useSportPlugin - Get plugin by sport ID or active sport
// ============================================================================

/**
 * Get the plugin for a specific sport or the active sport.
 *
 * @param sportId - Optional sport ID. If not provided, uses active sport.
 * @returns The sport plugin or null if not registered.
 *
 * @example
 * // Get active sport plugin
 * const plugin = useSportPlugin();
 *
 * // Get specific sport plugin
 * const tennisPlugin = useSportPlugin('tennis');
 */
export function useSportPlugin(sportId?: SportType): SportPlugin | null {
  const activeSport = useSportStore((state) => state.activeSport);
  const getPlugin = useSportStore((state) => state.getPlugin);

  return getPlugin(sportId ?? activeSport);
}

// ============================================================================
// useSportConfig - Get sport config from tournament with backward compat
// ============================================================================

/**
 * Get sport-specific configuration from a tournament.
 * Handles backward compatibility with legacy `tennisConfig` field.
 *
 * @param tournament - The tournament to get config from.
 * @returns The sport configuration or null if not set.
 *
 * @example
 * const tennisConfig = useSportConfig<TennisMatchConfig>(tournament);
 */
export function useSportConfig<T = unknown>(tournament: Tournament): T | null {
  // Backward compatibility: use tennisConfig if sportConfig not set
  if (tournament.sport === 'tennis') {
    return (tournament.sportConfig ?? tournament.tennisConfig) as T | null;
  }

  return (tournament.sportConfig as T) ?? null;
}

// ============================================================================
// useSportComponents - Get plugin components
// ============================================================================

/**
 * Get the components from a sport plugin.
 *
 * @param sportId - Optional sport ID. If not provided, uses active sport.
 * @returns The plugin components or null if plugin not registered.
 *
 * @example
 * const { MatchModal, RulesModule } = useSportComponents('tennis') ?? {};
 */
export function useSportComponents(sportId?: SportType) {
  const plugin = useSportPlugin(sportId);
  return plugin?.components ?? null;
}

// ============================================================================
// useHasPlugin - Check if a plugin is registered
// ============================================================================

/**
 * Check if a sport plugin is registered.
 *
 * @param sportId - The sport ID to check.
 * @returns True if the plugin is registered.
 *
 * @example
 * const hasTennis = useHasPlugin('tennis');
 */
export function useHasPlugin(sportId: SportType): boolean {
  const hasPlugin = useSportStore((state) => state.hasPlugin);
  return hasPlugin(sportId);
}

// ============================================================================
// useAllPlugins - Get all registered plugins
// ============================================================================

/**
 * Get all registered sport plugins.
 *
 * @returns Array of all registered plugins.
 *
 * @example
 * const allPlugins = useAllPlugins();
 * allPlugins.forEach(plugin => console.log(plugin.sport.name));
 */
export function useAllPlugins(): SportPlugin[] {
  const getAllPlugins = useSportStore((state) => state.getAllPlugins);
  return getAllPlugins();
}

// ============================================================================
// useRegisterPlugin - Register a plugin (for initialization)
// ============================================================================

/**
 * Get the function to register a plugin.
 * Typically used in App.tsx or a setup module.
 *
 * @returns The registerPlugin function.
 *
 * @example
 * const registerPlugin = useRegisterPlugin();
 * useEffect(() => {
 *   registerPlugin(tennisPlugin);
 * }, []);
 */
export function useRegisterPlugin() {
  return useSportStore((state) => state.registerPlugin);
}

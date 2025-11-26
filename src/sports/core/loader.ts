import { useState, useEffect } from 'react';
import { useSportStore } from '@/store/sportStore';
import type { SportType } from '@/types/sport';
import type { SportPlugin } from './types';

/**
 * Sport Plugin Loader
 *
 * Provides lazy loading capabilities for sport plugins.
 * Plugins are loaded on-demand when needed.
 */

// ============================================================================
// Plugin Loaders Registry
// ============================================================================

type PluginLoader = () => Promise<{ default: SportPlugin } | SportPlugin>;

const sportLoaders: Partial<Record<SportType, PluginLoader>> = {
  tennis: () => import('../tennis/plugin').then((m) => m.tennisPlugin),
  basketball: () => import('../basketball/plugin').then((m) => m.basketballPlugin),
  // Add more sports here as they are implemented
  // football: () => import('../football/plugin').then(m => m.footballPlugin),
};

// ============================================================================
// loadSportPlugin - Load a plugin dynamically
// ============================================================================

/**
 * Load a sport plugin dynamically.
 *
 * @param sportId - The sport to load.
 * @returns Promise resolving to the loaded plugin.
 * @throws Error if no loader is registered for the sport.
 *
 * @example
 * const plugin = await loadSportPlugin('tennis');
 */
export async function loadSportPlugin(sportId: SportType): Promise<SportPlugin> {
  const loader = sportLoaders[sportId];

  if (!loader) {
    throw new Error(`No plugin loader registered for sport: ${sportId}`);
  }

  const result = await loader();

  // Handle both default exports and direct exports
  if ('default' in result) {
    return result.default;
  }

  return result as SportPlugin;
}

// ============================================================================
// loadAndRegisterPlugin - Load and register a plugin
// ============================================================================

/**
 * Load a sport plugin and register it in the store.
 *
 * @param sportId - The sport to load.
 * @returns Promise resolving to the loaded plugin.
 */
export async function loadAndRegisterPlugin(sportId: SportType): Promise<SportPlugin> {
  const registerPlugin = useSportStore.getState().registerPlugin;
  const plugin = await loadSportPlugin(sportId);
  registerPlugin(plugin);
  return plugin;
}

// ============================================================================
// useLazySportPlugin - React hook for lazy loading
// ============================================================================

interface UseLazySportPluginResult {
  plugin: SportPlugin | null;
  loading: boolean;
  error: Error | null;
}

/**
 * React hook for lazy loading a sport plugin.
 *
 * @param sportId - The sport to load.
 * @returns Object with plugin, loading state, and error.
 *
 * @example
 * const { plugin, loading, error } = useLazySportPlugin('tennis');
 *
 * if (loading) return <Spinner />;
 * if (error) return <ErrorMessage error={error} />;
 * if (!plugin) return null;
 *
 * const { MatchModal } = plugin.components;
 */
export function useLazySportPlugin(sportId: SportType): UseLazySportPluginResult {
  const [plugin, setPlugin] = useState<SportPlugin | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const registerPlugin = useSportStore((s) => s.registerPlugin);
  const existingPlugin = useSportStore((s) => s.getPlugin(sportId));

  useEffect(() => {
    // If plugin is already registered, use it
    if (existingPlugin) {
      setPlugin(existingPlugin);
      setLoading(false);
      return;
    }

    // Load the plugin
    setLoading(true);
    setError(null);

    loadSportPlugin(sportId)
      .then((loadedPlugin) => {
        registerPlugin(loadedPlugin);
        setPlugin(loadedPlugin);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sportId, existingPlugin, registerPlugin]);

  return { plugin, loading, error };
}

// ============================================================================
// initializePlugins - Load all plugins at startup
// ============================================================================

/**
 * Initialize all sport plugins.
 * Call this in App.tsx or main.tsx at startup.
 *
 * @param sports - Array of sport IDs to load. Defaults to tennis and basketball.
 * @returns Promise that resolves when all plugins are loaded.
 *
 * @example
 * // In App.tsx
 * useEffect(() => {
 *   initializePlugins(['tennis', 'basketball']);
 * }, []);
 */
export async function initializePlugins(
  sports: SportType[] = ['tennis', 'basketball']
): Promise<SportPlugin[]> {
  const results = await Promise.allSettled(
    sports.map((sportId) => loadAndRegisterPlugin(sportId))
  );

  const plugins: SportPlugin[] = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      plugins.push(result.value);
    } else {
      console.warn(`Failed to load plugin for ${sports[index]}:`, result.reason);
    }
  });

  return plugins;
}

// ============================================================================
// Exports
// ============================================================================

export { sportLoaders };

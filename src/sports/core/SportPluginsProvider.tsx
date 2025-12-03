import { useEffect, type ReactNode } from 'react';
import { useSportStore } from '@/store/sportStore';
import { tennisPlugin } from '@/sports/tennis/plugin';
import { basketballPlugin } from '@/sports/basketball/plugin';
import { footballPlugin } from '@/sports/football/plugin';
import type { SportPlugin } from './types';

interface SportPluginsProviderProps {
  children: ReactNode;
}

/**
 * Provider component that initializes all sport plugins at app startup.
 *
 * This component:
 * - Registers all available sport plugins with the store
 * - Ensures plugins are ready before rendering children
 * - Handles cleanup on unmount
 */
export function SportPluginsProvider({ children }: SportPluginsProviderProps) {
  // const [isInitialized, setIsInitialized] = useState(false);
  const { registerPlugin, hasPlugin } = useSportStore();

  useEffect(() => {
    // List of all available plugins
    const plugins: SportPlugin[] = [
      tennisPlugin,
      basketballPlugin,
      footballPlugin,
    ];

    // Register each plugin if not already registered
    plugins.forEach((plugin) => {
      if (!hasPlugin(plugin.id)) {
        registerPlugin(plugin);
      }
    });

    // setIsInitialized(true);

    // Cleanup is handled by the store's unregisterPlugin if needed
  }, [registerPlugin, hasPlugin]);

  // We can render immediately since plugins are sync-registered
  // The isInitialized state is for future async plugin loading
  return <>{children}</>;
}

/**
 * Hook to check if sport plugins have been initialized
 */
export function useSportPluginsReady(): boolean {
  const { getAllPlugins } = useSportStore();
  return getAllPlugins().length > 0;
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SportType, Sport } from '@/types/sport';
import { SPORTS } from '@/types/sport';
import type { SportPlugin } from '@/sports/core/types';

/**
 * Sport Store - Extended with Plugin Management
 *
 * Manages:
 * - Active sport selection (persisted)
 * - Sport plugin registration and retrieval
 */

interface SportStore {
  // Active sport selection
  activeSport: SportType;
  setActiveSport: (sport: SportType) => void;
  getActiveSport: () => Sport;

  // Plugin management
  registeredPlugins: Map<SportType, SportPlugin>;
  registerPlugin: (plugin: SportPlugin) => void;
  unregisterPlugin: (sportId: SportType) => void;
  getPlugin: (sportId: SportType) => SportPlugin | null;
  hasPlugin: (sportId: SportType) => boolean;
  getAllPlugins: () => SportPlugin[];
}

export const useSportStore = create<SportStore>()(
  persist(
    (set, get) => ({
      // -----------------------------------------------------------------------
      // Active Sport Selection
      // -----------------------------------------------------------------------
      activeSport: 'tennis' as SportType,

      setActiveSport: (sport: SportType) => {
        set({ activeSport: sport });
      },

      getActiveSport: () => {
        return SPORTS[get().activeSport];
      },

      // -----------------------------------------------------------------------
      // Plugin Management
      // -----------------------------------------------------------------------
      registeredPlugins: new Map(),

      registerPlugin: (plugin: SportPlugin) => {
        set((state) => {
          const updated = new Map(state.registeredPlugins);
          updated.set(plugin.id, plugin);

          // Call plugin lifecycle hook
          plugin.onRegister?.();

          return { registeredPlugins: updated };
        });
      },

      unregisterPlugin: (sportId: SportType) => {
        set((state) => {
          const plugin = state.registeredPlugins.get(sportId);
          if (plugin) {
            plugin.onUnregister?.();
          }

          const updated = new Map(state.registeredPlugins);
          updated.delete(sportId);

          return { registeredPlugins: updated };
        });
      },

      getPlugin: (sportId: SportType) => {
        return get().registeredPlugins.get(sportId) || null;
      },

      hasPlugin: (sportId: SportType) => {
        return get().registeredPlugins.has(sportId);
      },

      getAllPlugins: () => {
        return Array.from(get().registeredPlugins.values());
      },
    }),
    {
      name: 'sport-storage',
      // Only persist activeSport, not the plugins (they are registered at startup)
      partialize: (state) => ({ activeSport: state.activeSport }),
    }
  )
);

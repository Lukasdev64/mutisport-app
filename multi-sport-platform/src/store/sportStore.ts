import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SportType, Sport } from '@/types/sport';
import { SPORTS } from '@/types/sport';

interface SportStore {
  activeSport: SportType;
  setActiveSport: (sport: SportType) => void;
  getActiveSport: () => Sport;
}

export const useSportStore = create<SportStore>()(
  persist(
    (set, get) => ({
      activeSport: 'tennis' as SportType, // Default to tennis
      
      setActiveSport: (sport: SportType) => {
        set({ activeSport: sport });
      },
      
      getActiveSport: () => {
        return SPORTS[get().activeSport];
      }
    }),
    {
      name: 'sport-storage'
    }
  )
);

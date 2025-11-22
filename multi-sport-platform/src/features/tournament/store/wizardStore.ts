import { create } from 'zustand';
import type { TournamentFormat, Player } from '@/types/tournament';
import { v4 as uuidv4 } from 'uuid';

interface WizardState {
  step: number;
  totalSteps: number;
  tournamentName: string;
  format: TournamentFormat | null;
  ageCategory: string;
  customAgeRules: { min?: number; max?: number };
  isRanked: boolean;
  rankingRange: { min?: string; max?: string };
  mode: 'instant' | 'planned';
  
  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setMode: (mode: 'instant' | 'planned') => void;
  setTournamentName: (name: string) => void;
  setFormat: (format: TournamentFormat) => void;
  setAgeCategory: (category: string) => void;
  setCustomAgeRules: (rules: { min?: number; max?: number }) => void;
  setIsRanked: (isRanked: boolean) => void;
  setRankingRange: (range: { min?: string; max?: string }) => void;
  addPlayer: (name: string) => void;
  addExistingPlayer: (player: Player) => void;
  removePlayer: (id: string) => void;
  reset: () => void;
}

export const useWizardStore = create<WizardState>((set) => ({
  step: 1,
  totalSteps: 4, // Increased to 4 to include Mode Selection
  mode: 'instant',
  tournamentName: '',
  format: null,
  ageCategory: 'open',
  customAgeRules: { min: undefined, max: undefined },
  isRanked: false,
  rankingRange: { min: undefined, max: undefined },
  players: [],

  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: Math.min(state.step + 1, state.totalSteps) })),
  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
  
  setMode: (mode) => set({ mode }),
  setTournamentName: (name) => set({ tournamentName: name }),
  setFormat: (format) => set({ format }),
  setAgeCategory: (category) => set({ ageCategory: category }),
  setCustomAgeRules: (rules) => set({ customAgeRules: rules }),
  setIsRanked: (isRanked) => set({ isRanked }),
  setRankingRange: (range) => set({ rankingRange: range }),
  
  addPlayer: (name) => set((state) => {
    const id = uuidv4();
    const bgColors = ['b6e3f4', 'c0aede', 'd1d4f9'];
    const bg = bgColors[Math.floor(Math.random() * bgColors.length)];
    return {
      players: [
        ...state.players,
        { id, name: name.trim(), avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(id)}&backgroundColor=${bg}` }
      ]
    };
  }),

  addExistingPlayer: (player: Player) => set((state) => ({
    players: [...state.players, player]
  })),
  
  removePlayer: (id) => set((state) => ({
    players: state.players.filter((p) => p.id !== id)
  })),
  
  reset: () => set({
    step: 1,
    mode: 'instant',
    tournamentName: '',
    format: null,
    ageCategory: 'open',
    customAgeRules: { min: undefined, max: undefined },
    players: []
  })
}));

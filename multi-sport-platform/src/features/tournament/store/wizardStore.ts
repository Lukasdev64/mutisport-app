import { create } from 'zustand';
import type { TournamentFormat, Player } from '@/types/tournament';
import { v4 as uuidv4 } from 'uuid';

interface WizardState {
  step: number;
  totalSteps: number;
  tournamentName: string;
  format: TournamentFormat | null;
  players: Player[];
  
  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setTournamentName: (name: string) => void;
  setFormat: (format: TournamentFormat) => void;
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  reset: () => void;
}

export const useWizardStore = create<WizardState>((set) => ({
  step: 1,
  totalSteps: 3,
  tournamentName: '',
  format: null,
  players: [],

  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: Math.min(state.step + 1, state.totalSteps) })),
  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
  
  setTournamentName: (name) => set({ tournamentName: name }),
  setFormat: (format) => set({ format }),
  
  addPlayer: (name) => set((state) => ({
    players: [
      ...state.players,
      { id: uuidv4(), name: name.trim(), avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}` }
    ]
  })),
  
  removePlayer: (id) => set((state) => ({
    players: state.players.filter((p) => p.id !== id)
  })),
  
  reset: () => set({
    step: 1,
    tournamentName: '',
    format: null,
    players: []
  })
}));

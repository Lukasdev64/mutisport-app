import { create } from 'zustand';
import type { TournamentFormat, Player } from '@/types/tournament';
import { v4 as uuidv4 } from 'uuid';

interface WizardState {
  // Navigation
  step: number;
  totalSteps: number;
  mode: 'instant' | 'planned';
  
  // Step 2: Tournament Setup (NEW)
  tournamentName: string;
  startDate: Date;
  venue: string;
  description: string;
  
  // Step 3: Format & Rules
  format: TournamentFormat | null;
  ageCategory: string;
  customAgeRules: { min?: number; max?: number };
  isRanked: boolean;
  rankingRange: { min?: string; max?: string };
  estimatedMaxParticipants: number; // NEW: Initial estimate
  
  // Step 4: Player Recruitment
  campaignFilters: {
    minAge?: number;
    maxAge?: number;
    minRank?: string;
    maxRank?: string;
  };
  
  // Step 5: Player Selection
  players: Player[]; // All registered players
  selectedPlayers: Player[]; // Only the selected participants for the tournament
  maxParticipants: number | null; // Final confirmed count
  
  // Actions - Navigation
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setMode: (mode: 'instant' | 'planned') => void;
  
  // Actions - Step 2: Tournament Setup
  setTournamentName: (name: string) => void;
  setStartDate: (date: Date) => void;
  setVenue: (venue: string) => void;
  setDescription: (description: string) => void;
  
  // Actions - Step 3: Format & Rules
  setFormat: (format: TournamentFormat) => void;
  setAgeCategory: (category: string) => void;
  setCustomAgeRules: (rules: { min?: number; max?: number }) => void;
  setIsRanked: (isRanked: boolean) => void;
  setRankingRange: (range: { min?: string; max?: string }) => void;
  setEstimatedMaxParticipants: (count: number) => void;
  
  // Actions - Step 4: Player Recruitment
  setCampaignFilters: (filters: { minAge?: number; maxAge?: number; minRank?: string; maxRank?: string }) => void;
  
  // Actions - Step 5: Player Selection
  addPlayer: (name: string) => void;
  addExistingPlayer: (player: Player) => void;
  removePlayer: (id: string) => void;
  setMaxParticipants: (count: number) => void;
  setSelectedPlayers: (players: Player[]) => void; // NEW: Set final selected players
  
  reset: () => void;
}

export const useWizardStore = create<WizardState>((set) => ({
  // Initial state - Navigation
  step: 1,
  totalSteps: 6, // Updated: 6 steps for Planned mode (selection done in Campaign Setup)
  mode: 'instant',
  
  // Initial state - Step 2: Tournament Setup
  tournamentName: '',
  startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default: 1 week from now
  venue: '',
  description: '',
  
  // Initial state - Step 3: Format & Rules
  format: null,
  ageCategory: 'open',
  customAgeRules: { min: undefined, max: undefined },
  isRanked: false,
  rankingRange: { min: undefined, max: undefined },
  estimatedMaxParticipants: 16, // Default estimate
  
  // Initial state - Step 4: Player Recruitment
  campaignFilters: {},
  
  // Initial state - Step 5: Player Selection
  players: [],
  selectedPlayers: [], // NEW: Initially empty
  maxParticipants: null,

  // Actions - Navigation
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: Math.min(state.step + 1, state.totalSteps) })),
  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
  setMode: (mode) => set({ mode }),
  
  // Actions - Step 2: Tournament Setup
  setTournamentName: (tournamentName) => set({ tournamentName }),
  setStartDate: (startDate) => set({ startDate }),
  setVenue: (venue) => set({ venue }),
  setDescription: (description) => set({ description }),
  
  // Actions - Step 3: Format & Rules
  setFormat: (format) => set({ format }),
  setAgeCategory: (ageCategory) => set({ ageCategory }),
  setCustomAgeRules: (customAgeRules) => set({ customAgeRules }),
  setIsRanked: (isRanked) => set({ isRanked }),
  setRankingRange: (rankingRange) => set({ rankingRange }),
  setEstimatedMaxParticipants: (estimatedMaxParticipants) => set({ estimatedMaxParticipants }),
  
  // Actions - Step 4: Player Recruitment
  setCampaignFilters: (campaignFilters) => set({ campaignFilters }),
  
  // Actions - Step 5: Player Selection
  addPlayer: (name) => set((state) => {
    const id = uuidv4();
    const bgColors = ['b6e3f4', 'c0aede', 'd1d4f9'];
    const bg = bgColors[Math.floor(Math.random() * bgColors.length)];
    return {
      players: [
        ...state.players,
        { 
          id, 
          name: name.trim(), 
          avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(id)}&backgroundColor=${bg}` 
        }
      ]
    };
  }),

  addExistingPlayer: (player) => set((state) => ({
    players: [...state.players, player]
  })),
  
  removePlayer: (id) => set((state) => ({
    players: state.players.filter((p) => p.id !== id)
  })),

  setMaxParticipants: (maxParticipants) => set({ maxParticipants }),
  setSelectedPlayers: (selectedPlayers) => set({ selectedPlayers }), // NEW: Set selected players
  
  reset: () => set({
    step: 1,
    mode: 'instant',
    tournamentName: '',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    venue: '',
    description: '',
    format: null,
    ageCategory: 'open',
    customAgeRules: { min: undefined, max: undefined },
    isRanked: false,
    rankingRange: { min: undefined, max: undefined },
    estimatedMaxParticipants: 16,
    campaignFilters: {},
    players: [],
    maxParticipants: null
  })
}));

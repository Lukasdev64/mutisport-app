/**
 * Tennis Wizard Store
 *
 * Dedicated Zustand store for the Tennis tournament creation wizard.
 * Completely isolated from other sports - no contamination possible.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TennisMatchConfig } from '@/types/tennis';
import type { TournamentFormat, Player } from '@/types/tournament';
import { TENNIS_TOURNAMENT_PRESETS } from '../tournamentPresets';

export type TennisWizardMode = 'quickstart' | 'instant' | 'planned';

export interface TennisWizardState {
  // Navigation
  step: number;
  totalSteps: number;
  mode: TennisWizardMode;

  // Tournament Info (for planned mode)
  tournamentName: string;
  startDate: Date;
  venue: string;
  description: string;

  // Tennis-Specific Configuration
  presetId: string | null;
  config: TennisMatchConfig | null;

  // Tournament Format
  format: TournamentFormat | null;

  // Age & Ranking Criteria
  ageCategory: string;
  customAgeRules: { min?: number; max?: number };
  isRanked: boolean;
  rankingRange: { min?: string; max?: string };
  estimatedMaxParticipants: number;

  // Players
  players: Player[];
  selectedPlayers: Player[];
  maxParticipants: number | null;

  // Campaign (planned mode)
  campaignFilters: {
    ageMin?: number;
    ageMax?: number;
    rankingMin?: string;
    rankingMax?: string;
  };

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setMode: (mode: TennisWizardMode) => void;
  setTournamentName: (name: string) => void;
  setStartDate: (date: Date) => void;
  setVenue: (venue: string) => void;
  setDescription: (description: string) => void;
  setPreset: (presetId: string) => void;
  setConfig: (config: TennisMatchConfig) => void;
  setFormat: (format: TournamentFormat) => void;
  setAgeCategory: (category: string) => void;
  setCustomAgeRules: (rules: { min?: number; max?: number }) => void;
  setIsRanked: (isRanked: boolean) => void;
  setRankingRange: (range: { min?: string; max?: string }) => void;
  setEstimatedMaxParticipants: (count: number) => void;
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  setSelectedPlayers: (players: Player[]) => void;
  setMaxParticipants: (max: number | null) => void;
  setCampaignFilters: (filters: TennisWizardState['campaignFilters']) => void;
  reset: () => void;
}

const getInitialState = () => ({
  // Navigation
  step: 1,
  totalSteps: 4,
  mode: 'instant' as TennisWizardMode,

  // Tournament Info
  tournamentName: '',
  startDate: new Date(),
  venue: '',
  description: '',

  // Tennis Config - default to "custom" preset (Match Amical)
  presetId: 'custom',
  config: TENNIS_TOURNAMENT_PRESETS.find(p => p.id === 'custom')?.config ?? null,

  // Format
  format: 'single_elimination' as TournamentFormat,

  // Age & Ranking
  ageCategory: 'senior',
  customAgeRules: {},
  isRanked: false,
  rankingRange: {},
  estimatedMaxParticipants: 8,

  // Players
  players: [],
  selectedPlayers: [],
  maxParticipants: null,

  // Campaign
  campaignFilters: {},
});

export const useTennisWizardStore = create<TennisWizardState>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      // Navigation
      setStep: (step) => set({ step }),
      nextStep: () => set((state) => ({ step: Math.min(state.step + 1, state.totalSteps) })),
      prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),

      setMode: (mode) => {
        const totalSteps = mode === 'quickstart' ? 1 : mode === 'instant' ? 4 : 6;
        set({ mode, totalSteps, step: 1 });
      },

      // Tournament Info
      setTournamentName: (tournamentName) => set({ tournamentName }),
      setStartDate: (startDate) => set({ startDate }),
      setVenue: (venue) => set({ venue }),
      setDescription: (description) => set({ description }),

      // Tennis Config
      setPreset: (presetId) => {
        const preset = TENNIS_TOURNAMENT_PRESETS.find(p => p.id === presetId);
        if (preset) {
          set({ presetId, config: preset.config });
        } else {
          set({ presetId });
        }
      },
      setConfig: (config) => set({ config }),

      // Format
      setFormat: (format) => set({ format }),

      // Age & Ranking
      setAgeCategory: (ageCategory) => set({ ageCategory }),
      setCustomAgeRules: (customAgeRules) => set({ customAgeRules }),
      setIsRanked: (isRanked) => set({ isRanked }),
      setRankingRange: (rankingRange) => set({ rankingRange }),
      setEstimatedMaxParticipants: (estimatedMaxParticipants) => set({ estimatedMaxParticipants }),

      // Players
      setPlayers: (players) => set({ players }),
      addPlayer: (player) => set((state) => ({ players: [...state.players, player] })),
      removePlayer: (playerId) => set((state) => ({
        players: state.players.filter(p => p.id !== playerId)
      })),
      setSelectedPlayers: (selectedPlayers) => set({ selectedPlayers }),
      setMaxParticipants: (maxParticipants) => set({ maxParticipants }),

      // Campaign
      setCampaignFilters: (campaignFilters) => set({ campaignFilters }),

      // Reset
      reset: () => set(getInitialState()),
    }),
    {
      name: 'tennis-wizard-storage',
      partialize: (state) => ({
        // Only persist essential data, not navigation state
        tournamentName: state.tournamentName,
        presetId: state.presetId,
        config: state.config,
        format: state.format,
        players: state.players,
      }),
    }
  )
);

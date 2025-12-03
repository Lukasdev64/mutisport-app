import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { FootballMatchConfig } from '@/types/football';
import type { TournamentFormat, Player } from '@/types/tournament';
import type { FootballTournamentConfig } from '../models/tournament-formats';
import { DEFAULT_FOOTBALL_CONFIG } from '../config';

export type FootballWizardMode = 'quickstart' | 'instant' | 'planned';

export interface TeamPlayer {
  id: string;
  name: string;
  number?: number;
  position?: 'GK' | 'DEF' | 'MID' | 'FWD';
}

export interface Team {
  id: string;
  name: string;
  players: TeamPlayer[]; // List of player objects
  formation: string;
}

export interface FootballWizardState {
  // Navigation
  step: number;
  totalSteps: number;
  mode: FootballWizardMode;

  // Tournament Info
  tournamentName: string;
  startDate: Date;
  venue: string;
  description: string;

  // Football-Specific Configuration
  presetId: string | null;
  config: FootballMatchConfig;
  
  // Advanced Format Configuration
  footballFormatConfig: FootballTournamentConfig | null;

  // Tournament Format (Legacy/Simple)
  format: TournamentFormat | null;

  // Participants (Teams)
  teams: Team[];
  
  // Legacy (kept for compatibility but unused in new UI)
  players: Player[];
  selectedPlayers: Player[];
  maxParticipants: number | null;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setMode: (mode: FootballWizardMode) => void;
  setTournamentInfo: (info: Partial<Pick<FootballWizardState, 'tournamentName' | 'startDate' | 'venue' | 'description'>>) => void;
  setConfig: (config: FootballMatchConfig) => void;
  setFootballFormatConfig: (config: FootballTournamentConfig) => void;
  setFormat: (format: TournamentFormat) => void;
  
  // Team Actions
  addTeam: (name: string) => void;
  removeTeam: (id: string) => void;
  updateTeamFormation: (teamId: string, formation: string) => void;
  addPlayerToTeam: (teamId: string, player: { name: string, number?: number, position?: 'GK' | 'DEF' | 'MID' | 'FWD' }) => void;
  removePlayerFromTeam: (teamId: string, playerId: string) => void;
  setTeams: (teams: Team[]) => void;

  setPlayers: (players: Player[]) => void;
  togglePlayerSelection: (playerId: string) => void;
  reset: () => void;
}

const getInitialState = () => ({
  step: 1,
  totalSteps: 4,
  mode: 'quickstart' as FootballWizardMode,
  
  tournamentName: '',
  startDate: new Date(),
  venue: '',
  description: '',

  presetId: null,
  config: DEFAULT_FOOTBALL_CONFIG,
  footballFormatConfig: null,
  format: 'single_elimination' as TournamentFormat,

  teams: [],
  players: [],
  selectedPlayers: [],
  maxParticipants: null,
});

export const useFootballWizardStore = create<FootballWizardState>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      setStep: (step) => set({ step }),
      nextStep: () => set((state) => ({ step: Math.min(state.step + 1, state.totalSteps) })),
      prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
      
      setMode: (mode) => set({ mode }),
      
      setTournamentInfo: (info) => set((state) => ({ ...state, ...info })),
      
      setConfig: (config) => set({ config }),
      setFootballFormatConfig: (config) => set({ footballFormatConfig: config }),
      
      setFormat: (format) => set({ format }),
      
      // Team Actions Implementation
      addTeam: (name) => set((state) => ({
        teams: [...state.teams, { id: uuidv4(), name, players: [], formation: '4-4-2' }]
      })),
      
      removeTeam: (id) => set((state) => ({
        teams: state.teams.filter(t => t.id !== id)
      })),

      updateTeamFormation: (teamId, formation) => set((state) => ({
        teams: state.teams.map(t => 
          t.id === teamId ? { ...t, formation } : t
        )
      })),
      
      addPlayerToTeam: (teamId, player) => set((state) => ({
        teams: state.teams.map(t => 
          t.id === teamId 
            ? { ...t, players: [...t.players, { ...player, id: uuidv4() }] }
            : t
        )
      })),
      
      removePlayerFromTeam: (teamId, playerId) => set((state) => ({
        teams: state.teams.map(t => 
          t.id === teamId 
            ? { ...t, players: t.players.filter(p => p.id !== playerId) }
            : t
        )
      })),

      setTeams: (teams) => set({ teams }),

      setPlayers: (players) => set({ players }),
      
      togglePlayerSelection: (playerId) => set((state) => {
        const isSelected = state.selectedPlayers.some(p => p.id === playerId);
        if (isSelected) {
          return { selectedPlayers: state.selectedPlayers.filter(p => p.id !== playerId) };
        } else {
          const player = state.players.find(p => p.id === playerId);
          return player ? { selectedPlayers: [...state.selectedPlayers, player] } : {};
        }
      }),

      reset: () => set(getInitialState()),
    }),
    {
      name: 'football-wizard-storage',
    }
  )
);

import type { SportType } from './sport';
import type { TennisMatchConfig } from './tennis';

export type TournamentFormat = 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';

export type TournamentStatus = 'draft' | 'active' | 'completed';

// Sync status for local-first architecture
export type SyncStatus = 'synced' | 'pending' | 'local-only';

export interface Player {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  age?: number;
  rank?: string;
  ranking?: string;
  registrationDate?: string;
  constraints?: {
    unavailableDates: string[];
    maxMatchesPerDay: number;
  };
  metadata?: any; // Flexible field for sport-specific data (e.g., team roster, formation)
}

export interface MatchResult {
  player1Score: number;
  player2Score: number;
  winnerId?: string;
  isWalkover?: boolean;
}

export interface Match {
  id: string;
  tournamentId?: string;
  roundId?: string;
  player1Id?: string;
  player2Id?: string;
  result?: MatchResult;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'active';
  nextMatchId?: string;
  scheduledAt?: string;
  location?: string;
  resourceId?: string;
  remindersSentAt?: string[]; // ISO dates of reminders already sent
}

// Scheduling configuration for tournaments
export type ResourceType = 'court' | 'field' | 'table';

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
}

export interface SchedulingConfig {
  enabled: boolean;
  startDate: string;              // ISO date YYYY-MM-DD
  endDate?: string;               // ISO date (for multi-day tournaments)
  dailyStartTime: string;         // "09:00"
  dailyEndTime: string;           // "18:00"
  matchDurationMinutes: number;   // Default: 60
  breakBetweenMatches: number;    // Minutes between matches, default: 15
  resources: Resource[];
}

export interface ReminderConfig {
  enabled: boolean;
  reminderTimes: number[];        // Minutes before match [15, 60, 1440] = 15min, 1h, 1day
  notifyOnRoundStart: boolean;
  notifyOnMatchEnd: boolean;
}

export interface Round {
  id: string;
  tournamentId?: string;
  number?: number;
  name: string;
  matches: Match[];
  status?: 'pending' | 'active' | 'completed';
}

/**
 * Generic sport configuration type.
 * Each sport plugin defines its own config structure.
 * Use useSportConfig() hook to get typed config based on sport.
 */
export type SportConfig = Record<string, unknown>;

export interface Tournament {
  id: string;
  name: string;
  sport?: SportType;
  /**
   * Generic sport configuration - use this for new integrations.
   * Will contain sport-specific config (tennis, basketball, etc.)
   */
  sportConfig?: SportConfig;
  /**
   * @deprecated Use sportConfig instead. Kept for backward compatibility.
   */
  tennisConfig?: TennisMatchConfig;
  ageCategory?: string;
  isRanked?: boolean;
  rankingRange?: { min?: string; max?: string };
  format: TournamentFormat;
  status: TournamentStatus;
  archived?: boolean;
  location?: string;
  tournamentDate?: string;
  players: Player[];
  rounds: Round[];
  createdAt: string;
  updatedAt: string;
  settings: {
    pointsForWin: number;
    pointsForDraw: number;
    pointsForLoss: number;
  };
  // Scheduling & Notifications
  schedulingConfig?: SchedulingConfig;
  reminderConfig?: ReminderConfig;
  // Sync status for cloud synchronization
  syncStatus?: SyncStatus;
}

export interface Standing {
  playerId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  buchholz?: number;
}

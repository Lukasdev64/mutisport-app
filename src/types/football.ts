export type FootballFormat = 'standard' | 'futsal' | 'seven_a_side' | 'five_a_side';

export interface FootballMatchConfig {
  format: FootballFormat;
  halfDurationMinutes: number; // 45 for standard, 20 for futsal, etc.
  halvesCount: number; // Usually 2
  extraTimeEnabled: boolean;
  extraTimeDurationMinutes: number; // 15 for standard
  penaltiesEnabled: boolean; // If draw after extra time
  maxSubstitutions: number;
}

export interface FootballMatchScore {
  homeScore: number;
  awayScore: number;
  period: '1st_half' | '2nd_half' | 'extra_time_1' | 'extra_time_2' | 'penalties' | 'finished';
  timeElapsed: number; // in minutes
  events: FootballMatchEvent[];
  penaltiesScore?: {
    home: number;
    away: number;
  };
}

export interface FootballMatchEvent {
  id: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution';
  team: 'home' | 'away';
  minute: number;
  playerId?: string;
  playerInId?: string; // For substitutions
  playerOutId?: string; // For substitutions
}

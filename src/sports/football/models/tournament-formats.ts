/**
 * Modèle de données pour les formats de tournois de football.
 * Basé sur la demande spécifique pour supporter :
 * - Championnat
 * - Phase de poules
 * - Élimination directe
 * - Classement général
 * - Ligue + Play-offs
 */

export type FootballFormatType = 
  | 'CHAMPIONNAT' 
  | 'PHASE_POULES' 
  | 'ELIMINATION_DIRECTE' 
  | 'CLASSEMENT_GENERAL' 
  | 'LIGUE_PLUS_PLAYOFFS';

export type TieBreakerCriteria = 
  | 'points' 
  | 'difference_buts' 
  | 'buts_marques' 
  | 'confrontation_directe' 
  | 'fair_play' 
  | 'tirage_au_sort';

// --- Configurations Spécifiques ---

export interface BaseFootballConfig {
  matchDuration: number; // minutes
  extraTime: boolean;
  penaltyShootout: boolean;
  points: {
    win: number;
    draw: number;
    loss: number;
  };
  tieBreakers: TieBreakerCriteria[];
}

export interface ChampionshipConfig extends BaseFootballConfig {
  type: 'CHAMPIONNAT';
  hasReturnLeg: boolean; // Aller-retour
}

export interface GroupStageConfig extends BaseFootballConfig {
  type: 'PHASE_POULES';
  numberOfGroups: number;
  teamsPerGroup?: number; // Calculé ou imposé
  qualifiersPerGroup: number;
  bestThirdsQualifiers: number;
  hasReturnLeg: boolean;
}

export interface KnockoutConfig extends BaseFootballConfig {
  type: 'ELIMINATION_DIRECTE';
  hasReturnLeg: boolean; // Aller-retour (sauf finale souvent)
  awayGoalsRule: boolean; // Buts à l'extérieur
  hasThirdPlaceMatch: boolean;
}

export interface GeneralRankingConfig extends BaseFootballConfig {
  type: 'CLASSEMENT_GENERAL';
  matchesPerTeam?: number; // Si pas round-robin complet
}

export interface LeaguePlayoffsConfig extends BaseFootballConfig {
  type: 'LIGUE_PLUS_PLAYOFFS';
  regularSeason: ChampionshipConfig;
  playoffs: KnockoutConfig;
  playoffTeamsCount: number; // Top 4, Top 8...
}

export type FootballTournamentConfig = 
  | ChampionshipConfig 
  | GroupStageConfig 
  | KnockoutConfig 
  | GeneralRankingConfig 
  | LeaguePlayoffsConfig;

// --- Extensions du Modèle Match ---

export interface FootballMatchMeta {
  stage: string; // "GROUP_A", "QUARTER_FINAL", "REGULAR_SEASON"
  leg: 1 | 2;
  homeScore?: number;
  awayScore?: number;
  extraTime?: boolean;
  penaltyShootout?: {
    home: number;
    away: number;
  };
  aggregateScore?: {
    home: number;
    away: number;
  };
}

// --- Classements ---

export interface FootballStanding {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string[]; // ['W', 'D', 'L', ...]
  rank: number;
  groupId?: string; // Pour phase de poules
}

import type { Tournament, Match, Player, Round, TournamentFormat } from './tournament';

/**
 * User roles for tournament arena access control
 */
export type UserRole = 'organizer' | 'referee' | 'spectator';

/**
 * Arena navigation tabs for mobile view
 */
export type ArenaTab = 'bracket' | 'matches' | 'standings';

/**
 * Arena tab configuration
 */
export interface ArenaTabConfig {
  id: ArenaTab;
  label: string;
  icon: string; // lucide icon name
}

export const ARENA_TABS: ArenaTabConfig[] = [
  { id: 'bracket', label: 'Bracket', icon: 'GitBranch' },
  { id: 'matches', label: 'Matchs', icon: 'Swords' },
  { id: 'standings', label: 'Classement', icon: 'Trophy' },
];

/**
 * Props for mobile arena layout
 */
export interface ArenaMobileLayoutProps {
  tournament: Tournament;
  role: UserRole;
  onOpenSettings: () => void;
  onOpenShare: () => void;
}

/**
 * Props for mobile match card
 */
export interface MobileMatchCardProps {
  match: Match;
  tournament: Tournament;
  player1?: Player;
  player2?: Player;
  role: UserRole;
  onTap: () => void;
  onQuickScore?: () => void;
}

/**
 * Props for mobile match sheet (bottom sheet)
 */
export interface MobileMatchSheetProps {
  match: Match | null;
  tournament: Tournament;
  role: UserRole;
  isOpen: boolean;
  onClose: () => void;
  onScoreUpdate?: () => void;
}

/**
 * Props for mobile bracket view
 */
export interface MobileBracketViewProps {
  tournament: Tournament;
  onMatchSelect: (match: Match) => void;
}

/**
 * Props for mobile standings view
 */
export interface MobileStandingsViewProps {
  tournament: Tournament;
  onPlayerTap?: (playerId: string) => void;
}

/**
 * Props for mobile match list
 */
export interface MobileMatchListProps {
  tournament: Tournament;
  role: UserRole;
  onMatchSelect: (match: Match) => void;
  onQuickScore?: (match: Match) => void;
}

/**
 * Props for FAB quick actions
 */
export interface MobileQuickActionsProps {
  role: UserRole;
  tournament: Tournament;
  onSettings: () => void;
  onShare: () => void;
  onScoreMatch?: (matchId: string) => void;
}

/**
 * Match status for display purposes
 */
export type MatchDisplayStatus = 'upcoming' | 'live' | 'completed' | 'scheduled';

/**
 * Get display status for a match
 */
export function getMatchDisplayStatus(match: Match): MatchDisplayStatus {
  if (match.result?.winnerId) return 'completed';
  if (match.status === 'in_progress' || match.status === 'active') return 'live';
  if (match.scheduledAt) return 'scheduled';
  return 'upcoming';
}

/**
 * Match grouping by date for mobile list
 */
export interface MatchGroup {
  date: string; // ISO date string or 'today' / 'tomorrow' / 'upcoming'
  label: string; // Display label
  matches: Match[];
}

// ============================================================================
// Bracket Carousel Types (Mobile)
// ============================================================================

/**
 * Props for bracket round carousel container
 */
export interface BracketRoundCarouselProps {
  rounds: Round[];
  players: Player[];
  format: TournamentFormat;
  onMatchSelect: (match: Match) => void;
}

/**
 * Props for individual round slide in carousel
 */
export interface RoundSlideProps {
  round: Round;
  roundIndex: number;
  totalRounds: number;
  players: Player[];
  format: TournamentFormat;
  onMatchSelect: (match: Match) => void;
}

/**
 * Props for bracket-optimized match card
 */
export interface BracketMatchCardProps {
  match: Match;
  player1?: Player;
  player2?: Player;
  size: 'large' | 'compact';
  showProgression?: boolean;
  matchNumber?: number;
  isLastRound?: boolean;
  onTap: () => void;
}

/**
 * Props for round indicator (dots/pills)
 */
export interface RoundIndicatorProps {
  rounds: Round[];
  currentIndex: number;
  onRoundSelect: (index: number) => void;
}

/**
 * Layout configuration for bracket match cards
 */
export interface BracketLayoutConfig {
  columns: 1 | 2;
  cardSize: 'large' | 'compact';
  gap: string;
}

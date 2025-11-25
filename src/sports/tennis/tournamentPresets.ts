import type { TennisMatchConfig } from '@/types/tennis';

export type TournamentCategory = 'grand_slam' | 'atp' | 'wta' | 'team' | 'junior' | 'custom';

export interface TournamentPreset {
  id: string;
  name: string;
  category: TournamentCategory;
  description: string;
  emoji: string;
  config: TennisMatchConfig;
  isOfficial: boolean;
}

export const TENNIS_TOURNAMENT_PRESETS: TournamentPreset[] = [
  // ========== GRAND SLAMS ==========
  {
    id: 'australian-open',
    name: 'Australian Open',
    category: 'grand_slam',
    description: 'Melbourne - Hard Court',
    emoji: '🇦🇺',
    config: {
      format: 'best_of_5',
      surface: 'hard',
      tiebreakAt: 6,
      finalSetTiebreak: true,
      finalSetTiebreakPoints: 10, // Super tie-break at 6-6 in 5th
      decidingPointAtDeuce: false,
      letRule: true,
      coachingAllowed: true, // Coaching allowed since 2024
      challengesPerSet: 3,
      warmupMinutes: 5,
      changeoverSeconds: 90,
      betweenPointsSeconds: 25
    },
    isOfficial: true
  },
  {
    id: 'roland-garros',
    name: 'Roland Garros',
    category: 'grand_slam',
    description: 'Paris - Clay Court',
    emoji: '🇫🇷',
    config: {
      format: 'best_of_5',
      surface: 'clay',
      tiebreakAt: 6,
      finalSetTiebreak: false, // No tiebreak in 5th set - play to 2-game lead
      decidingPointAtDeuce: false,
      letRule: true,
      coachingAllowed: true,
      challengesPerSet: 3,
      warmupMinutes: 5,
      changeoverSeconds: 90,
      betweenPointsSeconds: 25
    },
    isOfficial: true
  },
  {
    id: 'wimbledon',
    name: 'Wimbledon',
    category: 'grand_slam',
    description: 'London - Grass Court',
    emoji: '🇬🇧',
    config: {
      format: 'best_of_5',
      surface: 'grass',
      tiebreakAt: 6,
      finalSetTiebreak: true,
      finalSetTiebreakPoints: 7, // Standard tiebreak at 12-12 in 5th
      decidingPointAtDeuce: false,
      letRule: true,
      coachingAllowed: false, // Wimbledon maintains traditional no-coaching rule
      challengesPerSet: 3,
      warmupMinutes: 5,
      changeoverSeconds: 90,
      betweenPointsSeconds: 25
    },
    isOfficial: true
  },
  {
    id: 'us-open',
    name: 'US Open',
    category: 'grand_slam',
    description: 'New York - Hard Court',
    emoji: '🇺🇸',
    config: {
      format: 'best_of_5',
      surface: 'hard',
      tiebreakAt: 6,
      finalSetTiebreak: true,
      finalSetTiebreakPoints: 7, // Standard tiebreak at 6-6 in 5th
      decidingPointAtDeuce: false,
      letRule: true,
      coachingAllowed: true,
      challengesPerSet: 3,
      warmupMinutes: 5,
      changeoverSeconds: 90,
      betweenPointsSeconds: 25
    },
    isOfficial: true
  },

  // ========== ATP TOUR ==========
  {
    id: 'atp-masters-1000',
    name: 'ATP Masters 1000',
    category: 'atp',
    description: 'Premier ATP Events',
    emoji: '🏆',
    config: {
      format: 'best_of_3',
      surface: 'hard', // Varies by tournament
      tiebreakAt: 6,
      finalSetTiebreak: true,
      finalSetTiebreakPoints: 10, // Super tie-break in 3rd set
      decidingPointAtDeuce: false,
      letRule: true,
      coachingAllowed: true,
      challengesPerSet: 3,
      warmupMinutes: 5,
      changeoverSeconds: 90,
      betweenPointsSeconds: 25
    },
    isOfficial: true
  },
  {
    id: 'atp-500',
    name: 'ATP 500',
    category: 'atp',
    description: 'ATP 500 Series',
    emoji: '🎾',
    config: {
      format: 'best_of_3',
      surface: 'hard',
      tiebreakAt: 6,
      finalSetTiebreak: true,
      finalSetTiebreakPoints: 10,
      decidingPointAtDeuce: false,
      letRule: true,
      coachingAllowed: true,
      challengesPerSet: 3,
      warmupMinutes: 5,
      changeoverSeconds: 90,
      betweenPointsSeconds: 25
    },
    isOfficial: true
  },
  {
    id: 'atp-250',
    name: 'ATP 250',
    category: 'atp',
    description: 'ATP 250 Series',
    emoji: '🎾',
    config: {
      format: 'best_of_3',
      surface: 'hard',
      tiebreakAt: 6,
      finalSetTiebreak: true,
      finalSetTiebreakPoints: 10,
      decidingPointAtDeuce: false,
      letRule: true,
      coachingAllowed: true,
      challengesPerSet: 3,
      warmupMinutes: 5,
      changeoverSeconds: 90,
      betweenPointsSeconds: 25
    },
    isOfficial: true
  },

  // ========== WTA TOUR ==========
  {
    id: 'wta-1000',
    name: 'WTA 1000',
    category: 'wta',
    description: 'WTA 1000 Events',
    emoji: '👑',
    config: {
      format: 'best_of_3',
      surface: 'hard',
      tiebreakAt: 6,
      finalSetTiebreak: true,
      finalSetTiebreakPoints: 10,
      decidingPointAtDeuce: false,
      letRule: true,
      coachingAllowed: true,
      challengesPerSet: 3,
      warmupMinutes: 5,
      changeoverSeconds: 90,
      betweenPointsSeconds: 25
    },
    isOfficial: true
  },
  {
    id: 'wta-500',
    name: 'WTA 500',
    category: 'wta',
    description: 'WTA 500 Series',
    emoji: '🎾',
    config: {
      format: 'best_of_3',
      surface: 'hard',
      tiebreakAt: 6,
      finalSetTiebreak: true,
      finalSetTiebreakPoints: 10,
      decidingPointAtDeuce: false,
      letRule: true,
      coachingAllowed: true,
      challengesPerSet: 3,
      warmupMinutes: 5,
      changeoverSeconds: 90,
      betweenPointsSeconds: 25
    },
    isOfficial: true
  },

  // ========== TEAM COMPETITIONS ==========
  {
    id: 'davis-cup',
    name: 'Davis Cup',
    category: 'team',
    description: 'ITF Team Competition',
    emoji: '🏅',
    config: {
      format: 'best_of_3',
      surface: 'hard',
      tiebreakAt: 6,
      finalSetTiebreak: true,
      finalSetTiebreakPoints: 10,
      decidingPointAtDeuce: false,
      letRule: true,
      coachingAllowed: true,
      challengesPerSet: 3,
      warmupMinutes: 5,
      changeoverSeconds: 90,
      betweenPointsSeconds: 25
    },
    isOfficial: true
  },
  {
    id: 'laver-cup',
    name: 'Laver Cup',
    category: 'team',
    description: 'Team Europe vs Team World',
    emoji: '🌍',
    config: {
      format: 'best_of_3',
      surface: 'hard',
      tiebreakAt: 6,
      finalSetTiebreak: true,
      finalSetTiebreakPoints: 10,
      decidingPointAtDeuce: false,
      letRule: false, // No-Let rule
      coachingAllowed: true,
      warmupMinutes: 5,
      changeoverSeconds: 60,
      betweenPointsSeconds: 25
    },
    isOfficial: true
  },

  // ========== NEXT GEN ==========
  {
    id: 'next-gen-finals',
    name: 'Next Gen ATP Finals',
    category: 'atp',
    description: 'U21 Championship (Innovative Rules)',
    emoji: '⚡',
    config: {
      format: 'best_of_3', // Actually best of 5 sets to 4 games, but simplified
      surface: 'hard',
      tiebreakAt: 3, // Tiebreak at 3-3
      finalSetTiebreak: true,
      finalSetTiebreakPoints: 7,
      decidingPointAtDeuce: true, // No-Ad scoring!
      letRule: false, // No-Let!
      coachingAllowed: true,
      warmupMinutes: 5,
      changeoverSeconds: 60, // Shorter changeovers
      betweenPointsSeconds: 15 // 15-second shot clock
    },
    isOfficial: true
  },

  // ========== JUNIOR ==========
  {
    id: 'junior-grand-slam',
    name: 'Junior Grand Slam',
    category: 'junior',
    description: 'U18 Grand Slam Format',
    emoji: '🌟',
    config: {
      format: 'best_of_3',
      surface: 'hard',
      tiebreakAt: 6,
      finalSetTiebreak: true,
      finalSetTiebreakPoints: 10,
      decidingPointAtDeuce: false,
      letRule: true,
      coachingAllowed: true,
      warmupMinutes: 3,
      changeoverSeconds: 90,
      betweenPointsSeconds: 25
    },
    isOfficial: true
  },

  // ========== CUSTOM TEMPLATE ==========
  {
    id: 'custom',
    name: 'Configuration Personnalisée',
    category: 'custom',
    description: 'Créez vos propres règles',
    emoji: '⚙️',
    config: {
      format: 'best_of_3',
      surface: 'hard',
      tiebreakAt: 6,
      finalSetTiebreak: true,
      finalSetTiebreakPoints: 10,
      decidingPointAtDeuce: false,
      letRule: true,
      coachingAllowed: false,
      challengesPerSet: 3,
      warmupMinutes: 5,
      changeoverSeconds: 90,
      betweenPointsSeconds: 25
    },
    isOfficial: false
  }
];

// Helper functions
export function getPresetById(id: string): TournamentPreset | undefined {
  return TENNIS_TOURNAMENT_PRESETS.find(p => p.id === id);
}

export function getPresetsByCategory(category: TournamentCategory): TournamentPreset[] {
  return TENNIS_TOURNAMENT_PRESETS.filter(p => p.category === category);
}

export function getCategoryLabel(category: TournamentCategory): string {
  const labels: Record<TournamentCategory, string> = {
    grand_slam: 'Grand Chelem',
    atp: 'ATP Tour',
    wta: 'WTA Tour',
    team: 'Compétitions par Équipes',
    junior: 'Junior',
    custom: 'Personnalisé'
  };
  return labels[category];
}

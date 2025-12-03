import type { Player } from '@/types/tournament';
import type { FootballStanding, GroupStageConfig } from '../models/tournament-formats';

/**
 * Récupère les équipes qualifiées à l'issue d'une phase de poules.
 */
export function getQualifiedTeamsFromGroups(
  standings: FootballStanding[],
  config: GroupStageConfig
): Player[] {
  const qualifiedTeams: Player[] = [];
  
  // Grouper les classements par poule
  const groupStandings = new Map<string, FootballStanding[]>();
  standings.forEach(s => {
    if (!s.groupId) return;
    if (!groupStandings.has(s.groupId)) {
      groupStandings.set(s.groupId, []);
    }
    groupStandings.get(s.groupId)?.push(s);
  });

  // 1. Qualifiés directs par poule
  const thirdPlaceTeams: FootballStanding[] = [];

  groupStandings.forEach((groupTeams) => {
    // Trier par rang (déjà fait normalement par updateStandings, mais on s'assure)
    const sorted = [...groupTeams].sort((a, b) => a.rank - b.rank);

    // Prendre les N premiers
    for (let i = 0; i < config.qualifiersPerGroup; i++) {
      if (sorted[i]) {
        qualifiedTeams.push({ id: sorted[i].teamId, name: 'Team ' + sorted[i].teamId } as Player); // Note: Il faudrait récupérer le vrai objet Player
      }
    }

    // Garder le 3ème (ou suivant) pour le repêchage
    if (config.bestThirdsQualifiers > 0 && sorted[config.qualifiersPerGroup]) {
      thirdPlaceTeams.push(sorted[config.qualifiersPerGroup]);
    }
  });

  // 2. Meilleurs troisièmes
  if (config.bestThirdsQualifiers > 0) {
    // Trier les troisièmes inter-poules (points, diff, buts...)
    // On réutilise la logique de tri standard, mais sans confrontation directe car pas pertinent inter-poule
    thirdPlaceTeams.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

    for (let i = 0; i < config.bestThirdsQualifiers; i++) {
      if (thirdPlaceTeams[i]) {
        qualifiedTeams.push({ id: thirdPlaceTeams[i].teamId, name: 'Team ' + thirdPlaceTeams[i].teamId } as Player);
      }
    }
  }

  return qualifiedTeams;
}

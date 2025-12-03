import type { Match, Player } from '@/types/tournament';
import type { FootballTournamentConfig, FootballStanding, TieBreakerCriteria } from '../models/tournament-formats';

/**
 * Met à jour le classement en fonction des matches joués.
 */
export function updateStandings(
  matches: Match[],
  players: Player[],
  config: FootballTournamentConfig
): FootballStanding[] {
  // Initialiser le classement
  const standingsMap = new Map<string, FootballStanding>();
  
  players.forEach(player => {
    standingsMap.set(player.id, {
      teamId: player.id,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
      form: [],
      rank: 0
    });
  });

  // Parcourir les matches terminés
  matches.forEach(match => {
    if (match.status !== 'completed' || !match.result || !match.player1Id || !match.player2Id) return;

    const home = standingsMap.get(match.player1Id);
    const away = standingsMap.get(match.player2Id);

    if (!home || !away) return;

    const scoreHome = match.result.player1Score;
    const scoreAway = match.result.player2Score;

    // Stats de base
    updateTeamStats(home, scoreHome, scoreAway, config.points);
    updateTeamStats(away, scoreAway, scoreHome, config.points);
  });

  // Convertir en tableau et trier
  let standings = Array.from(standingsMap.values());
  
  standings = sortStandings(standings, config.tieBreakers, matches);

  // Assigner les rangs
  standings.forEach((s, index) => {
    s.rank = index + 1;
  });

  return standings;
}

function updateTeamStats(
  stats: FootballStanding, 
  goalsFor: number, 
  goalsAgainst: number,
  pointsConfig: { win: number, draw: number, loss: number }
) {
  stats.played += 1;
  stats.goalsFor += goalsFor;
  stats.goalsAgainst += goalsAgainst;
  stats.goalDifference = stats.goalsFor - stats.goalsAgainst;

  if (goalsFor > goalsAgainst) {
    stats.won += 1;
    stats.points += pointsConfig.win;
    stats.form.push('W');
  } else if (goalsFor === goalsAgainst) {
    stats.drawn += 1;
    stats.points += pointsConfig.draw;
    stats.form.push('D');
  } else {
    stats.lost += 1;
    stats.points += pointsConfig.loss;
    stats.form.push('L');
  }
}

/**
 * Trie le classement selon les critères configurés.
 */
function sortStandings(
  standings: FootballStanding[], 
  criteria: TieBreakerCriteria[],
  matches: Match[] // Nécessaire pour confrontation directe
): FootballStanding[] {
  return standings.sort((a, b) => {
    for (const criterion of criteria) {
      let diff = 0;
      
      switch (criterion) {
        case 'points':
          diff = b.points - a.points;
          break;
        case 'difference_buts':
          diff = b.goalDifference - a.goalDifference;
          break;
        case 'buts_marques':
          diff = b.goalsFor - a.goalsFor;
          break;
        case 'confrontation_directe':
          // TODO: Implémenter la logique complexe de confrontation directe
          // Nécessite de filtrer les matches entre a et b
          diff = 0; 
          break;
        case 'fair_play':
          // Non implémenté dans le modèle actuel
          diff = 0;
          break;
        case 'tirage_au_sort':
          // Aléatoire déterministe (basé sur ID pour stabilité)
          diff = a.teamId.localeCompare(b.teamId);
          break;
      }

      if (diff !== 0) return diff;
    }
    return 0;
  });
}

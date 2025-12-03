import { v4 as uuidv4 } from 'uuid';
import type { Player, Match, Round } from '@/types/tournament';
import type { 
  FootballTournamentConfig, 
  ChampionshipConfig, 
  KnockoutConfig, 
  GroupStageConfig 
} from '../models/tournament-formats';

/**
 * Génère la structure du tournoi (rounds et matches) selon la configuration.
 */
export function generateTournamentStructure(
  teams: Player[],
  config: FootballTournamentConfig
): Round[] {
  switch (config.type) {
    case 'CHAMPIONNAT':
      return generateChampionship(teams, config as ChampionshipConfig);
    case 'ELIMINATION_DIRECTE':
      return generateKnockout(teams, config as KnockoutConfig);
    case 'PHASE_POULES':
      return generateGroupStage(teams, config as GroupStageConfig);
    // TODO: Implémenter les autres formats
    default:
      console.warn(`Format ${config.type} non implémenté, retour tableau vide.`);
      return [];
  }
}

/**
 * Génère un championnat (Round-Robin).
 * Algorithme de Berger pour la rotation.
 */
function generateChampionship(teams: Player[], config: ChampionshipConfig): Round[] {
  const rounds: Round[] = [];
  const n = teams.length;
  const isOdd = n % 2 !== 0;
  
  // Ajouter une équipe "fantôme" si nombre impair
  const activeTeams = isOdd ? [...teams, { id: 'BYE', name: 'BYE' } as Player] : [...teams];
  const numTeams = activeTeams.length;
  const numRounds = numTeams - 1;
  const matchesPerRound = numTeams / 2;

  // Génération des matches aller
  for (let roundIdx = 0; roundIdx < numRounds; roundIdx++) {
    const roundMatches: Match[] = [];
    
    for (let matchIdx = 0; matchIdx < matchesPerRound; matchIdx++) {
      const homeIdx = (roundIdx + matchIdx) % (numTeams - 1);
      const awayIdx = (numTeams - 1 - matchIdx + roundIdx) % (numTeams - 1);
      
      let home = activeTeams[homeIdx];
      let away = activeTeams[awayIdx];
      
      // Fixer la dernière équipe
      if (matchIdx === 0) {
        away = activeTeams[numTeams - 1];
      }

      if (home.id !== 'BYE' && away.id !== 'BYE') {
        roundMatches.push({
          id: uuidv4(),
          player1Id: home.id,
          player2Id: away.id,
          status: 'pending',
          roundId: `round-${roundIdx + 1}`,
          // Meta-data spécifique football à stocker si besoin dans un champ générique
        });
      }
    }

    rounds.push({
      id: uuidv4(),
      name: `Journée ${roundIdx + 1}`,
      number: roundIdx + 1,
      matches: roundMatches,
      status: 'pending'
    });
  }

  // Génération des matches retour si configuré
  if (config.hasReturnLeg) {
    const returnRounds: Round[] = rounds.map((round, idx) => ({
      id: uuidv4(),
      name: `Journée ${numRounds + idx + 1}`,
      number: numRounds + idx + 1,
      status: 'pending',
      matches: round.matches.map(m => ({
        id: uuidv4(),
        player1Id: m.player2Id, // Inversion domicile/extérieur
        player2Id: m.player1Id,
        status: 'pending',
        roundId: `round-${numRounds + idx + 1}`
      }))
    }));
    rounds.push(...returnRounds);
  }

  return rounds;
}

/**
 * Génère un tableau à élimination directe.
 */
function generateKnockout(teams: Player[], _config: KnockoutConfig): Round[] {
  const rounds: Round[] = [];
  const n = teams.length;

  // Trouver la puissance de 2 supérieure ou égale
  let size = 1;
  while (size < n) size *= 2;

  // Byes calculation: size - n (reserved for future seeding logic)
  
  // Mélanger les équipes (optionnel, ici on prend l'ordre d'entrée)
  // const shuffled = [...teams].sort(() => Math.random() - 0.5);
  const shuffled = [...teams];

  // Premier tour (ex: 1/8 finale)
  const firstRoundMatches: Match[] = [];
  const matchesInFirstRound = size / 2;

  for (let i = 0; i < matchesInFirstRound; i++) {
    const home = shuffled[i];
    const away = shuffled[size - 1 - i]; // Logique simple haut/bas

    // Gestion des BYE: si pas d'adversaire (index hors bornes ou logique bye), on passe
    // Ici logique simplifiée : on remplit les slots. 
    // Si 'away' n'existe pas (car n < size), alors 'home' a un BYE.
    
    if (!away) {
      // BYE pour home - on pourrait créer un match "terminé" ou juste le qualifier
      // Pour l'instant on ne crée pas de match, la logique de progression devra gérer
      continue; 
    }

    firstRoundMatches.push({
      id: uuidv4(),
      player1Id: home.id,
      player2Id: away.id,
      status: 'pending',
      roundId: 'round-1-knockout'
    });
  }

  rounds.push({
    id: uuidv4(),
    name: getRoundName(matchesInFirstRound),
    number: 1,
    matches: firstRoundMatches,
    status: 'pending'
  });

  // Générer les slots vides pour les tours suivants
  let currentSize = matchesInFirstRound;
  let roundNum = 2;
  while (currentSize > 1) {
    currentSize /= 2;
    const nextMatches: Match[] = [];
    for (let i = 0; i < currentSize; i++) {
      nextMatches.push({
        id: uuidv4(),
        status: 'pending', // En attente des vainqueurs précédents
        roundId: `round-${roundNum}-knockout`
      });
    }
    rounds.push({
      id: uuidv4(),
      name: getRoundName(currentSize),
      number: roundNum,
      matches: nextMatches,
      status: 'pending'
    });
    roundNum++;
  }

  // Link matches for progression
  linkMatches(rounds);

  return rounds;
}

function linkMatches(rounds: Round[]) {
  for (let r = 0; r < rounds.length - 1; r++) {
    const currentRound = rounds[r];
    const nextRound = rounds[r + 1];

    for (let i = 0; i < currentRound.matches.length; i++) {
      const currentMatch = currentRound.matches[i];
      const nextMatchIndex = Math.floor(i / 2);
      const nextMatch = nextRound.matches[nextMatchIndex];

      if (nextMatch) {
        currentMatch.nextMatchId = nextMatch.id;
      }
    }
  }
}

function getRoundName(matchesCount: number): string {
  if (matchesCount === 1) return 'Finale';
  if (matchesCount === 2) return 'Demi-finales';
  if (matchesCount === 4) return 'Quarts de finale';
  if (matchesCount === 8) return 'Huitièmes de finale';
  return `Tour de ${matchesCount * 2}`;
}

/**
 * Génère une phase de poules.
 */
function generateGroupStage(teams: Player[], config: GroupStageConfig): Round[] {
  const rounds: Round[] = [];
  const numGroups = config.numberOfGroups;
  // teamsPerGroup = Math.ceil(teams.length / numGroups) - Reserved for validation
  
  // Répartition des équipes (Snake draft ou aléatoire)
  const groups: Player[][] = Array.from({ length: numGroups }, () => []);
  teams.forEach((team, i) => {
    groups[i % numGroups].push(team);
  });

  // Pour chaque groupe, générer un mini-championnat
  groups.forEach((groupTeams, groupIdx) => {
    const groupName = String.fromCharCode(65 + groupIdx); // A, B, C...
    
    // Utilise la logique championnat pour le groupe
    // Note: On adapte légèrement pour stocker l'info du groupe
    const groupRounds = generateChampionship(groupTeams, {
      type: 'CHAMPIONNAT',
      hasReturnLeg: config.hasReturnLeg,
      matchDuration: config.matchDuration,
      extraTime: false,
      penaltyShootout: false,
      points: config.points,
      tieBreakers: config.tieBreakers
    });

    // Fusionner les rounds de groupe dans la structure globale
    // On pourrait avoir "Journée 1 - Groupe A", "Journée 1 - Groupe B"
    // Ou tout regrouper par Journée. Ici on regroupe par Journée.
    
    groupRounds.forEach((gr, rIdx) => {
      if (!rounds[rIdx]) {
        rounds[rIdx] = {
          id: uuidv4(),
          name: `Journée ${rIdx + 1}`,
          number: rIdx + 1,
          matches: [],
          status: 'pending'
        };
      }
      // Ajouter les matches avec metadata de groupe
      const matchesWithGroup = gr.matches.map(m => ({
        ...m,
        location: `Groupe ${groupName}` // Hack temporaire pour visualiser le groupe
      }));
      rounds[rIdx].matches.push(...matchesWithGroup);
    });
  });

  return rounds;
}

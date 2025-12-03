import type { TennisMatchScore, TennisMatchConfig, TennisSetScore } from '@/types/tennis';

/**
 * Résultat de validation d'un score de set
 */
export interface SetValidationResult {
  isValid: boolean;
  error?: string;
  isTiebreak: boolean;
  needsTiebreakScore: boolean;
}

/**
 * Résultat de validation d'un score de match complet
 */
export interface MatchValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Valide un score de set tennis
 * Scores valides: 6-0 à 6-4, 7-5, 7-6 (avec tiebreak)
 */
export function validateSetScore(
  player1Games: number,
  player2Games: number,
  tiebreakScore?: { player1: number; player2: number }
): SetValidationResult {
  const p1 = player1Games;
  const p2 = player2Games;
  const winner = p1 > p2 ? 1 : p2 > p1 ? 2 : null;
  const loserGames = winner === 1 ? p2 : p1;
  const winnerGames = winner === 1 ? p1 : p2;

  // Pas de gagnant
  if (!winner) {
    // 6-6 nécessite tiebreak
    if (p1 === 6 && p2 === 6) {
      return {
        isValid: false,
        error: 'Un set à 6-6 nécessite un tie-break',
        isTiebreak: true,
        needsTiebreakScore: true
      };
    }
    return {
      isValid: false,
      error: 'Score de set invalide',
      isTiebreak: false,
      needsTiebreakScore: false
    };
  }

  // Victoire normale: 6-0, 6-1, 6-2, 6-3, 6-4
  if (winnerGames === 6 && loserGames <= 4) {
    return { isValid: true, isTiebreak: false, needsTiebreakScore: false };
  }

  // Victoire 7-5
  if (winnerGames === 7 && loserGames === 5) {
    return { isValid: true, isTiebreak: false, needsTiebreakScore: false };
  }

  // Victoire 7-6 (tiebreak)
  if (winnerGames === 7 && loserGames === 6) {
    if (!tiebreakScore) {
      return {
        isValid: false,
        error: 'Un set 7-6 nécessite un score de tie-break',
        isTiebreak: true,
        needsTiebreakScore: true
      };
    }

    // Valider le score du tiebreak
    const tbValid = validateTiebreakScore(
      tiebreakScore.player1,
      tiebreakScore.player2,
      winner
    );

    if (!tbValid) {
      return {
        isValid: false,
        error: 'Score de tie-break invalide',
        isTiebreak: true,
        needsTiebreakScore: true
      };
    }

    return { isValid: true, isTiebreak: true, needsTiebreakScore: false };
  }

  // Tout autre score est invalide
  return {
    isValid: false,
    error: `Score de set invalide: ${p1}-${p2}`,
    isTiebreak: false,
    needsTiebreakScore: false
  };
}

/**
 * Valide un score de tiebreak
 * Le gagnant doit avoir au moins 7 points avec 2 points d'écart
 */
export function validateTiebreakScore(
  player1Points: number,
  player2Points: number,
  setWinner: 1 | 2
): boolean {
  const winnerPoints = setWinner === 1 ? player1Points : player2Points;
  const loserPoints = setWinner === 1 ? player2Points : player1Points;

  // Le gagnant doit avoir au moins 7 points
  if (winnerPoints < 7) {
    return false;
  }

  // Le gagnant doit avoir au moins 2 points de plus
  if (winnerPoints - loserPoints < 2) {
    return false;
  }

  // Le perdant ne peut pas avoir plus de points que le gagnant
  if (loserPoints >= winnerPoints) {
    return false;
  }

  return true;
}

/**
 * Valide la cohérence globale d'un score de match
 */
export function validateMatchScore(
  score: TennisMatchScore,
  config: TennisMatchConfig
): MatchValidationResult {
  const errors: string[] = [];
  const setsToWin = config.format === 'best_of_5' ? 3 : 2;

  // Vérifier que le nombre de sets gagnés correspond au tableau
  let calculatedP1Sets = 0;
  let calculatedP2Sets = 0;

  for (let i = 0; i < score.sets.length; i++) {
    const set = score.sets[i];
    const validation = validateSetScore(
      set.player1Games,
      set.player2Games,
      set.tiebreakScore
    );

    // Le dernier set en cours peut être incomplet
    const isCurrentSet = i === score.currentSet && !score.isComplete;
    if (!isCurrentSet && !validation.isValid) {
      errors.push(`Set ${i + 1}: ${validation.error}`);
    }

    // Compter les sets gagnés pour les sets terminés
    if (validation.isValid || isCurrentSet) {
      const winner = getSetWinner(set);
      if (winner === 1) calculatedP1Sets++;
      else if (winner === 2) calculatedP2Sets++;
    }
  }

  // Vérifier la cohérence des compteurs
  if (score.isComplete) {
    if (score.player1Sets !== calculatedP1Sets) {
      errors.push(`Incohérence: player1Sets (${score.player1Sets}) != sets calculés (${calculatedP1Sets})`);
    }
    if (score.player2Sets !== calculatedP2Sets) {
      errors.push(`Incohérence: player2Sets (${score.player2Sets}) != sets calculés (${calculatedP2Sets})`);
    }

    // Vérifier que le gagnant a le bon nombre de sets
    const winner = score.player1Sets === setsToWin ? 1 : score.player2Sets === setsToWin ? 2 : null;
    if (!winner) {
      errors.push(`Match marqué comme terminé mais aucun joueur n'a ${setsToWin} sets`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Détermine le gagnant d'un set basé sur les jeux
 */
export function getSetWinner(set: TennisSetScore): 1 | 2 | null {
  const p1 = set.player1Games;
  const p2 = set.player2Games;

  // Victoire normale ou 7-5
  if (p1 >= 6 && p1 - p2 >= 2) return 1;
  if (p2 >= 6 && p2 - p1 >= 2) return 2;

  // Victoire en tiebreak (7-6)
  if (p1 === 7 && p2 === 6) return 1;
  if (p2 === 7 && p1 === 6) return 2;

  return null;
}

/**
 * Vérifie si un score de jeu en cours est valide
 */
export function isValidGameScore(player1Points: number, player2Points: number): boolean {
  // Les points doivent être >= 0
  if (player1Points < 0 || player2Points < 0) return false;

  // Points tennis: 0, 1, 2, 3 (0, 15, 30, 40)
  // Après 3-3 (deuce), on peut aller plus haut
  if (player1Points <= 3 && player2Points <= 3) return true;

  // En deuce/avantage, les deux joueurs doivent avoir au moins 3 points
  // et la différence ne peut pas dépasser 2
  if (player1Points >= 3 && player2Points >= 3) {
    return Math.abs(player1Points - player2Points) <= 2;
  }

  return false;
}

/**
 * Vérifie si un score de set en cours est valide (pas forcément terminé)
 */
export function isValidPartialSetScore(player1Games: number, player2Games: number): boolean {
  // Les jeux doivent être >= 0
  if (player1Games < 0 || player2Games < 0) return false;

  // Maximum 7 jeux (ou 6-6 avant tiebreak)
  if (player1Games > 7 || player2Games > 7) return false;

  // Si quelqu'un a 7, l'autre doit avoir 5 ou 6
  if (player1Games === 7 && player2Games < 5) return false;
  if (player2Games === 7 && player1Games < 5) return false;

  // Si quelqu'un a 6+, vérifier la validité
  if (player1Games >= 6 || player2Games >= 6) {
    const diff = Math.abs(player1Games - player2Games);
    // À 6-6, c'est valide (avant tiebreak)
    if (player1Games === 6 && player2Games === 6) return true;
    // Sinon il faut une différence de 2 max pour continuer
    if (diff > 2) return false;
  }

  return true;
}

import type {
  TennisMatchScore,
  TennisGameScore,
  TennisSetScore,
  TennisMatchConfig
} from '@/types/tennis';
import { validateSetScore, getSetWinner } from './validation';

/**
 * Interface pour passer les IDs réels des joueurs aux méthodes de scoring
 */
interface PlayerIds {
  player1Id: string;
  player2Id: string;
}

export class TennisScoringEngine {
  /**
   * Award a point to a player in the current game
   * @param score - L'état actuel du score du match
   * @param playerId - Indicateur du joueur (1 ou 2)
   * @param playerIds - Optionnel: IDs réels des joueurs pour définir winnerId correctement
   * @returns Le nouvel état du score
   */
  static awardPoint(
    score: TennisMatchScore,
    playerId: 1 | 2,
    playerIds?: PlayerIds
  ): TennisMatchScore {
    const newScore = JSON.parse(JSON.stringify(score)) as TennisMatchScore;
    const game = newScore.currentGame;
    // const otherPlayerId = playerId === 1 ? 2 : 1;

    // Increment player's points
    if (playerId === 1) {
      game.player1Points++;
    } else {
      game.player2Points++;
    }

    // Check for game win
    const p1Points = game.player1Points;
    const p2Points = game.player2Points;

    // Regular game (first to 4 points with 2-point lead)
    if (p1Points >= 4 || p2Points >= 4) {
      const diff = Math.abs(p1Points - p2Points);

      if (diff >= 2) {
        // Game won
        const gameWinner = p1Points > p2Points ? 1 : 2;
        return this.awardGame(newScore, gameWinner, playerIds);
      } else if (p1Points >= 3 && p2Points >= 3) {
        // Deuce
        game.isDeuce = true;
        if (diff === 1) {
          game.advantage = p1Points > p2Points ? 1 : 2;
        } else {
          game.advantage = undefined;
        }
      }
    }

    return newScore;
  }

  /**
   * Award a game to a player
   * @param score - L'état actuel du score du match
   * @param playerId - Indicateur du joueur (1 ou 2)
   * @param playerIds - Optionnel: IDs réels des joueurs pour définir winnerId correctement
   * @returns Le nouvel état du score
   */
  static awardGame(
    score: TennisMatchScore,
    playerId: 1 | 2,
    playerIds?: PlayerIds
  ): TennisMatchScore {
    const newScore = JSON.parse(JSON.stringify(score)) as TennisMatchScore;
    const currentSet = newScore.sets[newScore.currentSet];

    // Increment games in current set
    if (playerId === 1) {
      currentSet.player1Games++;
    } else {
      currentSet.player2Games++;
    }

    // Reset game score
    newScore.currentGame = {
      player1Points: 0,
      player2Points: 0,
      isDeuce: false,
      advantage: undefined
    };

    // Check for set win
    const p1Games = currentSet.player1Games;
    const p2Games = currentSet.player2Games;

    // Normal set win (6 games with 2-game lead)
    if (p1Games >= 6 || p2Games >= 6) {
      const diff = Math.abs(p1Games - p2Games);

      if (diff >= 2) {
        // Set won
        const setWinner = p1Games > p2Games ? 1 : 2;
        return this.awardSet(newScore, setWinner, playerIds);
      } else if (p1Games === 6 && p2Games === 6) {
        // Tiebreak at 6-6
        currentSet.isTiebreak = true;
        currentSet.tiebreakScore = { player1: 0, player2: 0 };
      }
    }

    return newScore;
  }

  /**
   * Award a tiebreak point
   * @param score - L'état actuel du score du match
   * @param playerId - Indicateur du joueur (1 ou 2)
   * @param playerIds - Optionnel: IDs réels des joueurs pour définir winnerId correctement
   * @returns Le nouvel état du score
   */
  static awardTiebreakPoint(
    score: TennisMatchScore,
    playerId: 1 | 2,
    playerIds?: PlayerIds
  ): TennisMatchScore {
    const newScore = JSON.parse(JSON.stringify(score)) as TennisMatchScore;
    const currentSet = newScore.sets[newScore.currentSet];

    if (!currentSet.isTiebreak || !currentSet.tiebreakScore) {
      return newScore;
    }

    // Increment tiebreak score
    if (playerId === 1) {
      currentSet.tiebreakScore.player1++;
    } else {
      currentSet.tiebreakScore.player2++;
    }

    const p1 = currentSet.tiebreakScore.player1;
    const p2 = currentSet.tiebreakScore.player2;

    // Tiebreak won (first to 7 with 2-point lead)
    if (p1 >= 7 || p2 >= 7) {
      const diff = Math.abs(p1 - p2);
      if (diff >= 2) {
        const setWinner = p1 > p2 ? 1 : 2;
        return this.awardSet(newScore, setWinner, playerIds);
      }
    }

    return newScore;
  }

  /**
   * Award a set to a player
   * @param score - L'état actuel du score du match
   * @param playerId - Indicateur du joueur (1 ou 2)
   * @param playerIds - Optionnel: IDs réels des joueurs pour définir winnerId correctement.
   *                    Si non fourni, winnerId sera '1' ou '2' (indicateur) que l'appelant devra convertir.
   * @returns Le nouvel état du score avec winnerId défini si le match est terminé
   */
  static awardSet(
    score: TennisMatchScore,
    playerId: 1 | 2,
    playerIds?: PlayerIds
  ): TennisMatchScore {
    const newScore = JSON.parse(JSON.stringify(score)) as TennisMatchScore;

    // Increment sets won
    if (playerId === 1) {
      newScore.player1Sets++;
    } else {
      newScore.player2Sets++;
    }

    // Check for match win
    const setsToWin = newScore.sets.length === 5 ? 3 : 2; // Best of 5 or 3

    if (newScore.player1Sets === setsToWin) {
      newScore.isComplete = true;
      // Utilise l'ID réel si fourni, sinon indicateur '1'
      newScore.winnerId = playerIds?.player1Id ?? '1';
      return newScore;
    } else if (newScore.player2Sets === setsToWin) {
      newScore.isComplete = true;
      // Utilise l'ID réel si fourni, sinon indicateur '2'
      newScore.winnerId = playerIds?.player2Id ?? '2';
      return newScore;
    }

    // Start new set
    newScore.currentSet++;
    newScore.sets.push({
      player1Games: 0,
      player2Games: 0,
      isTiebreak: false
    });

    return newScore;
  }

  /**
   * Initialize a new tennis match score
   */
  static initializeMatch(_config: TennisMatchConfig): TennisMatchScore {
    // const numSets = config.format === 'best_of_5' ? 5 : 3;
    
    return {
      player1Sets: 0,
      player2Sets: 0,
      sets: [{
        player1Games: 0,
        player2Games: 0,
        isTiebreak: false
      }],
      currentSet: 0,
      currentGame: {
        player1Points: 0,
        player2Points: 0,
        isDeuce: false,
        advantage: undefined
      },
      isComplete: false
    };
  }

  /**
   * Get current score as readable string
   */
  static getScoreDisplay(score: TennisMatchScore): string {
    const sets = score.sets.map(set => {
      if (set.isTiebreak && set.tiebreakScore) {
        return `${set.player1Games}-${set.player2Games} (${set.tiebreakScore.player1}-${set.tiebreakScore.player2})`;
      }
      return `${set.player1Games}-${set.player2Games}`;
    });

    return sets.join(', ');
  }

  /**
   * Get current game score as readable string
   */
  static getGameScoreDisplay(game: TennisGameScore): { p1: string; p2: string } {
    if (game.isDeuce) {
      if (game.advantage === 1) {
        return { p1: 'AD', p2: '40' };
      } else if (game.advantage === 2) {
        return { p1: '40', p2: 'AD' };
      } else {
        return { p1: 'DEUCE', p2: 'DEUCE' };
      }
    }

    const pointsMap = ['0', '15', '30', '40'];
    return {
      p1: pointsMap[game.player1Points] || '40',
      p2: pointsMap[game.player2Points] || '40'
    };
  }

  // ============================================
  // MÉTHODES D'ÉDITION DIRECTE
  // ============================================

  /**
   * Définir directement le score d'un set (bypass point/jeu cascade)
   * Utilisé pour l'édition rapide et les corrections
   * Pour le set en cours (dernier set), les scores partiels sont autorisés
   */
  static setSetScore(
    score: TennisMatchScore,
    setIndex: number,
    player1Games: number,
    player2Games: number,
    tiebreakScore?: { player1: number; player2: number },
    playerIds?: PlayerIds,
    config?: TennisMatchConfig
  ): TennisMatchScore {
    const newScore = JSON.parse(JSON.stringify(score)) as TennisMatchScore;

    // Valider les limites basiques
    if (player1Games < 0 || player2Games < 0) return score;
    if (player1Games > 7 || player2Games > 7) return score;

    // S'assurer que le tableau de sets est assez grand
    while (newScore.sets.length <= setIndex) {
      newScore.sets.push({
        player1Games: 0,
        player2Games: 0,
        isTiebreak: false
      });
    }

    // Déterminer si c'est le set en cours (dernier set non terminé)
    const isCurrentSet = setIndex === newScore.sets.length - 1;

    // Pour les sets terminés (pas le set en cours), valider strictement
    if (!isCurrentSet) {
      const validation = validateSetScore(player1Games, player2Games, tiebreakScore);
      if (!validation.isValid) {
        console.warn('Score de set invalide:', validation.error);
        return score; // Retourner le score original si invalide
      }
    }

    // Détecter si c'est un tiebreak (6-6 ou 7-6)
    const isTiebreak = (player1Games === 6 && player2Games === 6) ||
                       (player1Games === 7 && player2Games === 6) ||
                       (player1Games === 6 && player2Games === 7);

    // Mettre à jour le set
    newScore.sets[setIndex] = {
      player1Games,
      player2Games,
      isTiebreak,
      tiebreakScore: isTiebreak ? (tiebreakScore || { player1: 0, player2: 0 }) : undefined
    };

    // Recalculer les compteurs de sets gagnés
    return this.recalculateMatchState(newScore, playerIds, config);
  }

  /**
   * Ajouter un set terminé au match
   */
  static addCompletedSet(
    score: TennisMatchScore,
    player1Games: number,
    player2Games: number,
    tiebreakScore?: { player1: number; player2: number },
    playerIds?: PlayerIds,
    config?: TennisMatchConfig
  ): TennisMatchScore {
    const newScore = JSON.parse(JSON.stringify(score)) as TennisMatchScore;

    // Valider le score
    const validation = validateSetScore(player1Games, player2Games, tiebreakScore);
    if (!validation.isValid) {
      console.warn('Score de set invalide:', validation.error);
      return score;
    }

    // Ajouter le nouveau set
    const newSet: TennisSetScore = {
      player1Games,
      player2Games,
      isTiebreak: validation.isTiebreak,
      tiebreakScore
    };

    newScore.sets.push(newSet);
    newScore.currentSet = newScore.sets.length - 1;

    // Recalculer l'état du match
    return this.recalculateMatchState(newScore, playerIds, config);
  }

  /**
   * Supprimer le dernier set (pour corrections)
   */
  static removeLastSet(
    score: TennisMatchScore,
    playerIds?: PlayerIds,
    config?: TennisMatchConfig
  ): TennisMatchScore {
    if (score.sets.length <= 1) {
      console.warn('Impossible de supprimer le dernier set');
      return score;
    }

    const newScore = JSON.parse(JSON.stringify(score)) as TennisMatchScore;
    newScore.sets.pop();
    newScore.currentSet = newScore.sets.length - 1;

    // Recalculer l'état
    return this.recalculateMatchState(newScore, playerIds, config);
  }

  /**
   * Définir directement le score des jeux dans le set en cours
   */
  static setGameScore(
    score: TennisMatchScore,
    player1Games: number,
    player2Games: number
  ): TennisMatchScore {
    const newScore = JSON.parse(JSON.stringify(score)) as TennisMatchScore;
    const currentSet = newScore.sets[newScore.currentSet];

    if (!currentSet) {
      return score;
    }

    // Valider les limites
    if (player1Games < 0 || player2Games < 0) return score;
    if (player1Games > 7 || player2Games > 7) return score;

    currentSet.player1Games = player1Games;
    currentSet.player2Games = player2Games;

    // Gérer le tiebreak à 6-6
    if (player1Games === 6 && player2Games === 6) {
      currentSet.isTiebreak = true;
      currentSet.tiebreakScore = currentSet.tiebreakScore || { player1: 0, player2: 0 };
    } else {
      currentSet.isTiebreak = false;
      currentSet.tiebreakScore = undefined;
    }

    // Réinitialiser le score du jeu en cours
    newScore.currentGame = {
      player1Points: 0,
      player2Points: 0,
      isDeuce: false,
      advantage: undefined
    };

    return newScore;
  }

  /**
   * Ajuster le nombre de jeux d'un joueur (+1 ou -1)
   */
  static adjustGameCount(
    score: TennisMatchScore,
    playerId: 1 | 2,
    delta: 1 | -1
  ): TennisMatchScore {
    const currentSet = score.sets[score.currentSet];
    if (!currentSet) return score;

    const newP1Games = playerId === 1
      ? currentSet.player1Games + delta
      : currentSet.player1Games;
    const newP2Games = playerId === 2
      ? currentSet.player2Games + delta
      : currentSet.player2Games;

    // Vérifier les limites
    if (newP1Games < 0 || newP2Games < 0) return score;
    if (newP1Games > 7 || newP2Games > 7) return score;

    return this.setGameScore(score, newP1Games, newP2Games);
  }

  /**
   * Définir directement le score des points dans le jeu en cours
   */
  static setPointScore(
    score: TennisMatchScore,
    player1Points: number,
    player2Points: number
  ): TennisMatchScore {
    const newScore = JSON.parse(JSON.stringify(score)) as TennisMatchScore;

    // Valider les points
    if (player1Points < 0 || player2Points < 0) return score;

    newScore.currentGame = {
      player1Points,
      player2Points,
      isDeuce: player1Points >= 3 && player2Points >= 3 && player1Points === player2Points,
      advantage: player1Points >= 3 && player2Points >= 3 && player1Points !== player2Points
        ? (player1Points > player2Points ? 1 : 2)
        : undefined
    };

    return newScore;
  }

  /**
   * Définir le score du tiebreak directement
   */
  static setTiebreakScore(
    score: TennisMatchScore,
    player1Points: number,
    player2Points: number
  ): TennisMatchScore {
    const newScore = JSON.parse(JSON.stringify(score)) as TennisMatchScore;
    const currentSet = newScore.sets[newScore.currentSet];

    if (!currentSet?.isTiebreak) {
      console.warn('Pas de tiebreak en cours');
      return score;
    }

    currentSet.tiebreakScore = { player1: player1Points, player2: player2Points };
    return newScore;
  }

  /**
   * Reconstruire un match complet à partir d'un tableau de scores de sets
   * Utilisé pour l'édition de matchs terminés
   */
  static reconstructMatch(
    config: TennisMatchConfig,
    setScores: Array<{
      player1Games: number;
      player2Games: number;
      tiebreakScore?: { player1: number; player2: number };
    }>,
    playerIds: PlayerIds
  ): TennisMatchScore {
    // Initialiser un nouveau match
    let score = this.initializeMatch(config);
    score.sets = []; // Vider les sets initiaux

    // Ajouter chaque set
    for (const setData of setScores) {
      const validation = validateSetScore(
        setData.player1Games,
        setData.player2Games,
        setData.tiebreakScore
      );

      if (!validation.isValid) {
        console.warn('Set invalide ignoré:', validation.error);
        continue;
      }

      score.sets.push({
        player1Games: setData.player1Games,
        player2Games: setData.player2Games,
        isTiebreak: validation.isTiebreak,
        tiebreakScore: setData.tiebreakScore
      });
    }

    // S'assurer qu'il y a au moins un set
    if (score.sets.length === 0) {
      score.sets.push({
        player1Games: 0,
        player2Games: 0,
        isTiebreak: false
      });
    }

    score.currentSet = score.sets.length - 1;

    // Recalculer l'état du match
    return this.recalculateMatchState(score, playerIds, config);
  }

  /**
   * Réouvrir un match terminé pour édition
   * Efface isComplete et winnerId mais conserve tous les scores
   */
  static reopenMatch(score: TennisMatchScore): TennisMatchScore {
    const newScore = JSON.parse(JSON.stringify(score)) as TennisMatchScore;
    newScore.isComplete = false;
    newScore.winnerId = undefined;
    return newScore;
  }

  /**
   * Recalculer l'état du match (sets gagnés, completion) à partir des scores
   * Méthode interne utilisée après les éditions
   */
  private static recalculateMatchState(
    score: TennisMatchScore,
    playerIds?: PlayerIds,
    config?: TennisMatchConfig
  ): TennisMatchScore {
    const newScore = JSON.parse(JSON.stringify(score)) as TennisMatchScore;

    // Utiliser la config si disponible, sinon inférer du nombre de sets
    const setsToWin = config?.format === 'best_of_5' ? 3 :
                      config?.format === 'best_of_3' ? 2 :
                      newScore.sets.length >= 5 ? 3 : 2;

    // Recalculer les sets gagnés
    let p1Sets = 0;
    let p2Sets = 0;

    for (const set of newScore.sets) {
      const winner = getSetWinner(set);
      if (winner === 1) p1Sets++;
      else if (winner === 2) p2Sets++;
    }

    newScore.player1Sets = p1Sets;
    newScore.player2Sets = p2Sets;

    // Vérifier si le match est terminé
    if (p1Sets >= setsToWin) {
      newScore.isComplete = true;
      newScore.winnerId = playerIds?.player1Id ?? '1';
    } else if (p2Sets >= setsToWin) {
      newScore.isComplete = true;
      newScore.winnerId = playerIds?.player2Id ?? '2';
    } else {
      newScore.isComplete = false;
      newScore.winnerId = undefined;
    }

    // Mettre à jour currentSet
    newScore.currentSet = newScore.sets.length - 1;

    return newScore;
  }
}

import type {
  TennisMatchScore,
  TennisGameScore,
  TennisSetScore,
  TennisMatchConfig
} from '@/types/tennis';

export class TennisScoringEngine {
  /**
   * Award a point to a player in the current game
   */
  static awardPoint(
    score: TennisMatchScore,
    playerId: 1 | 2
  ): TennisMatchScore {
    const newScore = JSON.parse(JSON.stringify(score)) as TennisMatchScore;
    const game = newScore.currentGame;
    const otherPlayerId = playerId === 1 ? 2 : 1;

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
        return this.awardGame(newScore, gameWinner);
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
   */
  static awardGame(
    score: TennisMatchScore,
    playerId: 1 | 2
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
        return this.awardSet(newScore, setWinner);
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
   */
  static awardTiebreakPoint(
    score: TennisMatchScore,
    playerId: 1 | 2
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
        return this.awardSet(newScore, setWinner);
      }
    }

    return newScore;
  }

  /**
   * Award a set to a player
   */
  static awardSet(
    score: TennisMatchScore,
    playerId: 1 | 2
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
      newScore.winnerId = '1'; // Will be replaced with actual player ID
      return newScore;
    } else if (newScore.player2Sets === setsToWin) {
      newScore.isComplete = true;
      newScore.winnerId = '2'; // Will be replaced with actual player ID
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
  static initializeMatch(config: TennisMatchConfig): TennisMatchScore {
    const numSets = config.format === 'best_of_5' ? 5 : 3;
    
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
}

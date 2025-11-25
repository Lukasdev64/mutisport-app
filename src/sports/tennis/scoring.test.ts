import { describe, it, expect, beforeEach } from 'bun:test';
import { TennisScoringEngine } from './scoring';
import type { TennisMatchScore, TennisMatchConfig } from '@/types/tennis';

describe('TennisScoringEngine', () => {
  let defaultConfig: TennisMatchConfig;
  let initialScore: TennisMatchScore;

  beforeEach(() => {
    defaultConfig = {
      format: 'best_of_3',
      surface: 'hard',
      decidingPointAtDeuce: false,
      finalSetTiebreak: true,
      finalSetTiebreakPoints: 7,
      letRule: true,
      tiebreakAt: 6,
      coachingAllowed: false,
      warmupMinutes: 5,
      changeoverSeconds: 90,
      betweenPointsSeconds: 25
    };
    initialScore = TennisScoringEngine.initializeMatch(defaultConfig);
  });

  describe('initializeMatch', () => {
    it('should initialize a fresh match score', () => {
      const score = TennisScoringEngine.initializeMatch(defaultConfig);

      expect(score.player1Sets).toBe(0);
      expect(score.player2Sets).toBe(0);
      expect(score.sets).toHaveLength(1);
      expect(score.currentSet).toBe(0);
      expect(score.currentGame.player1Points).toBe(0);
      expect(score.currentGame.player2Points).toBe(0);
      expect(score.isComplete).toBe(false);
      expect(score.winnerId).toBeUndefined();
    });

    it('should initialize first set correctly', () => {
      const score = TennisScoringEngine.initializeMatch(defaultConfig);

      expect(score.sets[0].player1Games).toBe(0);
      expect(score.sets[0].player2Games).toBe(0);
      expect(score.sets[0].isTiebreak).toBe(false);
    });
  });

  describe('awardPoint', () => {
    it('should award a point to player 1', () => {
      const score = TennisScoringEngine.awardPoint(initialScore, 1);

      expect(score.currentGame.player1Points).toBe(1);
      expect(score.currentGame.player2Points).toBe(0);
    });

    it('should award a point to player 2', () => {
      const score = TennisScoringEngine.awardPoint(initialScore, 2);

      expect(score.currentGame.player1Points).toBe(0);
      expect(score.currentGame.player2Points).toBe(1);
    });

    it('should reach 40-0 after 3 points', () => {
      let score = initialScore;
      score = TennisScoringEngine.awardPoint(score, 1);
      score = TennisScoringEngine.awardPoint(score, 1);
      score = TennisScoringEngine.awardPoint(score, 1);

      expect(score.currentGame.player1Points).toBe(3);
    });

    it('should win game after 4-0 points', () => {
      let score = initialScore;
      score = TennisScoringEngine.awardPoint(score, 1);
      score = TennisScoringEngine.awardPoint(score, 1);
      score = TennisScoringEngine.awardPoint(score, 1);
      score = TennisScoringEngine.awardPoint(score, 1);

      // Game should be won, reset to 0-0
      expect(score.currentGame.player1Points).toBe(0);
      expect(score.currentGame.player2Points).toBe(0);
      expect(score.sets[0].player1Games).toBe(1);
    });

    it('should handle deuce (40-40)', () => {
      let score = initialScore;
      // Get to 40-40 (3 points each)
      for (let i = 0; i < 3; i++) {
        score = TennisScoringEngine.awardPoint(score, 1);
        score = TennisScoringEngine.awardPoint(score, 2);
      }
      // At this point we have 3-3 points (40-40)
      // Need one more point to trigger deuce detection logic
      score = TennisScoringEngine.awardPoint(score, 1); // 4-3 (advantage P1)

      expect(score.currentGame.isDeuce).toBe(true);
      expect(score.currentGame.advantage).toBe(1);
    });

    it('should handle advantage player 1', () => {
      let score = initialScore;
      // Get to 40-40
      for (let i = 0; i < 3; i++) {
        score = TennisScoringEngine.awardPoint(score, 1);
        score = TennisScoringEngine.awardPoint(score, 2);
      }
      // Player 1 gets advantage
      score = TennisScoringEngine.awardPoint(score, 1);

      expect(score.currentGame.isDeuce).toBe(true);
      expect(score.currentGame.advantage).toBe(1);
    });

    it('should return to deuce when advantage is lost', () => {
      let score = initialScore;
      // Get to 40-40
      for (let i = 0; i < 3; i++) {
        score = TennisScoringEngine.awardPoint(score, 1);
        score = TennisScoringEngine.awardPoint(score, 2);
      }
      // Player 1 gets advantage, then loses it
      score = TennisScoringEngine.awardPoint(score, 1);
      score = TennisScoringEngine.awardPoint(score, 2);

      expect(score.currentGame.isDeuce).toBe(true);
      expect(score.currentGame.advantage).toBeUndefined();
    });

    it('should win game from advantage', () => {
      let score = initialScore;
      // Get to 40-40
      for (let i = 0; i < 3; i++) {
        score = TennisScoringEngine.awardPoint(score, 1);
        score = TennisScoringEngine.awardPoint(score, 2);
      }
      // Player 1 wins from advantage
      score = TennisScoringEngine.awardPoint(score, 1);
      score = TennisScoringEngine.awardPoint(score, 1);

      // Game should be won
      expect(score.currentGame.player1Points).toBe(0);
      expect(score.sets[0].player1Games).toBe(1);
    });
  });

  describe('awardGame', () => {
    it('should award a game to player 1', () => {
      const score = TennisScoringEngine.awardGame(initialScore, 1);

      expect(score.sets[0].player1Games).toBe(1);
      expect(score.sets[0].player2Games).toBe(0);
    });

    it('should win set at 6-0', () => {
      let score = initialScore;
      for (let i = 0; i < 6; i++) {
        score = TennisScoringEngine.awardGame(score, 1);
      }

      // Set should be won
      expect(score.player1Sets).toBe(1);
      expect(score.player2Sets).toBe(0);
      expect(score.currentSet).toBe(1);
    });

    it('should need 7-5 to win (not 6-5)', () => {
      let score = initialScore;
      // Get to 5-5
      for (let i = 0; i < 5; i++) {
        score = TennisScoringEngine.awardGame(score, 1);
        score = TennisScoringEngine.awardGame(score, 2);
      }
      // 6-5
      score = TennisScoringEngine.awardGame(score, 1);

      expect(score.player1Sets).toBe(0); // No set win yet
      expect(score.sets[0].player1Games).toBe(6);
      expect(score.sets[0].player2Games).toBe(5);

      // 7-5 wins the set
      score = TennisScoringEngine.awardGame(score, 1);
      expect(score.player1Sets).toBe(1);
    });

    it('should trigger tiebreak at 6-6', () => {
      let score = initialScore;
      for (let i = 0; i < 6; i++) {
        score = TennisScoringEngine.awardGame(score, 1);
        score = TennisScoringEngine.awardGame(score, 2);
      }

      expect(score.sets[0].player1Games).toBe(6);
      expect(score.sets[0].player2Games).toBe(6);
      expect(score.sets[0].isTiebreak).toBe(true);
      expect(score.sets[0].tiebreakScore).toBeDefined();
    });
  });

  describe('awardTiebreakPoint', () => {
    let tiebreakScore: TennisMatchScore;

    beforeEach(() => {
      // Set up tiebreak at 6-6
      tiebreakScore = initialScore;
      for (let i = 0; i < 6; i++) {
        tiebreakScore = TennisScoringEngine.awardGame(tiebreakScore, 1);
        tiebreakScore = TennisScoringEngine.awardGame(tiebreakScore, 2);
      }
    });

    it('should award a tiebreak point', () => {
      const score = TennisScoringEngine.awardTiebreakPoint(tiebreakScore, 1);

      expect(score.sets[0].tiebreakScore?.player1).toBe(1);
      expect(score.sets[0].tiebreakScore?.player2).toBe(0);
    });

    it('should win tiebreak at 7-0', () => {
      let score = tiebreakScore;
      for (let i = 0; i < 7; i++) {
        score = TennisScoringEngine.awardTiebreakPoint(score, 1);
      }

      expect(score.player1Sets).toBe(1);
      expect(score.currentSet).toBe(1);
    });

    it('should require 2-point lead to win tiebreak', () => {
      let score = tiebreakScore;
      // Get to 6-6 in tiebreak
      for (let i = 0; i < 6; i++) {
        score = TennisScoringEngine.awardTiebreakPoint(score, 1);
        score = TennisScoringEngine.awardTiebreakPoint(score, 2);
      }
      // 7-6 doesn't win
      score = TennisScoringEngine.awardTiebreakPoint(score, 1);

      expect(score.player1Sets).toBe(0);
      expect(score.sets[0].tiebreakScore?.player1).toBe(7);
      expect(score.sets[0].tiebreakScore?.player2).toBe(6);

      // 8-6 wins
      score = TennisScoringEngine.awardTiebreakPoint(score, 1);
      expect(score.player1Sets).toBe(1);
    });

    it('should not modify score if not in tiebreak', () => {
      const score = TennisScoringEngine.awardTiebreakPoint(initialScore, 1);

      // Should return unchanged score
      expect(score.sets[0].tiebreakScore).toBeUndefined();
    });
  });

  describe('awardSet', () => {
    it('should award a set to player 1', () => {
      const score = TennisScoringEngine.awardSet(initialScore, 1);

      expect(score.player1Sets).toBe(1);
      expect(score.player2Sets).toBe(0);
      expect(score.currentSet).toBe(1);
    });

    it('should add a new set after awarding', () => {
      const score = TennisScoringEngine.awardSet(initialScore, 1);

      expect(score.sets).toHaveLength(2);
      expect(score.sets[1].player1Games).toBe(0);
      expect(score.sets[1].player2Games).toBe(0);
    });

    it('should win match in best of 3 at 2-0', () => {
      let score = initialScore;
      score = TennisScoringEngine.awardSet(score, 1);
      score = TennisScoringEngine.awardSet(score, 1);

      expect(score.isComplete).toBe(true);
      expect(score.winnerId).toBeDefined();
    });

    it('should not complete match at 1-1 in best of 3', () => {
      let score = initialScore;
      score = TennisScoringEngine.awardSet(score, 1);
      score = TennisScoringEngine.awardSet(score, 2);

      expect(score.isComplete).toBe(false);
      expect(score.player1Sets).toBe(1);
      expect(score.player2Sets).toBe(1);
    });

    it('should use player IDs when provided', () => {
      let score = initialScore;
      const playerIds = { player1Id: 'alice-123', player2Id: 'bob-456' };

      score = TennisScoringEngine.awardSet(score, 1, playerIds);
      score = TennisScoringEngine.awardSet(score, 1, playerIds);

      expect(score.winnerId).toBe('alice-123');
    });
  });

  describe('getScoreDisplay', () => {
    it('should display initial score', () => {
      const display = TennisScoringEngine.getScoreDisplay(initialScore);

      expect(display).toBe('0-0');
    });

    it('should display set score', () => {
      let score = initialScore;
      for (let i = 0; i < 3; i++) {
        score = TennisScoringEngine.awardGame(score, 1);
      }
      for (let i = 0; i < 2; i++) {
        score = TennisScoringEngine.awardGame(score, 2);
      }

      const display = TennisScoringEngine.getScoreDisplay(score);
      expect(display).toBe('3-2');
    });

    it('should display tiebreak score', () => {
      let score = initialScore;
      // Get to 6-6
      for (let i = 0; i < 6; i++) {
        score = TennisScoringEngine.awardGame(score, 1);
        score = TennisScoringEngine.awardGame(score, 2);
      }
      // Some tiebreak points
      for (let i = 0; i < 3; i++) {
        score = TennisScoringEngine.awardTiebreakPoint(score, 1);
      }
      score = TennisScoringEngine.awardTiebreakPoint(score, 2);

      const display = TennisScoringEngine.getScoreDisplay(score);
      expect(display).toBe('6-6 (3-1)');
    });
  });

  describe('getGameScoreDisplay', () => {
    it('should display 0-0', () => {
      const display = TennisScoringEngine.getGameScoreDisplay(initialScore.currentGame);

      expect(display.p1).toBe('0');
      expect(display.p2).toBe('0');
    });

    it('should display 15-0', () => {
      const score = TennisScoringEngine.awardPoint(initialScore, 1);
      const display = TennisScoringEngine.getGameScoreDisplay(score.currentGame);

      expect(display.p1).toBe('15');
      expect(display.p2).toBe('0');
    });

    it('should display 30-15', () => {
      let score = initialScore;
      score = TennisScoringEngine.awardPoint(score, 1);
      score = TennisScoringEngine.awardPoint(score, 1);
      score = TennisScoringEngine.awardPoint(score, 2);

      const display = TennisScoringEngine.getGameScoreDisplay(score.currentGame);

      expect(display.p1).toBe('30');
      expect(display.p2).toBe('15');
    });

    it('should display 40-30', () => {
      let score = initialScore;
      for (let i = 0; i < 3; i++) {
        score = TennisScoringEngine.awardPoint(score, 1);
      }
      for (let i = 0; i < 2; i++) {
        score = TennisScoringEngine.awardPoint(score, 2);
      }

      const display = TennisScoringEngine.getGameScoreDisplay(score.currentGame);

      expect(display.p1).toBe('40');
      expect(display.p2).toBe('30');
    });

    it('should display DEUCE', () => {
      let score = initialScore;
      // Get to 40-40 (3-3 points)
      for (let i = 0; i < 3; i++) {
        score = TennisScoringEngine.awardPoint(score, 1);
        score = TennisScoringEngine.awardPoint(score, 2);
      }
      // Go to advantage then back to deuce
      score = TennisScoringEngine.awardPoint(score, 1); // 4-3 Adv P1
      score = TennisScoringEngine.awardPoint(score, 2); // 4-4 Deuce

      const display = TennisScoringEngine.getGameScoreDisplay(score.currentGame);

      expect(display.p1).toBe('DEUCE');
      expect(display.p2).toBe('DEUCE');
    });

    it('should display AD-40', () => {
      let score = initialScore;
      for (let i = 0; i < 3; i++) {
        score = TennisScoringEngine.awardPoint(score, 1);
        score = TennisScoringEngine.awardPoint(score, 2);
      }
      score = TennisScoringEngine.awardPoint(score, 1);

      const display = TennisScoringEngine.getGameScoreDisplay(score.currentGame);

      expect(display.p1).toBe('AD');
      expect(display.p2).toBe('40');
    });

    it('should display 40-AD', () => {
      let score = initialScore;
      for (let i = 0; i < 3; i++) {
        score = TennisScoringEngine.awardPoint(score, 1);
        score = TennisScoringEngine.awardPoint(score, 2);
      }
      score = TennisScoringEngine.awardPoint(score, 2);

      const display = TennisScoringEngine.getGameScoreDisplay(score.currentGame);

      expect(display.p1).toBe('40');
      expect(display.p2).toBe('AD');
    });
  });

  describe('Full match simulation - Best of 3', () => {
    it('should complete a 2-0 match', () => {
      let score = initialScore;

      // Win first set 6-0
      for (let game = 0; game < 6; game++) {
        for (let point = 0; point < 4; point++) {
          score = TennisScoringEngine.awardPoint(score, 1);
        }
      }

      expect(score.player1Sets).toBe(1);

      // Win second set 6-0
      for (let game = 0; game < 6; game++) {
        for (let point = 0; point < 4; point++) {
          score = TennisScoringEngine.awardPoint(score, 1);
        }
      }

      expect(score.isComplete).toBe(true);
      expect(score.player1Sets).toBe(2);
      expect(score.player2Sets).toBe(0);
    });

    it('should complete a 2-1 match', () => {
      let score = initialScore;
      const playerIds = { player1Id: 'p1', player2Id: 'p2' };

      // P1 wins first set 6-0
      for (let game = 0; game < 6; game++) {
        for (let point = 0; point < 4; point++) {
          score = TennisScoringEngine.awardPoint(score, 1, playerIds);
        }
      }
      expect(score.player1Sets).toBe(1);

      // P2 wins second set 6-0
      for (let game = 0; game < 6; game++) {
        for (let point = 0; point < 4; point++) {
          score = TennisScoringEngine.awardPoint(score, 2, playerIds);
        }
      }
      expect(score.player1Sets).toBe(1);
      expect(score.player2Sets).toBe(1);

      // P1 wins third set 6-0
      for (let game = 0; game < 6; game++) {
        for (let point = 0; point < 4; point++) {
          score = TennisScoringEngine.awardPoint(score, 1, playerIds);
        }
      }

      expect(score.isComplete).toBe(true);
      expect(score.player1Sets).toBe(2);
      expect(score.player2Sets).toBe(1);
      expect(score.winnerId).toBe('p1');
    });
  });
});

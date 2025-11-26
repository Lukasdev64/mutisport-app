/**
 * Tests for Tennis Scoring Engine
 * Testing point, game, and set scoring logic
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { TennisScoringEngine } from '../sports/tennis/scoring';
import type { TennisMatchScore, TennisMatchConfig } from '../types/tennis';

/**
 * Helper to create a default tennis match config
 */
const createDefaultConfig = (format: 'best_of_3' | 'best_of_5' = 'best_of_3'): TennisMatchConfig => ({
  format,
  surface: 'hard',
  tiebreakAt: 6,
  finalSetTiebreak: true,
  finalSetTiebreakPoints: 7,
  decidingPointAtDeuce: false,
  letRule: true,
  coachingAllowed: false,
  warmupMinutes: 5,
  changeoverSeconds: 90,
  betweenPointsSeconds: 25
});

describe('TennisScoringEngine', () => {
  let initialScore: TennisMatchScore;

  beforeEach(() => {
    initialScore = TennisScoringEngine.initializeMatch(createDefaultConfig());
  });

  describe('initializeMatch', () => {
    it('should initialize a new match with default values', () => {
      expect(initialScore.player1Sets).toBe(0);
      expect(initialScore.player2Sets).toBe(0);
      expect(initialScore.sets).toHaveLength(1);
      expect(initialScore.currentSet).toBe(0);
      expect(initialScore.currentGame.player1Points).toBe(0);
      expect(initialScore.currentGame.player2Points).toBe(0);
      expect(initialScore.isComplete).toBe(false);
      expect(initialScore.winnerId).toBeUndefined();
    });
  });

  describe('awardPoint - Basic point transitions', () => {
    it('should transition points: 0 -> 15 -> 30 -> 40', () => {
      let score = initialScore;

      // 0 -> 15
      score = TennisScoringEngine.awardPoint(score, 1);
      expect(score.currentGame.player1Points).toBe(1);

      // 15 -> 30
      score = TennisScoringEngine.awardPoint(score, 1);
      expect(score.currentGame.player1Points).toBe(2);

      // 30 -> 40
      score = TennisScoringEngine.awardPoint(score, 1);
      expect(score.currentGame.player1Points).toBe(3);
    });

    it('should award game when player reaches 4 points with 2-point lead', () => {
      let score = initialScore;

      // Player 1 wins 4 points in a row (0-15-30-40-Game)
      score = TennisScoringEngine.awardPoint(score, 1); // 15-0
      score = TennisScoringEngine.awardPoint(score, 1); // 30-0
      score = TennisScoringEngine.awardPoint(score, 1); // 40-0
      score = TennisScoringEngine.awardPoint(score, 1); // Game

      // Should have reset game score and awarded a game
      expect(score.currentGame.player1Points).toBe(0);
      expect(score.currentGame.player2Points).toBe(0);
      expect(score.sets[0].player1Games).toBe(1);
    });
  });

  describe('awardPoint - Deuce and Advantage', () => {
    let deuceScore: TennisMatchScore;

    beforeEach(() => {
      // Set up a deuce situation (40-40)
      deuceScore = {
        ...initialScore,
        currentGame: {
          player1Points: 3,
          player2Points: 3,
          isDeuce: false,
          advantage: undefined
        }
      };
    });

    it('should detect deuce at 40-40', () => {
      let score = deuceScore;
      score = TennisScoringEngine.awardPoint(score, 1);

      // Now 4-3, player 1 has advantage
      expect(score.currentGame.isDeuce).toBe(true);
      expect(score.currentGame.advantage).toBe(1);
    });

    it('should return to deuce when advantage is lost', () => {
      let score = deuceScore;

      // Player 1 gets advantage (4-3)
      score = TennisScoringEngine.awardPoint(score, 1);
      expect(score.currentGame.advantage).toBe(1);

      // Player 2 scores, back to deuce (4-4)
      score = TennisScoringEngine.awardPoint(score, 2);
      expect(score.currentGame.isDeuce).toBe(true);
      expect(score.currentGame.advantage).toBeUndefined();
    });

    it('should win game when scoring from advantage', () => {
      let score = deuceScore;

      // Player 1 gets advantage
      score = TennisScoringEngine.awardPoint(score, 1);

      // Player 1 wins game from advantage
      score = TennisScoringEngine.awardPoint(score, 1);

      expect(score.currentGame.player1Points).toBe(0);
      expect(score.sets[0].player1Games).toBe(1);
    });

    it('should alternate advantage correctly', () => {
      let score = deuceScore;

      // Player 1 advantage
      score = TennisScoringEngine.awardPoint(score, 1);
      expect(score.currentGame.advantage).toBe(1);

      // Back to deuce
      score = TennisScoringEngine.awardPoint(score, 2);
      expect(score.currentGame.advantage).toBeUndefined();

      // Player 2 advantage
      score = TennisScoringEngine.awardPoint(score, 2);
      expect(score.currentGame.advantage).toBe(2);

      // Back to deuce
      score = TennisScoringEngine.awardPoint(score, 1);
      expect(score.currentGame.advantage).toBeUndefined();
    });
  });

  describe('awardGame - Set victory at 6-x', () => {
    it('should win set at 6-0', () => {
      let score = initialScore;

      // Win 6 games for player 1
      for (let game = 0; game < 6; game++) {
        score = TennisScoringEngine.awardGame(score, 1);
      }

      expect(score.player1Sets).toBe(1);
      expect(score.currentSet).toBe(1);
      expect(score.sets).toHaveLength(2);
    });

    it('should win set at 6-4', () => {
      let score = {
        ...initialScore,
        sets: [{
          player1Games: 5,
          player2Games: 4,
          isTiebreak: false
        }]
      };

      score = TennisScoringEngine.awardGame(score, 1);

      expect(score.player1Sets).toBe(1);
      expect(score.currentSet).toBe(1);
    });

    it('should not win set at 6-5 (need 2-game lead)', () => {
      let score = {
        ...initialScore,
        sets: [{
          player1Games: 5,
          player2Games: 5,
          isTiebreak: false
        }]
      };

      score = TennisScoringEngine.awardGame(score, 1);

      expect(score.player1Sets).toBe(0);
      expect(score.sets[0].player1Games).toBe(6);
    });

    it('should win set at 7-5', () => {
      let score = {
        ...initialScore,
        sets: [{
          player1Games: 6,
          player2Games: 5,
          isTiebreak: false
        }]
      };

      score = TennisScoringEngine.awardGame(score, 1);

      expect(score.player1Sets).toBe(1);
      expect(score.sets[0].player1Games).toBe(7);
    });
  });

  describe('Tie-break at 6-6', () => {
    it('should trigger tie-break at 6-6', () => {
      let score: TennisMatchScore = {
        ...initialScore,
        sets: [{
          player1Games: 5,
          player2Games: 6,
          isTiebreak: false
        }]
      };

      score = TennisScoringEngine.awardGame(score, 1);

      expect(score.sets[0].player1Games).toBe(6);
      expect(score.sets[0].player2Games).toBe(6);
      expect(score.sets[0].isTiebreak).toBe(true);
      expect(score.sets[0].tiebreakScore).toEqual({ player1: 0, player2: 0 });
    });

    it('should win tie-break at 7-5', () => {
      let score: TennisMatchScore = {
        ...initialScore,
        sets: [{
          player1Games: 6,
          player2Games: 6,
          isTiebreak: true,
          tiebreakScore: { player1: 6, player2: 5 }
        }]
      };

      score = TennisScoringEngine.awardTiebreakPoint(score, 1);

      expect(score.player1Sets).toBe(1);
      expect(score.sets[0].tiebreakScore?.player1).toBe(7);
    });

    it('should not win tie-break at 7-6 (need 2-point lead)', () => {
      let score: TennisMatchScore = {
        ...initialScore,
        sets: [{
          player1Games: 6,
          player2Games: 6,
          isTiebreak: true,
          tiebreakScore: { player1: 6, player2: 6 }
        }]
      };

      score = TennisScoringEngine.awardTiebreakPoint(score, 1);

      expect(score.player1Sets).toBe(0);
      expect(score.sets[0].tiebreakScore?.player1).toBe(7);
    });

    it('should win tie-break at 8-6', () => {
      let score: TennisMatchScore = {
        ...initialScore,
        sets: [{
          player1Games: 6,
          player2Games: 6,
          isTiebreak: true,
          tiebreakScore: { player1: 7, player2: 6 }
        }]
      };

      score = TennisScoringEngine.awardTiebreakPoint(score, 1);

      expect(score.player1Sets).toBe(1);
    });
  });

  describe('awardSet - Match victory (Best of 3)', () => {
    it('should win match at 2-0 sets in best of 3', () => {
      let score: TennisMatchScore = {
        player1Sets: 1,
        player2Sets: 0,
        sets: [
          { player1Games: 6, player2Games: 4, isTiebreak: false },
          { player1Games: 5, player2Games: 4, isTiebreak: false }
        ],
        currentSet: 1,
        currentGame: { player1Points: 0, player2Points: 0, isDeuce: false },
        isComplete: false
      };

      // Win the 6th game of set 2
      score = TennisScoringEngine.awardGame(score, 1);

      expect(score.isComplete).toBe(true);
      expect(score.player1Sets).toBe(2);
      expect(score.winnerId).toBe('1');
    });

    it('should win match at 2-1 sets in best of 3', () => {
      let score: TennisMatchScore = {
        player1Sets: 1,
        player2Sets: 1,
        sets: [
          { player1Games: 6, player2Games: 4, isTiebreak: false },
          { player1Games: 4, player2Games: 6, isTiebreak: false },
          { player1Games: 5, player2Games: 4, isTiebreak: false }
        ],
        currentSet: 2,
        currentGame: { player1Points: 0, player2Points: 0, isDeuce: false },
        isComplete: false
      };

      score = TennisScoringEngine.awardGame(score, 1);

      expect(score.isComplete).toBe(true);
      expect(score.player1Sets).toBe(2);
    });
  });

  describe('awardSet - Match victory (Best of 5)', () => {
    it('should win match at 3-0 sets in best of 5', () => {
      let score: TennisMatchScore = {
        player1Sets: 2,
        player2Sets: 0,
        sets: [
          { player1Games: 6, player2Games: 4, isTiebreak: false },
          { player1Games: 6, player2Games: 3, isTiebreak: false },
          { player1Games: 6, player2Games: 0, isTiebreak: false },
          { player1Games: 0, player2Games: 0, isTiebreak: false },
          { player1Games: 0, player2Games: 0, isTiebreak: false }
        ],
        currentSet: 2,
        currentGame: { player1Points: 0, player2Points: 0, isDeuce: false },
        isComplete: false
      };

      score = TennisScoringEngine.awardSet(score, 1);

      expect(score.isComplete).toBe(true);
      expect(score.player1Sets).toBe(3);
    });

    it('should win match at 3-2 sets in best of 5', () => {
      let score: TennisMatchScore = {
        player1Sets: 2,
        player2Sets: 2,
        sets: [
          { player1Games: 6, player2Games: 4, isTiebreak: false },
          { player1Games: 4, player2Games: 6, isTiebreak: false },
          { player1Games: 6, player2Games: 3, isTiebreak: false },
          { player1Games: 3, player2Games: 6, isTiebreak: false },
          { player1Games: 5, player2Games: 4, isTiebreak: false }
        ],
        currentSet: 4,
        currentGame: { player1Points: 0, player2Points: 0, isDeuce: false },
        isComplete: false
      };

      score = TennisScoringEngine.awardGame(score, 1);

      expect(score.isComplete).toBe(true);
      expect(score.player1Sets).toBe(3);
    });

    it('should not finish match at 2-0 in best of 5', () => {
      let score: TennisMatchScore = {
        player1Sets: 1,
        player2Sets: 0,
        sets: [
          { player1Games: 6, player2Games: 4, isTiebreak: false },
          { player1Games: 5, player2Games: 4, isTiebreak: false },
          { player1Games: 0, player2Games: 0, isTiebreak: false },
          { player1Games: 0, player2Games: 0, isTiebreak: false },
          { player1Games: 0, player2Games: 0, isTiebreak: false }
        ],
        currentSet: 1,
        currentGame: { player1Points: 0, player2Points: 0, isDeuce: false },
        isComplete: false
      };

      score = TennisScoringEngine.awardGame(score, 1);

      expect(score.isComplete).toBe(false);
      expect(score.player1Sets).toBe(2);
    });
  });

  describe('awardSet - winnerId with real player IDs', () => {
    it('should set winnerId to real player ID when provided', () => {
      let score: TennisMatchScore = {
        player1Sets: 1,
        player2Sets: 0,
        sets: [
          { player1Games: 6, player2Games: 4, isTiebreak: false },
          { player1Games: 5, player2Games: 4, isTiebreak: false }
        ],
        currentSet: 1,
        currentGame: { player1Points: 0, player2Points: 0, isDeuce: false },
        isComplete: false
      };

      const playerIds = { player1Id: 'uuid-player-1', player2Id: 'uuid-player-2' };
      score = TennisScoringEngine.awardGame(score, 1, playerIds);

      expect(score.winnerId).toBe('uuid-player-1');
    });

    it('should set winnerId to player 2 ID when player 2 wins', () => {
      let score: TennisMatchScore = {
        player1Sets: 0,
        player2Sets: 1,
        sets: [
          { player1Games: 4, player2Games: 6, isTiebreak: false },
          { player1Games: 4, player2Games: 5, isTiebreak: false }
        ],
        currentSet: 1,
        currentGame: { player1Points: 0, player2Points: 0, isDeuce: false },
        isComplete: false
      };

      const playerIds = { player1Id: 'uuid-player-1', player2Id: 'uuid-player-2' };
      score = TennisScoringEngine.awardGame(score, 2, playerIds);

      expect(score.winnerId).toBe('uuid-player-2');
    });

    it('should fallback to indicator when no playerIds provided', () => {
      let score: TennisMatchScore = {
        player1Sets: 1,
        player2Sets: 0,
        sets: [
          { player1Games: 6, player2Games: 4, isTiebreak: false },
          { player1Games: 5, player2Games: 4, isTiebreak: false }
        ],
        currentSet: 1,
        currentGame: { player1Points: 0, player2Points: 0, isDeuce: false },
        isComplete: false
      };

      score = TennisScoringEngine.awardGame(score, 1);

      expect(score.winnerId).toBe('1');
    });
  });

  describe('getScoreDisplay', () => {
    it('should display simple set scores', () => {
      const score: TennisMatchScore = {
        player1Sets: 1,
        player2Sets: 0,
        sets: [
          { player1Games: 6, player2Games: 4, isTiebreak: false },
          { player1Games: 3, player2Games: 2, isTiebreak: false }
        ],
        currentSet: 1,
        currentGame: { player1Points: 0, player2Points: 0, isDeuce: false },
        isComplete: false
      };

      expect(TennisScoringEngine.getScoreDisplay(score)).toBe('6-4, 3-2');
    });

    it('should display tie-break score', () => {
      const score: TennisMatchScore = {
        player1Sets: 1,
        player2Sets: 0,
        sets: [
          { player1Games: 7, player2Games: 6, isTiebreak: true, tiebreakScore: { player1: 7, player2: 5 } }
        ],
        currentSet: 0,
        currentGame: { player1Points: 0, player2Points: 0, isDeuce: false },
        isComplete: false
      };

      expect(TennisScoringEngine.getScoreDisplay(score)).toBe('7-6 (7-5)');
    });
  });

  describe('getGameScoreDisplay', () => {
    it('should display regular points', () => {
      expect(TennisScoringEngine.getGameScoreDisplay({
        player1Points: 0, player2Points: 0, isDeuce: false
      })).toEqual({ p1: '0', p2: '0' });

      expect(TennisScoringEngine.getGameScoreDisplay({
        player1Points: 1, player2Points: 2, isDeuce: false
      })).toEqual({ p1: '15', p2: '30' });

      expect(TennisScoringEngine.getGameScoreDisplay({
        player1Points: 3, player2Points: 2, isDeuce: false
      })).toEqual({ p1: '40', p2: '30' });
    });

    it('should display deuce', () => {
      expect(TennisScoringEngine.getGameScoreDisplay({
        player1Points: 3, player2Points: 3, isDeuce: true
      })).toEqual({ p1: 'DEUCE', p2: 'DEUCE' });
    });

    it('should display advantage', () => {
      expect(TennisScoringEngine.getGameScoreDisplay({
        player1Points: 4, player2Points: 3, isDeuce: true, advantage: 1
      })).toEqual({ p1: 'AD', p2: '40' });

      expect(TennisScoringEngine.getGameScoreDisplay({
        player1Points: 3, player2Points: 4, isDeuce: true, advantage: 2
      })).toEqual({ p1: '40', p2: 'AD' });
    });
  });
});

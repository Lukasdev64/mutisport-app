/**
 * Tests for Match Service
 * Testing score parsing and validation
 */

import { describe, it, expect } from 'bun:test';
import {
  parseScoreString,
  formatScoreString,
  validateScore,
  calculateMatchDuration
} from '../services/tournament/matchService';

describe('Score String Parsing', () => {
  describe('parseScoreString', () => {
    it('should parse simple tennis scores', () => {
      const result = parseScoreString('6-4 7-5');

      expect(result.sets).toHaveLength(2);
      expect(result.sets[0]).toEqual({ player1: 6, player2: 4 });
      expect(result.sets[1]).toEqual({ player1: 7, player2: 5 });
      expect(result.tiebreaks).toEqual([null, null]);
    });

    it('should parse scores with tiebreaks', () => {
      const result = parseScoreString('6-4 7-6(5) 6-3');

      expect(result.sets).toHaveLength(3);
      expect(result.sets[1]).toEqual({ player1: 7, player2: 6 });
      expect(result.tiebreaks).toHaveLength(3);
      expect(result.tiebreaks?.[1]).toBe(5);
    });

    it('should handle match tiebreak format', () => {
      const result = parseScoreString('6-4 3-6 [10-8]');

      expect(result.sets).toHaveLength(2);
      expect(result.matchTiebreak).toEqual({ player1: 10, player2: 8 });
    });

    it('should parse retired matches', () => {
      const result = parseScoreString('6-3 2-1 ret.');

      expect(result.sets).toHaveLength(2);
      expect(result.retired).toBe(true);
    });

    it('should handle walkover', () => {
      const result = parseScoreString('W.O.');

      expect(result.walkover).toBe(true);
      expect(result.sets).toHaveLength(0);
    });
  });

  describe('formatScoreString', () => {
    it('should format simple scores', () => {
      const scoreData = {
        sets: [
          { player1: 6, player2: 4 },
          { player1: 7, player2: 5 }
        ],
        tiebreaks: [null, null]
      };

      expect(formatScoreString(scoreData)).toBe('6-4 7-5');
    });

    it('should format scores with tiebreaks', () => {
      const scoreData = {
        sets: [
          { player1: 6, player2: 4 },
          { player1: 7, player2: 6 }
        ],
        tiebreaks: [null, 5]
      };

      expect(formatScoreString(scoreData)).toBe('6-4 7-6(5)');
    });
  });
});

describe('Score Validation', () => {
  describe('validateScore', () => {
    it('should validate correct tennis scores', () => {
      const valid = {
        sets: [
          { player1: 6, player2: 4 },
          { player1: 6, player2: 3 }
        ]
      };

      expect(validateScore(valid)).toBe(true);
    });

    it('should reject sets without 2-game margin', () => {
      const invalid = {
        sets: [{ player1: 6, player2: 5 }]
      };

      expect(validateScore(invalid)).toBe(false);
    });
  });
});

describe('Match Duration Calculation', () => {
  it('should calculate duration from timestamps', () => {
    const startTime = new Date('2025-01-01T10:00:00Z');
    const endTime = new Date('2025-01-01T12:30:00Z');

    const duration = calculateMatchDuration(startTime, endTime);

    expect(duration).toBe(150); // 150 minutes
  });
});

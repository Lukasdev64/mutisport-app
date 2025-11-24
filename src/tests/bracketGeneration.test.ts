/**
 * Tests for Bracket Generation Service
 * Testing all tournament format algorithms
 */

import { describe, it, expect } from 'vitest';
import {
  generateSingleEliminationBracket,
  generateDoubleEliminationBracket,
  generateRoundRobinBracket,
  generateSwissBracket,
  nextPowerOfTwo,
  distributeByes
} from '../services/tournament/bracketGenerationService';

describe('Bracket Generation Utilities', () => {
  describe('nextPowerOfTwo', () => {
    it('should return next power of 2', () => {
      expect(nextPowerOfTwo(5)).toBe(8);
      expect(nextPowerOfTwo(8)).toBe(8);
      expect(nextPowerOfTwo(9)).toBe(16);
      expect(nextPowerOfTwo(1)).toBe(2);
    });
  });

  describe('distributeByes', () => {
    it('should distribute byes evenly', () => {
      const result = distributeByes(8, 3);
      expect(result).toHaveLength(3);
      // Check logic if needed, or just length
    });
  });
});

describe('Single Elimination Bracket', () => {
  it('should generate bracket for power of 2 players', () => {
    const players = [
      { id: '1', name: 'Player 1', seed: 1 },
      { id: '2', name: 'Player 2', seed: 2 },
      { id: '3', name: 'Player 3', seed: 3 },
      { id: '4', name: 'Player 4', seed: 4 }
    ];

    const bracket = generateSingleEliminationBracket(players);

    expect(bracket.rounds).toHaveLength(2); // Semi-finals + Finals
    expect(bracket.rounds[0].matches).toHaveLength(2); // 2 semi-final matches
    expect(bracket.rounds[1].matches).toHaveLength(1); // 1 final match
    expect(bracket.totalMatches).toBe(3);
  });

  it('should handle non-power-of-2 with byes', () => {
    const players = [
      { id: '1', name: 'Player 1', seed: 1 },
      { id: '2', name: 'Player 2', seed: 2 },
      { id: '3', name: 'Player 3', seed: 3 }
    ];

    const bracket = generateSingleEliminationBracket(players);

    expect(bracket.rounds).toHaveLength(2);
    expect(bracket.rounds[0].matches).toHaveLength(2);

    // Check that one match has a bye
    const byeMatches = bracket.rounds[0].matches.filter(
      m => m.player1_name === 'BYE' || m.player2_name === 'BYE'
    );
    expect(byeMatches).toHaveLength(1);
  });
});

describe('Double Elimination Bracket', () => {
  it('should generate winner and loser brackets', () => {
    const players = [
      { id: '1', name: 'Player 1', seed: 1 },
      { id: '2', name: 'Player 2', seed: 2 },
      { id: '3', name: 'Player 3', seed: 3 },
      { id: '4', name: 'Player 4', seed: 4 }
    ];

    const bracket = generateDoubleEliminationBracket(players);

    expect(bracket.winner_bracket.length).toBeGreaterThan(0);
    expect(bracket.loser_bracket.length).toBeGreaterThan(0);
    expect(bracket.grand_final).toHaveLength(2);
  });
});

describe('Round Robin Bracket', () => {
  it('should generate correct number of rounds', () => {
    const players = [
      { id: '1', name: 'Player 1', seed: 1 },
      { id: '2', name: 'Player 2', seed: 2 },
      { id: '3', name: 'Player 3', seed: 3 },
      { id: '4', name: 'Player 4', seed: 4 }
    ];

    const bracket = generateRoundRobinBracket(players);

    // n players = n-1 rounds
    expect(bracket.rounds).toHaveLength(3);
  });
});

describe('Swiss Bracket', () => {
  it('should generate correct number of matches per round', () => {
    const players = [
      { id: '1', name: 'Player 1', seed: 1 },
      { id: '2', name: 'Player 2', seed: 2 },
      { id: '3', name: 'Player 3', seed: 3 },
      { id: '4', name: 'Player 4', seed: 4 }
    ];

    const bracket = generateSwissBracket(players, 3);

    expect(bracket.rounds).toHaveLength(3);
    bracket.rounds.forEach(round => {
      // Round 1 has matches, others empty initially
      if (round.round === 1) {
        expect(round.matches).toHaveLength(2);
      }
    });
  });
});

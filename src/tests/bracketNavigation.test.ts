/**
 * Tests for Bracket Navigation Hook and Arena Utilities
 * Tests the mobile bracket carousel navigation system
 */

import { describe, it, expect } from 'bun:test';
import { getRoundDisplayName } from '../hooks/useBracketNavigation';
import { getMatchDisplayStatus, ARENA_TABS } from '../types/arena';
import type { Round, Match } from '../types/tournament';

// ============================================================================
// getRoundDisplayName Tests
// ============================================================================

describe('getRoundDisplayName', () => {
  const createRound = (id: string, name?: string): Round => ({
    id,
    name,
    matches: [],
    roundNumber: 1,
  });

  describe('with custom round names', () => {
    it('should return round name if defined', () => {
      const round = createRound('r1', 'Custom Round Name');
      expect(getRoundDisplayName(round, 0, 4)).toBe('Custom Round Name');
    });

    it('should prioritize round name over generated name', () => {
      const round = createRound('final', 'Grande Finale');
      // Even though it's the last round, custom name takes precedence
      expect(getRoundDisplayName(round, 3, 4)).toBe('Grande Finale');
    });
  });

  describe('generated round names (French)', () => {
    it('should return "Finale" for last round', () => {
      const round = createRound('r4');
      expect(getRoundDisplayName(round, 3, 4)).toBe('Finale');
    });

    it('should return "Demi-finales" for second to last round', () => {
      const round = createRound('r3');
      expect(getRoundDisplayName(round, 2, 4)).toBe('Demi-finales');
    });

    it('should return "Quarts de finale" for third to last round', () => {
      const round = createRound('r2');
      expect(getRoundDisplayName(round, 1, 4)).toBe('Quarts de finale');
    });

    it('should return "Round X" for earlier rounds', () => {
      const round = createRound('r1');
      expect(getRoundDisplayName(round, 0, 4)).toBe('Round 1');
      expect(getRoundDisplayName(round, 0, 5)).toBe('Round 1');
    });
  });

  describe('edge cases', () => {
    it('should handle single round tournament', () => {
      const round = createRound('r1');
      expect(getRoundDisplayName(round, 0, 1)).toBe('Finale');
    });

    it('should handle two round tournament', () => {
      const round1 = createRound('r1');
      const round2 = createRound('r2');
      // For 2 rounds: "Demi-finales" needs total > 2, so first round is "Round 1"
      expect(getRoundDisplayName(round1, 0, 2)).toBe('Round 1');
      expect(getRoundDisplayName(round2, 1, 2)).toBe('Finale');
    });

    it('should handle three round tournament', () => {
      const round1 = createRound('r1');
      const round2 = createRound('r2');
      const round3 = createRound('r3');
      // For 3 rounds: "Quarts de finale" needs total > 3, so first round is "Round 1"
      expect(getRoundDisplayName(round1, 0, 3)).toBe('Round 1');
      expect(getRoundDisplayName(round2, 1, 3)).toBe('Demi-finales');
      expect(getRoundDisplayName(round3, 2, 3)).toBe('Finale');
    });
  });
});

// ============================================================================
// getMatchDisplayStatus Tests
// ============================================================================

describe('getMatchDisplayStatus', () => {
  const createMatch = (overrides: Partial<Match> = {}): Match => ({
    id: 'match-1',
    player1Id: 'p1',
    player2Id: 'p2',
    status: 'pending',
    roundId: 'r1',
    ...overrides,
  });

  it('should return "completed" when match has winnerId', () => {
    const match = createMatch({
      status: 'completed',
      result: { winnerId: 'p1', player1Score: 2, player2Score: 0 },
    });
    expect(getMatchDisplayStatus(match)).toBe('completed');
  });

  it('should return "completed" even if status is not completed but has winnerId', () => {
    const match = createMatch({
      status: 'pending',
      result: { winnerId: 'p1', player1Score: 2, player2Score: 0 },
    });
    expect(getMatchDisplayStatus(match)).toBe('completed');
  });

  it('should return "live" when status is in_progress', () => {
    const match = createMatch({ status: 'in_progress' });
    expect(getMatchDisplayStatus(match)).toBe('live');
  });

  it('should return "live" when status is active', () => {
    const match = createMatch({ status: 'active' });
    expect(getMatchDisplayStatus(match)).toBe('live');
  });

  it('should return "scheduled" when scheduledAt is set', () => {
    const match = createMatch({
      status: 'pending',
      scheduledAt: '2024-01-15T14:00:00Z'
    });
    expect(getMatchDisplayStatus(match)).toBe('scheduled');
  });

  it('should return "upcoming" for pending match without schedule', () => {
    const match = createMatch({ status: 'pending' });
    expect(getMatchDisplayStatus(match)).toBe('upcoming');
  });

  it('should prioritize completed over live', () => {
    const match = createMatch({
      status: 'in_progress',
      result: { winnerId: 'p1', player1Score: 2, player2Score: 0 },
    });
    expect(getMatchDisplayStatus(match)).toBe('completed');
  });

  it('should prioritize live over scheduled', () => {
    const match = createMatch({
      status: 'in_progress',
      scheduledAt: '2024-01-15T14:00:00Z',
    });
    expect(getMatchDisplayStatus(match)).toBe('live');
  });
});

// ============================================================================
// ARENA_TABS Tests
// ============================================================================

describe('ARENA_TABS', () => {
  it('should have exactly 3 tabs', () => {
    expect(ARENA_TABS).toHaveLength(3);
  });

  it('should have bracket tab first', () => {
    expect(ARENA_TABS[0].id).toBe('bracket');
    expect(ARENA_TABS[0].label).toBe('Bracket');
    expect(ARENA_TABS[0].icon).toBe('GitBranch');
  });

  it('should have matches tab second', () => {
    expect(ARENA_TABS[1].id).toBe('matches');
    expect(ARENA_TABS[1].label).toBe('Matchs');
    expect(ARENA_TABS[1].icon).toBe('Swords');
  });

  it('should have standings tab third', () => {
    expect(ARENA_TABS[2].id).toBe('standings');
    expect(ARENA_TABS[2].label).toBe('Classement');
    expect(ARENA_TABS[2].icon).toBe('Trophy');
  });

  it('should have unique ids', () => {
    const ids = ARENA_TABS.map(tab => tab.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

// ============================================================================
// Bracket Navigation State Tests (Unit tests for logic)
// ============================================================================

describe('Bracket Navigation Logic', () => {
  describe('boundary detection', () => {
    it('should correctly identify first round (canGoPrev = false)', () => {
      const currentIndex = 0;
      const totalRounds = 4;
      const canGoPrev = currentIndex > 0;
      expect(canGoPrev).toBe(false);
    });

    it('should correctly identify last round (canGoNext = false)', () => {
      const currentIndex = 3;
      const totalRounds = 4;
      const canGoNext = currentIndex < totalRounds - 1;
      expect(canGoNext).toBe(false);
    });

    it('should allow navigation in middle rounds', () => {
      const currentIndex = 2;
      const totalRounds = 4;
      const canGoPrev = currentIndex > 0;
      const canGoNext = currentIndex < totalRounds - 1;
      expect(canGoPrev).toBe(true);
      expect(canGoNext).toBe(true);
    });
  });

  describe('direction calculation', () => {
    it('should set direction to 1 when going forward', () => {
      const currentIndex = 1;
      const targetIndex = 2;
      const direction = targetIndex > currentIndex ? 1 : -1;
      expect(direction).toBe(1);
    });

    it('should set direction to -1 when going backward', () => {
      const currentIndex = 2;
      const targetIndex = 1;
      const direction = targetIndex > currentIndex ? 1 : -1;
      expect(direction).toBe(-1);
    });
  });

  describe('auto-navigate to incomplete round', () => {
    const createRoundWithMatches = (
      id: string,
      matchStatuses: Array<{ completed: boolean }>
    ): Round => ({
      id,
      matches: matchStatuses.map((s, i) => ({
        id: `${id}-match-${i}`,
        player1Id: 'p1',
        player2Id: 'p2',
        status: s.completed ? 'completed' : 'pending',
        result: s.completed ? { winnerId: 'p1', player1Score: 2, player2Score: 0 } : undefined,
        roundId: id,
      })),
      roundNumber: 1,
    });

    it('should find first incomplete round', () => {
      const rounds = [
        createRoundWithMatches('r1', [{ completed: true }, { completed: true }]),
        createRoundWithMatches('r2', [{ completed: true }, { completed: false }]),
        createRoundWithMatches('r3', [{ completed: false }]),
      ];

      const firstIncompleteIndex = rounds.findIndex((r) =>
        r.matches.some((m) => m.status !== 'completed' && !m.result?.winnerId)
      );

      expect(firstIncompleteIndex).toBe(1);
    });

    it('should return 0 if all rounds are incomplete', () => {
      const rounds = [
        createRoundWithMatches('r1', [{ completed: false }]),
        createRoundWithMatches('r2', [{ completed: false }]),
      ];

      const firstIncompleteIndex = rounds.findIndex((r) =>
        r.matches.some((m) => m.status !== 'completed' && !m.result?.winnerId)
      );

      expect(firstIncompleteIndex).toBe(0);
    });

    it('should return -1 if all rounds are complete', () => {
      const rounds = [
        createRoundWithMatches('r1', [{ completed: true }]),
        createRoundWithMatches('r2', [{ completed: true }]),
      ];

      const firstIncompleteIndex = rounds.findIndex((r) =>
        r.matches.some((m) => m.status !== 'completed' && !m.result?.winnerId)
      );

      expect(firstIncompleteIndex).toBe(-1);
    });
  });
});

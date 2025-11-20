/**
 * Tests for Bracket Generation Service
 * Testing all tournament format algorithms
 */

import { describe, it, expect } from 'vitest'
import {
  generateSingleEliminationBracket,
  generateDoubleEliminationBracket,
  generateRoundRobinBracket,
  generateSwissBracket,
  calculateNextPowerOfTwo,
  distributeByesOptimally
} from '../services/tournament/bracketGenerationService'

describe('Bracket Generation Utilities', () => {
  describe('calculateNextPowerOfTwo', () => {
    it('should return next power of 2', () => {
      expect(calculateNextPowerOfTwo(5)).toBe(8)
      expect(calculateNextPowerOfTwo(8)).toBe(8)
      expect(calculateNextPowerOfTwo(9)).toBe(16)
      expect(calculateNextPowerOfTwo(1)).toBe(2)
    })
  })

  describe('distributeByesOptimally', () => {
    it('should distribute byes evenly', () => {
      const players = [
        { id: '1', name: 'Player 1', seed: 1 },
        { id: '2', name: 'Player 2', seed: 2 },
        { id: '3', name: 'Player 3', seed: 3 },
        { id: '4', name: 'Player 4', seed: 4 },
        { id: '5', name: 'Player 5', seed: 5 }
      ]

      const result = distributeByesOptimally(players, 8)

      expect(result).toHaveLength(8)
      expect(result.filter(p => p.isBye)).toHaveLength(3)
      expect(result[0].isBye).toBe(false) // Top seed shouldn't get bye
    })
  })
})

describe('Single Elimination Bracket', () => {
  it('should generate bracket for power of 2 players', () => {
    const players = [
      { id: '1', name: 'Player 1', seed: 1 },
      { id: '2', name: 'Player 2', seed: 2 },
      { id: '3', name: 'Player 3', seed: 3 },
      { id: '4', name: 'Player 4', seed: 4 }
    ]

    const bracket = generateSingleEliminationBracket(players)

    expect(bracket.rounds).toHaveLength(2) // Semi-finals + Finals
    expect(bracket.rounds[0].matches).toHaveLength(2) // 2 semi-final matches
    expect(bracket.rounds[1].matches).toHaveLength(1) // 1 final match
    expect(bracket.totalMatches).toBe(3)
  })

  it('should handle non-power-of-2 with byes', () => {
    const players = [
      { id: '1', name: 'Player 1', seed: 1 },
      { id: '2', name: 'Player 2', seed: 2 },
      { id: '3', name: 'Player 3', seed: 3 }
    ]

    const bracket = generateSingleEliminationBracket(players)

    expect(bracket.rounds).toHaveLength(2)
    expect(bracket.rounds[0].matches).toHaveLength(2)

    // Check that one match has a bye
    const byeMatches = bracket.rounds[0].matches.filter(
      m => m.player1_id === 'BYE' || m.player2_id === 'BYE'
    )
    expect(byeMatches).toHaveLength(1)
  })

  it('should create proper match feeding structure', () => {
    const players = [
      { id: '1', name: 'Player 1', seed: 1 },
      { id: '2', name: 'Player 2', seed: 2 },
      { id: '3', name: 'Player 3', seed: 3 },
      { id: '4', name: 'Player 4', seed: 4 }
    ]

    const bracket = generateSingleEliminationBracket(players)

    // Both semi-finals should feed to the final
    expect(bracket.rounds[0].matches[0].feeds_to_match_id).toBe(bracket.rounds[1].matches[0].match_id)
    expect(bracket.rounds[0].matches[1].feeds_to_match_id).toBe(bracket.rounds[1].matches[0].match_id)
  })
})

describe('Double Elimination Bracket', () => {
  it('should generate winner and loser brackets', () => {
    const players = [
      { id: '1', name: 'Player 1', seed: 1 },
      { id: '2', name: 'Player 2', seed: 2 },
      { id: '3', name: 'Player 3', seed: 3 },
      { id: '4', name: 'Player 4', seed: 4 }
    ]

    const bracket = generateDoubleEliminationBracket(players)

    // Winner bracket rounds
    const winnerRounds = bracket.rounds.filter(r => r.bracket_type === 'winner')
    expect(winnerRounds.length).toBeGreaterThan(0)

    // Loser bracket rounds
    const loserRounds = bracket.rounds.filter(r => r.bracket_type === 'loser')
    expect(loserRounds.length).toBeGreaterThan(0)

    // Grand final
    const grandFinalRounds = bracket.rounds.filter(r => r.bracket_type === 'grand_final')
    expect(grandFinalRounds).toHaveLength(1)
  })

  it('should create loser bracket feeding from winner bracket', () => {
    const players = [
      { id: '1', name: 'Player 1', seed: 1 },
      { id: '2', name: 'Player 2', seed: 2 },
      { id: '3', name: 'Player 3', seed: 3 },
      { id: '4', name: 'Player 4', seed: 4 }
    ]

    const bracket = generateDoubleEliminationBracket(players)

    // Winner bracket matches should have feeds_to_loser_match_id
    const winnerMatches = bracket.rounds
      .filter(r => r.bracket_type === 'winner')
      .flatMap(r => r.matches)

    const matchesWithLoserFeeding = winnerMatches.filter(
      m => m.feeds_to_loser_match_id !== null
    )

    expect(matchesWithLoserFeeding.length).toBeGreaterThan(0)
  })

  it('should have correct total match count', () => {
    const players = [
      { id: '1', name: 'Player 1', seed: 1 },
      { id: '2', name: 'Player 2', seed: 2 },
      { id: '3', name: 'Player 3', seed: 3 },
      { id: '4', name: 'Player 4', seed: 4 }
    ]

    const bracket = generateDoubleEliminationBracket(players)

    // For 4 players: 3 in winner, 2 in loser, 1 grand final = 6 total (without reset)
    expect(bracket.totalMatches).toBeGreaterThanOrEqual(6)
  })
})

describe('Round Robin Bracket', () => {
  it('should generate correct number of rounds', () => {
    const players = [
      { id: '1', name: 'Player 1', seed: 1 },
      { id: '2', name: 'Player 2', seed: 2 },
      { id: '3', name: 'Player 3', seed: 3 },
      { id: '4', name: 'Player 4', seed: 4 }
    ]

    const bracket = generateRoundRobinBracket(players)

    // n players = n-1 rounds
    expect(bracket.rounds).toHaveLength(3)
  })

  it('should ensure each player plays everyone once', () => {
    const players = [
      { id: '1', name: 'Player 1', seed: 1 },
      { id: '2', name: 'Player 2', seed: 2 },
      { id: '3', name: 'Player 3', seed: 3 },
      { id: '4', name: 'Player 4', seed: 4 }
    ]

    const bracket = generateRoundRobinBracket(players)

    // Total matches = n * (n-1) / 2 = 4 * 3 / 2 = 6
    expect(bracket.totalMatches).toBe(6)

    // Collect all matchups
    const matchups = new Set()
    bracket.rounds.forEach(round => {
      round.matches.forEach(match => {
        const key = [match.player1_id, match.player2_id].sort().join('-')
        matchups.add(key)
      })
    })

    // Each pair should appear exactly once
    expect(matchups.size).toBe(6)
  })

  it('should distribute matches evenly across rounds', () => {
    const players = Array.from({ length: 6 }, (_, i) => ({
      id: String(i + 1),
      name: `Player ${i + 1}`,
      seed: i + 1
    }))

    const bracket = generateRoundRobinBracket(players)

    // Each round should have n/2 matches (3 for 6 players)
    bracket.rounds.forEach(round => {
      expect(round.matches).toHaveLength(3)
    })
  })

  it('should handle odd number of players with byes', () => {
    const players = [
      { id: '1', name: 'Player 1', seed: 1 },
      { id: '2', name: 'Player 2', seed: 2 },
      { id: '3', name: 'Player 3', seed: 3 }
    ]

    const bracket = generateRoundRobinBracket(players)

    // Each round should have at least one bye
    bracket.rounds.forEach(round => {
      const byeMatches = round.matches.filter(
        m => m.player1_id === 'BYE' || m.player2_id === 'BYE'
      )
      expect(byeMatches.length).toBeGreaterThanOrEqual(1)
    })
  })
})

describe('Swiss Bracket', () => {
  it('should generate correct number of matches per round', () => {
    const players = [
      { id: '1', name: 'Player 1', seed: 1 },
      { id: '2', name: 'Player 2', seed: 2 },
      { id: '3', name: 'Player 3', seed: 3 },
      { id: '4', name: 'Player 4', seed: 4 }
    ]

    const bracket = generateSwissBracket(players, 3)

    // Each round should have n/2 matches
    expect(bracket.rounds).toHaveLength(3)
    bracket.rounds.forEach(round => {
      expect(round.matches).toHaveLength(2)
    })
  })

  it('should pair top vs bottom in first round', () => {
    const players = [
      { id: '1', name: 'Player 1', seed: 1 },
      { id: '2', name: 'Player 2', seed: 2 },
      { id: '3', name: 'Player 3', seed: 3 },
      { id: '4', name: 'Player 4', seed: 4 }
    ]

    const bracket = generateSwissBracket(players, 1)

    // First round: 1 vs 3, 2 vs 4 (top half vs bottom half)
    const firstRound = bracket.rounds[0]
    const match1 = firstRound.matches[0]
    const match2 = firstRound.matches[1]

    // Verify pairing strategy
    expect([match1.player1_id, match1.player2_id].sort()).toEqual(['1', '3'])
    expect([match2.player1_id, match2.player2_id].sort()).toEqual(['2', '4'])
  })

  it('should handle odd number of players with bye', () => {
    const players = [
      { id: '1', name: 'Player 1', seed: 1 },
      { id: '2', name: 'Player 2', seed: 2 },
      { id: '3', name: 'Player 3', seed: 3 }
    ]

    const bracket = generateSwissBracket(players, 2)

    // Each round should have 1 match + 1 bye
    bracket.rounds.forEach(round => {
      const actualMatches = round.matches.filter(
        m => m.player1_id !== 'BYE' && m.player2_id !== 'BYE'
      )
      const byeMatches = round.matches.filter(
        m => m.player1_id === 'BYE' || m.player2_id === 'BYE'
      )

      expect(actualMatches).toHaveLength(1)
      expect(byeMatches).toHaveLength(1)
    })
  })

  it('should calculate recommended rounds correctly', () => {
    const players8 = Array.from({ length: 8 }, (_, i) => ({
      id: String(i + 1),
      name: `Player ${i + 1}`,
      seed: i + 1
    }))

    // For 8 players, recommended rounds = log2(8) = 3
    const bracket = generateSwissBracket(players8, null) // Auto-calculate

    expect(bracket.rounds.length).toBe(3)
  })
})

describe('Edge Cases', () => {
  it('should handle minimum players (2)', () => {
    const players = [
      { id: '1', name: 'Player 1', seed: 1 },
      { id: '2', name: 'Player 2', seed: 2 }
    ]

    const singleElim = generateSingleEliminationBracket(players)
    expect(singleElim.rounds).toHaveLength(1)
    expect(singleElim.totalMatches).toBe(1)

    const doubleElim = generateDoubleEliminationBracket(players)
    expect(doubleElim.totalMatches).toBeGreaterThanOrEqual(1)

    const roundRobin = generateRoundRobinBracket(players)
    expect(roundRobin.totalMatches).toBe(1)
  })

  it('should handle large tournament (32 players)', () => {
    const players = Array.from({ length: 32 }, (_, i) => ({
      id: String(i + 1),
      name: `Player ${i + 1}`,
      seed: i + 1
    }))

    const bracket = generateSingleEliminationBracket(players)

    // 32 players = 5 rounds (16, 8, 4, 2, 1)
    expect(bracket.rounds).toHaveLength(5)
    expect(bracket.totalMatches).toBe(31) // n-1 matches
  })

  it('should assign unique match IDs', () => {
    const players = Array.from({ length: 8 }, (_, i) => ({
      id: String(i + 1),
      name: `Player ${i + 1}`,
      seed: i + 1
    }))

    const bracket = generateSingleEliminationBracket(players)

    const matchIds = new Set()
    bracket.rounds.forEach(round => {
      round.matches.forEach(match => {
        expect(matchIds.has(match.match_id)).toBe(false)
        matchIds.add(match.match_id)
      })
    })
  })
})

/**
 * Tests for Match Service
 * Testing score parsing and validation
 */

import { describe, it, expect } from 'vitest'
import {
  parseScoreString,
  formatScoreString,
  validateScore,
  calculateMatchDuration
} from '../services/tournament/matchService'

describe('Score String Parsing', () => {
  describe('parseScoreString', () => {
    it('should parse simple tennis scores', () => {
      const result = parseScoreString('6-4 7-5')

      expect(result.sets).toHaveLength(2)
      expect(result.sets[0]).toEqual({ player1: 6, player2: 4 })
      expect(result.sets[1]).toEqual({ player1: 7, player2: 5 })
      expect(result.tiebreaks).toEqual([])
    })

    it('should parse scores with tiebreaks', () => {
      const result = parseScoreString('6-4 7-6(5) 6-3')

      expect(result.sets).toHaveLength(3)
      expect(result.sets[1]).toEqual({ player1: 7, player2: 6 })
      expect(result.tiebreaks).toHaveLength(1)
      expect(result.tiebreaks[0]).toEqual({
        setNumber: 2,
        player1: 7,
        player2: 5
      })
    })

    it('should handle match tiebreak format', () => {
      const result = parseScoreString('6-4 3-6 [10-8]')

      expect(result.sets).toHaveLength(2)
      expect(result.matchTiebreak).toEqual({ player1: 10, player2: 8 })
    })

    it('should parse retired matches', () => {
      const result = parseScoreString('6-3 2-1 ret.')

      expect(result.sets).toHaveLength(2)
      expect(result.retired).toBe(true)
    })

    it('should handle walkover', () => {
      const result = parseScoreString('W.O.')

      expect(result.walkover).toBe(true)
      expect(result.sets).toHaveLength(0)
    })

    it('should handle empty or invalid input', () => {
      expect(parseScoreString('')).toEqual({ sets: [], tiebreaks: [] })
      expect(parseScoreString(null)).toEqual({ sets: [], tiebreaks: [] })
      expect(parseScoreString('invalid')).toEqual({ sets: [], tiebreaks: [] })
    })

    it('should parse mixed formats', () => {
      const result = parseScoreString('7-6(4) 6-7(2) [10-5]')

      expect(result.sets).toHaveLength(2)
      expect(result.tiebreaks).toHaveLength(2)
      expect(result.matchTiebreak).toEqual({ player1: 10, player2: 5 })
    })
  })

  describe('formatScoreString', () => {
    it('should format simple scores', () => {
      const scoreData = {
        sets: [
          { player1: 6, player2: 4 },
          { player1: 7, player2: 5 }
        ],
        tiebreaks: []
      }

      expect(formatScoreString(scoreData)).toBe('6-4 7-5')
    })

    it('should format scores with tiebreaks', () => {
      const scoreData = {
        sets: [
          { player1: 6, player2: 4 },
          { player1: 7, player2: 6 }
        ],
        tiebreaks: [{ setNumber: 2, player1: 7, player2: 5 }]
      }

      expect(formatScoreString(scoreData)).toBe('6-4 7-6(5)')
    })

    it('should format match tiebreak', () => {
      const scoreData = {
        sets: [
          { player1: 6, player2: 4 },
          { player1: 3, player2: 6 }
        ],
        tiebreaks: [],
        matchTiebreak: { player1: 10, player2: 8 }
      }

      expect(formatScoreString(scoreData)).toBe('6-4 3-6 [10-8]')
    })

    it('should handle retired', () => {
      const scoreData = {
        sets: [
          { player1: 6, player2: 3 },
          { player1: 2, player2: 1 }
        ],
        tiebreaks: [],
        retired: true
      }

      expect(formatScoreString(scoreData)).toBe('6-3 2-1 ret.')
    })

    it('should handle walkover', () => {
      const scoreData = {
        sets: [],
        tiebreaks: [],
        walkover: true
      }

      expect(formatScoreString(scoreData)).toBe('W.O.')
    })
  })
})

describe('Score Validation', () => {
  describe('validateScore', () => {
    it('should validate correct tennis scores', () => {
      const valid = {
        sets: [
          { player1: 6, player2: 4 },
          { player1: 6, player2: 3 }
        ],
        tiebreaks: []
      }

      expect(validateScore(valid)).toBe(true)
    })

    it('should reject sets without 2-game margin', () => {
      const invalid = {
        sets: [{ player1: 6, player2: 5 }],
        tiebreaks: []
      }

      expect(validateScore(invalid)).toBe(false)
    })

    it('should allow 7-5 scores', () => {
      const valid = {
        sets: [{ player1: 7, player2: 5 }],
        tiebreaks: []
      }

      expect(validateScore(valid)).toBe(true)
    })

    it('should validate tiebreak sets', () => {
      const valid = {
        sets: [{ player1: 7, player2: 6 }],
        tiebreaks: [{ setNumber: 1, player1: 7, player2: 5 }]
      }

      expect(validateScore(valid)).toBe(true)
    })

    it('should reject 7-6 without tiebreak', () => {
      const invalid = {
        sets: [{ player1: 7, player2: 6 }],
        tiebreaks: []
      }

      expect(validateScore(invalid)).toBe(false)
    })

    it('should validate match tiebreaks', () => {
      const valid = {
        sets: [
          { player1: 6, player2: 4 },
          { player1: 3, player2: 6 }
        ],
        tiebreaks: [],
        matchTiebreak: { player1: 10, player2: 8 }
      }

      expect(validateScore(valid)).toBe(true)
    })

    it('should reject invalid match tiebreak scores', () => {
      const invalid = {
        sets: [],
        tiebreaks: [],
        matchTiebreak: { player1: 10, player2: 9 }
      }

      // Must have 2-point margin and minimum 10 points
      expect(validateScore(invalid)).toBe(false)
    })

    it('should reject impossible scores', () => {
      const invalid1 = {
        sets: [{ player1: 8, player2: 3 }],
        tiebreaks: []
      }

      const invalid2 = {
        sets: [{ player1: 6, player2: -1 }],
        tiebreaks: []
      }

      expect(validateScore(invalid1)).toBe(false)
      expect(validateScore(invalid2)).toBe(false)
    })

    it('should accept walkover and retired', () => {
      expect(validateScore({ sets: [], walkover: true })).toBe(true)
      expect(validateScore({ sets: [{ player1: 6, player2: 3 }], retired: true })).toBe(true)
    })

    it('should validate best-of-3 completion', () => {
      const complete = {
        sets: [
          { player1: 6, player2: 4 },
          { player1: 6, player2: 3 }
        ],
        tiebreaks: []
      }

      expect(validateScore(complete, 'best_of_3')).toBe(true)
    })

    it('should validate best-of-5 completion', () => {
      const complete = {
        sets: [
          { player1: 6, player2: 4 },
          { player1: 3, player2: 6 },
          { player1: 6, player2: 2 }
        ],
        tiebreaks: []
      }

      expect(validateScore(complete, 'best_of_5')).toBe(true)
    })
  })
})

describe('Match Duration Calculation', () => {
  it('should calculate duration from timestamps', () => {
    const startTime = new Date('2025-01-01T10:00:00Z')
    const endTime = new Date('2025-01-01T12:30:00Z')

    const duration = calculateMatchDuration(startTime, endTime)

    expect(duration).toBe(150) // 150 minutes
  })

  it('should handle same start and end time', () => {
    const time = new Date('2025-01-01T10:00:00Z')

    expect(calculateMatchDuration(time, time)).toBe(0)
  })

  it('should return null for missing times', () => {
    expect(calculateMatchDuration(null, new Date())).toBe(null)
    expect(calculateMatchDuration(new Date(), null)).toBe(null)
  })

  it('should handle string timestamps', () => {
    const duration = calculateMatchDuration(
      '2025-01-01T10:00:00Z',
      '2025-01-01T11:45:00Z'
    )

    expect(duration).toBe(105) // 1h 45min
  })
})

describe('Score Parsing Edge Cases', () => {
  it('should handle extra whitespace', () => {
    const result = parseScoreString('  6-4   7-6(5)  ')

    expect(result.sets).toHaveLength(2)
    expect(result.tiebreaks).toHaveLength(1)
  })

  it('should handle different separators', () => {
    const result1 = parseScoreString('6-4, 7-5')
    const result2 = parseScoreString('6-4; 7-5')

    expect(result1.sets).toHaveLength(2)
    expect(result2.sets).toHaveLength(2)
  })

  it('should parse partial scores', () => {
    const result = parseScoreString('6-4 3-2')

    expect(result.sets).toHaveLength(2)
    expect(result.sets[1]).toEqual({ player1: 3, player2: 2 })
  })

  it('should handle super tiebreak notation variations', () => {
    const result1 = parseScoreString('[10-8]')
    const result2 = parseScoreString('(10-8)')

    expect(result1.matchTiebreak).toEqual({ player1: 10, player2: 8 })
    expect(result2.matchTiebreak).toEqual({ player1: 10, player2: 8 })
  })
})

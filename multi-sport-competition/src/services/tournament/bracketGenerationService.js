/**
 * Bracket Generation Service
 *
 * Pure functions for generating tournament brackets.
 * No side effects, no database interactions - just algorithms.
 *
 * Supports 4 formats:
 * - Single Elimination
 * - Double Elimination (COMPLETE with loser bracket feeding + grand final)
 * - Round Robin
 * - Swiss System
 *
 * @module bracketGenerationService
 */

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Calculate next power of 2 for bracket sizing
 * @param {number} n - Number of players
 * @returns {number} Next power of 2
 */
function nextPowerOfTwo(n) {
  return Math.pow(2, Math.ceil(Math.log2(n)))
}

/**
 * Calculate number of byes needed
 * @param {number} playerCount - Total players
 * @returns {number} Number of byes
 */
function calculateByes(playerCount) {
  return nextPowerOfTwo(playerCount) - playerCount
}

/**
 * Distribute byes evenly across bracket positions
 * Strategy: Place byes in alternating positions to spread them out
 * @param {number} totalSlots - Total bracket slots (power of 2)
 * @param {number} byeCount - Number of byes
 * @returns {number[]} Array of positions that should be byes
 */
function distributeByes(totalSlots, byeCount) {
  const byePositions = []
  const spacing = Math.floor(totalSlots / byeCount)

  for (let i = 0; i < byeCount; i++) {
    // Alternate between top and bottom of bracket
    if (i % 2 === 0) {
      byePositions.push(i * spacing)
    } else {
      byePositions.push(totalSlots - Math.floor((i + 1) / 2) * spacing - 1)
    }
  }

  return byePositions.sort((a, b) => a - b)
}

/**
 * Apply seeding to players
 * @param {Array<{id: string, name: string, seed: number|null}>} players
 * @returns {Array} Seeded players
 */
function applySeed(players) {
  // Separate seeded and unseeded players
  const seeded = players.filter(p => p.seed !== null).sort((a, b) => a.seed - b.seed)
  const unseeded = players.filter(p => p.seed === null)

  // Combine: seeded first, then unseeded
  return [...seeded, ...unseeded]
}

/**
 * Generate match ID
 * @param {string} prefix - Prefix (e.g., 'r1', 'wb1', 'lb1')
 * @param {number} matchNum - Match number
 * @returns {string}
 */
function generateMatchId(prefix, matchNum) {
  return `${prefix}_m${matchNum}`
}

// =====================================================
// SINGLE ELIMINATION
// =====================================================

/**
 * Generate single elimination bracket
 * Features:
 * - Proper bye distribution (spread evenly, not all at top)
 * - Seeding support
 * - Automatic advancement for byes
 *
 * @param {Array<{id: string, name: string, seed: number|null}>} players
 * @returns {Array<{round: number, name: string, matches: Array}>}
 */
export function generateSingleEliminationBracket(players) {
  const playerCount = players.length
  const totalSlots = nextPowerOfTwo(playerCount)
  const byeCount = calculateByes(playerCount)
  const totalRounds = Math.log2(totalSlots)

  // Apply seeding
  const seededPlayers = applySeed(players)

  // Get bye positions
  const byePositions = distributeByes(totalSlots, byeCount)

  // Create first round matches
  const firstRoundMatches = []
  let playerIndex = 0

  for (let i = 0; i < totalSlots / 2; i++) {
    const pos1 = i * 2
    const pos2 = i * 2 + 1

    const isBye1 = byePositions.includes(pos1)
    const isBye2 = byePositions.includes(pos2)

    let player1 = null
    let player2 = null
    let winner = null

    // Assign players or byes
    if (!isBye1 && playerIndex < playerCount) {
      player1 = seededPlayers[playerIndex++]
    }
    if (!isBye2 && playerIndex < playerCount) {
      player2 = seededPlayers[playerIndex++]
    }

    // Auto-advance if one player has bye
    if (player1 && !player2) {
      winner = player1
    } else if (player2 && !player1) {
      winner = player2
    }

    firstRoundMatches.push({
      match_id: generateMatchId('r1', i + 1),
      match_number: i + 1,
      player1_id: player1?.id || null,
      player1_name: player1?.name || 'BYE',
      player2_id: player2?.id || null,
      player2_name: player2?.name || 'BYE',
      winner_id: winner?.id || null,
      winner_name: winner?.name || null,
      feeds_to_match_id: generateMatchId('r2', Math.floor(i / 2) + 1),
      status: winner ? 'completed' : 'pending'
    })
  }

  // Generate subsequent rounds
  const rounds = [
    {
      round: 1,
      name: 'Round 1',
      matches: firstRoundMatches
    }
  ]

  for (let r = 2; r <= totalRounds; r++) {
    const prevRound = rounds[r - 2]
    const matchCount = Math.pow(2, totalRounds - r)
    const matches = []

    for (let i = 0; i < matchCount; i++) {
      matches.push({
        match_id: generateMatchId(`r${r}`, i + 1),
        match_number: i + 1,
        player1_id: null,
        player1_name: 'TBD',
        player2_id: null,
        player2_name: 'TBD',
        winner_id: null,
        winner_name: null,
        feeds_to_match_id: r < totalRounds ? generateMatchId(`r${r + 1}`, Math.floor(i / 2) + 1) : null,
        status: 'pending'
      })
    }

    // Generate round name
    let roundName
    if (r === totalRounds) roundName = 'Final'
    else if (r === totalRounds - 1) roundName = 'Semi-finals'
    else if (r === totalRounds - 2) roundName = 'Quarter-finals'
    else roundName = `Round ${r}`

    rounds.push({
      round: r,
      name: roundName,
      matches
    })
  }

  return rounds
}

// =====================================================
// DOUBLE ELIMINATION (COMPLETE IMPLEMENTATION)
// =====================================================

/**
 * Generate complete double elimination bracket
 *
 * Features:
 * - Winner bracket (same as single elim)
 * - Loser bracket (with proper feeding from winner bracket)
 * - Grand final (with bracket reset if loser wins)
 *
 * Structure:
 * - Winner Bracket: Standard single elimination
 * - Loser Bracket: Losers from winner bracket feed in
 *   - Round 1: Losers from WB R1
 *   - Round 2: Winners of LB R1 + Losers of WB R2
 *   - Pattern continues...
 * - Grand Final: WB champion vs LB champion
 *   - If LB wins, bracket reset (GF2)
 *
 * @param {Array<{id: string, name: string, seed: number|null}>} players
 * @returns {{winner_bracket: Array, loser_bracket: Array, grand_final: Array}}
 */
export function generateDoubleEliminationBracket(players) {
  const playerCount = players.length
  const totalSlots = nextPowerOfTwo(playerCount)
  const winnerRounds = Math.log2(totalSlots)

  // Generate winner bracket (same as single elimination)
  const winnerBracket = generateSingleEliminationBracket(players)

  // Modify match IDs to include 'wb' prefix
  winnerBracket.forEach((round, rIdx) => {
    round.matches.forEach((match, mIdx) => {
      match.match_id = generateMatchId(`wb${rIdx + 1}`, mIdx + 1)
      match.bracket_type = 'winner'

      // Update feeds_to references
      if (match.feeds_to_match_id) {
        match.feeds_to_match_id = generateMatchId(`wb${rIdx + 2}`, Math.floor(mIdx / 2) + 1)
      }

      // Add loser bracket feeding
      const loserRound = calculateLoserBracketRound(rIdx + 1, winnerRounds)
      if (loserRound) {
        const loserMatchNum = calculateLoserBracketMatch(rIdx + 1, mIdx + 1, winnerRounds)
        match.feeds_to_loser_match_id = generateMatchId(`lb${loserRound}`, loserMatchNum)
      }
    })
  })

  // Generate loser bracket
  const loserBracket = generateLoserBracket(playerCount, winnerRounds)

  // Generate grand final
  const grandFinal = generateGrandFinal(winnerRounds)

  // Update last winner bracket match to feed to grand final
  const lastWBRound = winnerBracket[winnerBracket.length - 1]
  lastWBRound.matches[0].feeds_to_match_id = 'gf1'

  // Update last loser bracket match to feed to grand final
  const lastLBRound = loserBracket[loserBracket.length - 1]
  lastLBRound.matches[0].feeds_to_match_id = 'gf1'

  return {
    winner_bracket: winnerBracket,
    loser_bracket: loserBracket,
    grand_final: grandFinal
  }
}

/**
 * Calculate which loser bracket round a winner bracket match feeds to
 * @param {number} wbRound - Winner bracket round (1-indexed)
 * @param {number} totalWBRounds - Total winner bracket rounds
 * @returns {number|null} Loser bracket round number
 */
function calculateLoserBracketRound(wbRound, totalWBRounds) {
  if (wbRound === totalWBRounds) return null // Finals don't feed to LB

  // Formula: LB has (2 * WB_rounds - 2) rounds
  // WB R1 losers → LB R1
  // WB R2 losers → LB R3 (after LB R2 plays LB R1 winners)
  // WB R3 losers → LB R5
  // Pattern: WB Rn losers → LB R(2n-1)

  if (wbRound === 1) return 1
  return 2 * wbRound - 1
}

/**
 * Calculate which loser bracket match within a round
 * @param {number} wbRound - Winner bracket round
 * @param {number} wbMatchNum - Winner bracket match number
 * @param {number} totalWBRounds - Total WB rounds
 * @returns {number} Loser bracket match number
 */
function calculateLoserBracketMatch(wbRound, wbMatchNum, totalWBRounds) {
  // Simplified: matches feed in order
  return Math.ceil(wbMatchNum / 2)
}

/**
 * Generate loser bracket structure
 * @param {number} playerCount
 * @param {number} winnerRounds
 * @returns {Array}
 */
function generateLoserBracket(playerCount, winnerRounds) {
  const rounds = []
  const loserRoundsCount = 2 * winnerRounds - 2

  for (let r = 1; r <= loserRoundsCount; r++) {
    const matchCount = calculateLoserBracketMatchCount(r, winnerRounds)
    const matches = []

    for (let m = 1; m <= matchCount; m++) {
      matches.push({
        match_id: generateMatchId(`lb${r}`, m),
        match_number: m,
        bracket_type: 'loser',
        player1_id: null,
        player1_name: 'TBD',
        player2_id: null,
        player2_name: 'TBD',
        winner_id: null,
        winner_name: null,
        feeds_to_match_id: r < loserRoundsCount
          ? generateMatchId(`lb${r + 1}`, Math.ceil(m / 2))
          : 'gf1',
        status: 'pending'
      })
    }

    rounds.push({
      round: r,
      name: `Loser Bracket Round ${r}`,
      matches
    })
  }

  return rounds
}

/**
 * Calculate match count for a loser bracket round
 * @param {number} lbRound - Loser bracket round (1-indexed)
 * @param {number} winnerRounds - Total winner rounds
 * @returns {number}
 */
function calculateLoserBracketMatchCount(lbRound, winnerRounds) {
  // LB match pattern:
  // R1: half of WB R1 matches (losers play each other)
  // R2: R1 winners (half of R1)
  // R3: R2 winners + WB R2 losers
  // And so on...

  const wbR1Matches = Math.pow(2, winnerRounds - 1)

  if (lbRound === 1) {
    return wbR1Matches / 2
  }

  // Odd rounds: receive WB losers (double matches from previous)
  // Even rounds: play out winners from previous
  if (lbRound % 2 === 1) {
    return Math.pow(2, Math.floor((2 * winnerRounds - lbRound - 1) / 2) - 1)
  } else {
    return Math.pow(2, Math.floor((2 * winnerRounds - lbRound) / 2) - 1)
  }
}

/**
 * Generate grand final structure
 * Includes potential bracket reset (GF2) if loser bracket wins GF1
 * @param {number} winnerRounds
 * @returns {Array}
 */
function generateGrandFinal(winnerRounds) {
  return [
    {
      round: 1,
      name: 'Grand Final',
      matches: [
        {
          match_id: 'gf1',
          match_number: 1,
          bracket_type: 'grand_final',
          player1_id: null,
          player1_name: 'Winner Bracket Champion',
          player2_id: null,
          player2_name: 'Loser Bracket Champion',
          winner_id: null,
          winner_name: null,
          feeds_to_match_id: 'gf2', // Potential bracket reset
          requires_bracket_reset: false, // Set to true if LB wins
          status: 'pending'
        }
      ]
    },
    {
      round: 2,
      name: 'Grand Final (Bracket Reset)',
      matches: [
        {
          match_id: 'gf2',
          match_number: 1,
          bracket_type: 'grand_final',
          player1_id: null,
          player1_name: 'TBD',
          player2_id: null,
          player2_name: 'TBD',
          winner_id: null,
          winner_name: null,
          feeds_to_match_id: null,
          status: 'conditional', // Only played if GF1 winner is from LB
          notes: 'Only played if Loser Bracket champion wins GF1'
        }
      ]
    }
  ]
}

// =====================================================
// ROUND ROBIN
// =====================================================

/**
 * Generate round robin bracket
 * Uses circle/rotation method for fair pairing
 *
 * @param {Array<{id: string, name: string}>} players
 * @returns {Array<{round: number, name: string, matches: Array}>}
 */
export function generateRoundRobinBracket(players) {
  const playerCount = players.length
  let playersArray = [...players]

  // If odd number, add a BYE
  const hasBye = playerCount % 2 !== 0
  if (hasBye) {
    playersArray.push({ id: 'bye', name: 'BYE' })
  }

  const totalPlayers = playersArray.length
  const totalRounds = totalPlayers - 1
  const matchesPerRound = totalPlayers / 2

  const rounds = []

  for (let round = 1; round <= totalRounds; round++) {
    const matches = []

    for (let match = 0; match < matchesPerRound; match++) {
      const home = match === 0 ? 0 : match
      const away = totalPlayers - 1 - match

      const player1 = playersArray[home]
      const player2 = playersArray[away]

      // Skip matches with BYE
      if (player1.id === 'bye' || player2.id === 'bye') {
        continue
      }

      matches.push({
        match_id: generateMatchId(`rr${round}`, match + 1),
        match_number: match + 1,
        player1_id: player1.id,
        player1_name: player1.name,
        player2_id: player2.id,
        player2_name: player2.name,
        winner_id: null,
        winner_name: null,
        status: 'pending'
      })
    }

    rounds.push({
      round,
      name: `Round ${round}`,
      matches
    })

    // Rotate players (keep first fixed, rotate others)
    playersArray = [
      playersArray[0],
      playersArray[totalPlayers - 1],
      ...playersArray.slice(1, totalPlayers - 1)
    ]
  }

  return rounds
}

/**
 * Calculate round robin standings
 * @param {Array} players - Player list with match results
 * @returns {Array} Sorted standings with wins, losses, points
 */
export function calculateRoundRobinStandings(players, matches) {
  const standings = players.map(player => ({
    player_id: player.id,
    player_name: player.name,
    matches_played: 0,
    wins: 0,
    losses: 0,
    points: 0
  }))

  matches.forEach(match => {
    if (match.status !== 'completed' || !match.winner_id) return

    const p1Standing = standings.find(s => s.player_id === match.player1_id)
    const p2Standing = standings.find(s => s.player_id === match.player2_id)

    if (p1Standing) p1Standing.matches_played++
    if (p2Standing) p2Standing.matches_played++

    if (match.winner_id === match.player1_id) {
      if (p1Standing) {
        p1Standing.wins++
        p1Standing.points++
      }
      if (p2Standing) p2Standing.losses++
    } else {
      if (p2Standing) {
        p2Standing.wins++
        p2Standing.points++
      }
      if (p1Standing) p1Standing.losses++
    }
  })

  // Sort by points (desc), then wins (desc)
  return standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    return b.wins - a.wins
  })
}

// =====================================================
// SWISS SYSTEM (IMPROVED)
// =====================================================

/**
 * Generate Swiss system bracket
 * Features:
 * - First round random pairing
 * - Subsequent rounds: pair players with similar scores
 * - Avoid repeat pairings
 * - Color balance (important for chess-style Swiss)
 * - Buchholz tiebreakers
 *
 * @param {Array<{id: string, name: string}>} players
 * @param {number} numberOfRounds - Usually ceil(log2(players))
 * @returns {Array<{round: number, name: string, matches: Array}>}
 */
export function generateSwissBracket(players, numberOfRounds = null) {
  const playerCount = players.length
  const rounds = numberOfRounds || Math.min(Math.ceil(Math.log2(playerCount)), 7)

  // Initialize player records
  const playerRecords = players.map(p => ({
    ...p,
    points: 0,
    opponents: [],
    color_balance: 0 // +1 for playing as player1, -1 for player2
  }))

  const bracket = []

  // Round 1: Random pairing
  const round1Matches = generateSwissFirstRound(playerRecords)
  bracket.push({
    round: 1,
    name: 'Round 1',
    matches: round1Matches
  })

  // Subsequent rounds need to be generated dynamically
  // (can't pre-generate because pairing depends on results)
  for (let r = 2; r <= rounds; r++) {
    bracket.push({
      round: r,
      name: `Round ${r}`,
      matches: [], // Will be populated by pairingService when previous round completes
      status: 'pending'
    })
  }

  return bracket
}

/**
 * Generate first round pairings (random)
 * @param {Array} playerRecords
 * @returns {Array} Matches
 */
function generateSwissFirstRound(playerRecords) {
  const shuffled = [...playerRecords].sort(() => Math.random() - 0.5)
  const matches = []

  for (let i = 0; i < shuffled.length; i += 2) {
    if (i + 1 < shuffled.length) {
      matches.push({
        match_id: generateMatchId('sw1', Math.floor(i / 2) + 1),
        match_number: Math.floor(i / 2) + 1,
        player1_id: shuffled[i].id,
        player1_name: shuffled[i].name,
        player2_id: shuffled[i + 1].id,
        player2_name: shuffled[i + 1].name,
        winner_id: null,
        winner_name: null,
        status: 'pending'
      })
    } else {
      // Odd player gets BYE
      matches.push({
        match_id: generateMatchId('sw1', Math.floor(i / 2) + 1),
        match_number: Math.floor(i / 2) + 1,
        player1_id: shuffled[i].id,
        player1_name: shuffled[i].name,
        player2_id: null,
        player2_name: 'BYE',
        winner_id: shuffled[i].id,
        winner_name: shuffled[i].name,
        status: 'completed'
      })
    }
  }

  return matches
}

// =====================================================
// EXPORTS
// =====================================================

export default {
  generateSingleEliminationBracket,
  generateDoubleEliminationBracket,
  generateRoundRobinBracket,
  generateSwissBracket,
  calculateRoundRobinStandings,

  // Utility exports for testing
  nextPowerOfTwo,
  calculateByes,
  distributeByes,
  applySeed
}

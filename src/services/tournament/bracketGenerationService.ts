/**
 * Bracket Generation Service
 *
 * Pure functions for generating tournament brackets.
 * No side effects, no database interactions - just algorithms.
 */

export interface BracketPlayer {
  id: string;
  name: string;
  seed?: number | null;
}

export interface BracketMatch {
  match_id: string;
  match_number: number;
  round_number?: number;
  player1_id: string | null;
  player1_name: string | null;
  player2_id: string | null;
  player2_name: string | null;
  winner_id: string | null;
  winner_name: string | null;
  feeds_to_match_id: string | null;
  feeds_to_loser_match_id?: string | null;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'conditional';
  bracket_type?: 'winner' | 'loser' | 'grand_final';
  notes?: string;
}

export interface BracketRound {
  round: number;
  name: string;
  matches: BracketMatch[];
  bracket_type?: 'winner' | 'loser' | 'grand_final';
}

export interface DoubleEliminationBracket {
  winner_bracket: BracketRound[];
  loser_bracket: BracketRound[];
  grand_final: BracketRound[];
  totalMatches?: number;
}

export interface SingleEliminationBracket {
  rounds: BracketRound[];
  totalMatches?: number;
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

export function nextPowerOfTwo(n: number): number {
  if (n === 0) return 0;
  if (n === 1) return 2; // Minimum bracket size is 2
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

export function calculateByes(playerCount: number): number {
  return nextPowerOfTwo(playerCount) - playerCount;
}

export function distributeByes(totalSlots: number, byeCount: number): number[] {
  const byePositions: number[] = [];
  const spacing = Math.floor(totalSlots / byeCount);

  for (let i = 0; i < byeCount; i++) {
    if (i % 2 === 0) {
      byePositions.push(i * spacing);
    } else {
      byePositions.push(totalSlots - Math.floor((i + 1) / 2) * spacing - 1);
    }
  }

  return byePositions.sort((a, b) => a - b);
}

export function applySeed(players: BracketPlayer[]): BracketPlayer[] {
  const seeded = players.filter(p => p.seed !== null && p.seed !== undefined).sort((a, b) => (a.seed || 0) - (b.seed || 0));
  const unseeded = players.filter(p => p.seed === null || p.seed === undefined);
  return [...seeded, ...unseeded];
}

function generateMatchId(prefix: string, matchNum: number): string {
  return `${prefix}_m${matchNum}`;
}

// =====================================================
// SINGLE ELIMINATION
// =====================================================

export function generateSingleEliminationBracket(players: BracketPlayer[]): SingleEliminationBracket {
  const playerCount = players.length;
  const totalSlots = nextPowerOfTwo(playerCount);
  const byeCount = calculateByes(playerCount);
  const totalRounds = Math.log2(totalSlots);

  const seededPlayers = applySeed(players);
  const byePositions = distributeByes(totalSlots, byeCount);

  const firstRoundMatches: BracketMatch[] = [];
  let playerIndex = 0;

  for (let i = 0; i < totalSlots / 2; i++) {
    const pos1 = i * 2;
    const pos2 = i * 2 + 1;

    const isBye1 = byePositions.includes(pos1);
    const isBye2 = byePositions.includes(pos2);

    let player1: BracketPlayer | null = null;
    let player2: BracketPlayer | null = null;
    let winner: BracketPlayer | null = null;

    if (!isBye1 && playerIndex < playerCount) {
      player1 = seededPlayers[playerIndex++];
    }
    if (!isBye2 && playerIndex < playerCount) {
      player2 = seededPlayers[playerIndex++];
    }

    if (player1 && !player2) {
      winner = player1;
    } else if (player2 && !player1) {
      winner = player2;
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
    });
  }

  const rounds: BracketRound[] = [
    {
      round: 1,
      name: 'Round 1',
      matches: firstRoundMatches
    }
  ];

  let totalMatches = firstRoundMatches.length;

  for (let r = 2; r <= totalRounds; r++) {
    const matchCount = Math.pow(2, totalRounds - r);
    const matches: BracketMatch[] = [];

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
      });
    }
    totalMatches += matches.length;

    let roundName;
    if (r === totalRounds) roundName = 'Final';
    else if (r === totalRounds - 1) roundName = 'Semi-finals';
    else if (r === totalRounds - 2) roundName = 'Quarter-finals';
    else roundName = `Round ${r}`;

    rounds.push({
      round: r,
      name: roundName,
      matches
    });
  }

  return { rounds, totalMatches };
}

// =====================================================
// DOUBLE ELIMINATION
// =====================================================

export function generateDoubleEliminationBracket(players: BracketPlayer[]): DoubleEliminationBracket {
  const playerCount = players.length;
  const totalSlots = nextPowerOfTwo(playerCount);
  const winnerRounds = Math.log2(totalSlots);

  const winnerBracket = generateSingleEliminationBracket(players).rounds;
  let totalMatches = 0;

  winnerBracket.forEach((round, rIdx) => {
    round.matches.forEach((match, mIdx) => {
      match.match_id = generateMatchId(`wb${rIdx + 1}`, mIdx + 1);
      match.bracket_type = 'winner';
      totalMatches++;

      if (match.feeds_to_match_id) {
        match.feeds_to_match_id = generateMatchId(`wb${rIdx + 2}`, Math.floor(mIdx / 2) + 1);
      }

      const loserRound = calculateLoserBracketRound(rIdx + 1, winnerRounds);
      if (loserRound) {
        const loserMatchNum = calculateLoserBracketMatch(rIdx + 1, mIdx + 1);
        match.feeds_to_loser_match_id = generateMatchId(`lb${loserRound}`, loserMatchNum);
      }
    });
  });

  const loserBracket = generateLoserBracket(playerCount, winnerRounds);
  loserBracket.forEach(r => totalMatches += r.matches.length);

  const grandFinal = generateGrandFinal();
  grandFinal.forEach(r => totalMatches += r.matches.length);

  const lastWBRound = winnerBracket[winnerBracket.length - 1];
  lastWBRound.matches[0].feeds_to_match_id = 'gf1';

  const lastLBRound = loserBracket[loserBracket.length - 1];
  lastLBRound.matches[0].feeds_to_match_id = 'gf1';

  return {
    winner_bracket: winnerBracket,
    loser_bracket: loserBracket,
    grand_final: grandFinal,
    totalMatches
  };
}

function calculateLoserBracketRound(wbRound: number, totalWBRounds: number): number | null {
  if (wbRound === totalWBRounds) return null;
  if (wbRound === 1) return 1;
  return 2 * wbRound - 1;
}

function calculateLoserBracketMatch(_wbRound: number, wbMatchNum: number): number {
  return Math.ceil(wbMatchNum / 2);
}

function generateLoserBracket(_playerCount: number, winnerRounds: number): BracketRound[] {
  const rounds: BracketRound[] = [];
  const loserRoundsCount = 2 * winnerRounds - 2;

  for (let r = 1; r <= loserRoundsCount; r++) {
    const matchCount = calculateLoserBracketMatchCount(r, winnerRounds);
    const matches: BracketMatch[] = [];

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
      });
    }

    rounds.push({
      round: r,
      name: `Loser Bracket Round ${r}`,
      matches,
      bracket_type: 'loser'
    });
  }

  return rounds;
}

function calculateLoserBracketMatchCount(lbRound: number, winnerRounds: number): number {
  const wbR1Matches = Math.pow(2, winnerRounds - 1);

  if (lbRound === 1) {
    return wbR1Matches / 2;
  }

  if (lbRound % 2 === 1) {
    return Math.pow(2, Math.floor((2 * winnerRounds - lbRound - 1) / 2) - 1);
  } else {
    return Math.pow(2, Math.floor((2 * winnerRounds - lbRound) / 2) - 1);
  }
}

function generateGrandFinal(): BracketRound[] {
  return [
    {
      round: 1,
      name: 'Grand Final',
      bracket_type: 'grand_final',
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
          feeds_to_match_id: 'gf2',
          status: 'pending'
        }
      ]
    },
    {
      round: 2,
      name: 'Grand Final (Bracket Reset)',
      bracket_type: 'grand_final',
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
          status: 'conditional',
          notes: 'Only played if Loser Bracket champion wins GF1'
        }
      ]
    }
  ];
}

// =====================================================
// ROUND ROBIN
// =====================================================

export function generateRoundRobinBracket(players: BracketPlayer[]): SingleEliminationBracket {
  const playerCount = players.length;
  let playersArray: (BracketPlayer | { id: string; name: string })[] = [...players];

  const hasBye = playerCount % 2 !== 0;
  if (hasBye) {
    playersArray.push({ id: 'bye', name: 'BYE' });
  }

  const totalPlayers = playersArray.length;
  const totalRounds = totalPlayers - 1;
  const matchesPerRound = totalPlayers / 2;

  const rounds: BracketRound[] = [];
  let totalMatches = 0;

  for (let round = 1; round <= totalRounds; round++) {
    const matches: BracketMatch[] = [];

    for (let match = 0; match < matchesPerRound; match++) {
      const home = match === 0 ? 0 : match;
      const away = totalPlayers - 1 - match;

      const player1 = playersArray[home];
      const player2 = playersArray[away];

      if (player1.id === 'bye' || player2.id === 'bye') {
        continue;
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
        feeds_to_match_id: null,
        status: 'pending'
      });
    }
    totalMatches += matches.length;

    rounds.push({
      round,
      name: `Round ${round}`,
      matches
    });

    playersArray = [
      playersArray[0],
      playersArray[totalPlayers - 1],
      ...playersArray.slice(1, totalPlayers - 1)
    ];
  }

  return { rounds, totalMatches };
}

export interface Standing {
  player_id: string;
  player_name: string;
  matches_played: number;
  wins: number;
  losses: number;
  points: number;
}

export function calculateRoundRobinStandings(players: BracketPlayer[], matches: BracketMatch[]): Standing[] {
  const standings: Standing[] = players.map(player => ({
    player_id: player.id,
    player_name: player.name,
    matches_played: 0,
    wins: 0,
    losses: 0,
    points: 0
  }));

  matches.forEach(match => {
    if (match.status !== 'completed' || !match.winner_id) return;

    const p1Standing = standings.find(s => s.player_id === match.player1_id);
    const p2Standing = standings.find(s => s.player_id === match.player2_id);

    if (p1Standing) p1Standing.matches_played++;
    if (p2Standing) p2Standing.matches_played++;

    if (match.winner_id === match.player1_id) {
      if (p1Standing) {
        p1Standing.wins++;
        p1Standing.points++;
      }
      if (p2Standing) p2Standing.losses++;
    } else {
      if (p2Standing) {
        p2Standing.wins++;
        p2Standing.points++;
      }
      if (p1Standing) p1Standing.losses++;
    }
  });

  return standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.wins - a.wins;
  });
}

// =====================================================
// SWISS SYSTEM
// =====================================================

export function generateSwissBracket(players: BracketPlayer[], numberOfRounds: number | null = null): SingleEliminationBracket {
  const playerCount = players.length;
  const roundsCount = numberOfRounds || Math.min(Math.ceil(Math.log2(playerCount)), 7);

  const playerRecords = players.map(p => ({
    ...p,
    points: 0,
    opponents: [],
    color_balance: 0
  }));

  const bracket: BracketRound[] = [];

  const round1Matches = generateSwissFirstRound(playerRecords);
  bracket.push({
    round: 1,
    name: 'Round 1',
    matches: round1Matches
  });

  for (let r = 2; r <= roundsCount; r++) {
    bracket.push({
      round: r,
      name: `Round ${r}`,
      matches: [],
      bracket_type: 'winner' // Reusing type for simplicity
    });
  }

  return { rounds: bracket };
}

function generateSwissFirstRound(playerRecords: any[]): BracketMatch[] {
  const shuffled = [...playerRecords].sort(() => Math.random() - 0.5);
  const matches: BracketMatch[] = [];

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
        feeds_to_match_id: null,
        status: 'pending'
      });
    } else {
      matches.push({
        match_id: generateMatchId('sw1', Math.floor(i / 2) + 1),
        match_number: Math.floor(i / 2) + 1,
        player1_id: shuffled[i].id,
        player1_name: shuffled[i].name,
        player2_id: null,
        player2_name: 'BYE',
        winner_id: shuffled[i].id,
        winner_name: shuffled[i].name,
        feeds_to_match_id: null,
        status: 'completed'
      });
    }
  }

  return matches;
}

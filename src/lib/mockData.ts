import type { Tournament, Player } from '@/types/tournament';

import { RANKINGS } from '@/config/rankings';

// Deterministic UUID generator for consistent mock data
// Uses a simple hash-based approach to generate valid UUIDs from seed strings
function generateDeterministicUUID(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  // Convert hash to hex and pad to create UUID-like structure
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const hex2 = Math.abs(hash * 31).toString(16).padStart(4, '0');
  const hex3 = Math.abs(hash * 37).toString(16).padStart(4, '0');
  const hex4 = Math.abs(hash * 41).toString(16).padStart(4, '0');
  const hex5 = Math.abs(hash * 43).toString(16).padStart(12, '0');

  return `${hex.slice(0, 8)}-${hex2.slice(0, 4)}-4${hex3.slice(1, 4)}-a${hex4.slice(1, 4)}-${hex5.slice(0, 12)}`;
}

// Pre-generated UUIDs for mock data consistency
const MOCK_IDS = {
  // Tournaments
  t1: generateDeterministicUUID('tournament-roland-garros'),
  t2: generateDeterministicUUID('tournament-wimbledon'),
  t3: generateDeterministicUUID('tournament-us-open'),
  t4: generateDeterministicUUID('tournament-australian-open'),
  // Players (p1-p8 used in tournaments)
  p1: generateDeterministicUUID('player-1'),
  p2: generateDeterministicUUID('player-2'),
  p3: generateDeterministicUUID('player-3'),
  p4: generateDeterministicUUID('player-4'),
  p5: generateDeterministicUUID('player-5'),
  p6: generateDeterministicUUID('player-6'),
  p7: generateDeterministicUUID('player-7'),
  p8: generateDeterministicUUID('player-8'),
  // Rounds
  r1: generateDeterministicUUID('round-1'),
  r2: generateDeterministicUUID('round-2'),
  r3: generateDeterministicUUID('round-3'),
  rr1: generateDeterministicUUID('round-robin-1'),
  rr2: generateDeterministicUUID('round-robin-2'),
  rr3: generateDeterministicUUID('round-robin-3'),
  fr1: generateDeterministicUUID('football-round-1'),
  fr2: generateDeterministicUUID('football-round-2'),
  sw1: generateDeterministicUUID('swiss-round-1'),
  sw2: generateDeterministicUUID('swiss-round-2'),
  // Matches
  m1: generateDeterministicUUID('match-1'),
  m2: generateDeterministicUUID('match-2'),
  m3: generateDeterministicUUID('match-3'),
  m4: generateDeterministicUUID('match-4'),
  sm1: generateDeterministicUUID('semi-match-1'),
  sm2: generateDeterministicUUID('semi-match-2'),
  final: generateDeterministicUUID('final-match'),
  rm1: generateDeterministicUUID('rr-match-1'),
  rm2: generateDeterministicUUID('rr-match-2'),
  rm3: generateDeterministicUUID('rr-match-3'),
  rm4: generateDeterministicUUID('rr-match-4'),
  rm5: generateDeterministicUUID('rr-match-5'),
  rm6: generateDeterministicUUID('rr-match-6'),
  fm1: generateDeterministicUUID('fr-match-1'),
  fm2: generateDeterministicUUID('fr-match-2'),
  fm3: generateDeterministicUUID('fr-match-3'),
  fm4: generateDeterministicUUID('fr-match-4'),
  fm5: generateDeterministicUUID('fr-match-5'),
  fm6: generateDeterministicUUID('fr-match-6'),
  swm1: generateDeterministicUUID('swiss-match-1'),
  swm2: generateDeterministicUUID('swiss-match-2'),
  swm3: generateDeterministicUUID('swiss-match-3'),
  swm4: generateDeterministicUUID('swiss-match-4'),
  swm5: generateDeterministicUUID('swiss-match-5'),
  swm6: generateDeterministicUUID('swiss-match-6'),
  swm7: generateDeterministicUUID('swiss-match-7'),
  swm8: generateDeterministicUUID('swiss-match-8'),
};

const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth',
  'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen',
  'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra',
  'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Lucas', 'Emma', 'Nathan', 'Olivia', 'Leo', 'Ava', 'Gabriel', 'Isabella', 'Louis', 'Sophia',
  'Arthur', 'Mia', 'Jules', 'Charlotte', 'Raphael', 'Amelia', 'Maël', 'Harper', 'Liam', 'Evelyn'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Dubois', 'Laurent', 'Lefebvre', 'Michel', 'Moreau', 'Simon', 'Leroy', 'Roux', 'David', 'Bertrand',
  'Petit', 'Garnier', 'Legrand', 'Muller', 'Guerin', 'Fontaine', 'Chevalier', 'Francois', 'Clement', 'Morin'
];

// Deterministic random generator for consistent mock data
let seed = 123;
function random() {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function generateMockPlayers(count: number): Player[] {
  const players: Player[] = [
    { id: MOCK_IDS.p1, name: 'Alex Rivera', avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${MOCK_IDS.p1}&backgroundColor=b6e3f4`, email: 'alex@example.com', age: 19, ranking: '15/1' },
    { id: MOCK_IDS.p2, name: 'Sarah Chen', avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${MOCK_IDS.p2}&backgroundColor=c0aede`, email: 'sarah@example.com', age: 17, ranking: '15/3' },
    { id: MOCK_IDS.p3, name: 'Mike Johnson', avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${MOCK_IDS.p3}&backgroundColor=d1d4f9`, email: 'mike@example.com', age: 14, ranking: '30/1' },
    { id: MOCK_IDS.p4, name: 'Emma Wilson', avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${MOCK_IDS.p4}&backgroundColor=ffdfbf`, email: 'emma@example.com', age: 13, ranking: '30/3' },
    { id: MOCK_IDS.p5, name: 'David Kim', avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${MOCK_IDS.p5}&backgroundColor=ffd5dc`, email: 'david@example.com', age: 12, ranking: '30/5' },
    { id: MOCK_IDS.p6, name: 'Lisa Park', avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${MOCK_IDS.p6}&backgroundColor=c0aede`, email: 'lisa@example.com', age: 11, ranking: '40' },
    { id: MOCK_IDS.p7, name: 'James Bond', avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${MOCK_IDS.p7}&backgroundColor=b6e3f4`, email: 'james@example.com', age: 25, ranking: 'NC' },
    { id: MOCK_IDS.p8, name: 'Diana Prince', avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${MOCK_IDS.p8}&backgroundColor=ffdfbf`, email: 'diana@example.com', age: 28, ranking: 'NC' },
  ];

  for (let i = players.length; i < count; i++) {
    const firstName = FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(random() * LAST_NAMES.length)];
    const name = `${firstName} ${lastName}`;

    // Age distribution: mostly 18-40, some younger, some older
    let age;
    const r = random();
    if (r < 0.1) age = Math.floor(10 + random() * 8); // 10-17 (Juniors)
    else if (r < 0.7) age = Math.floor(18 + random() * 23); // 18-40 (Adults)
    else age = Math.floor(41 + random() * 20); // 41-60 (Seniors)

    // Ranking distribution
    // Weighted towards lower rankings (NC, 4th series)
    let rankingIndex;
    const rRank = random();
    if (rRank < 0.3) rankingIndex = 0; // 30% NC
    else if (rRank < 0.6) rankingIndex = Math.floor(1 + random() * 6); // 30% 4th Series (40 to 30/1)
    else if (rRank < 0.85) rankingIndex = Math.floor(7 + random() * 6); // 25% 3rd Series (30 to 15/1)
    else if (rRank < 0.98) rankingIndex = Math.floor(13 + random() * 11); // 13% 2nd Series (15 to -30)
    else rankingIndex = 24; // 2% Promotion

    const ranking = RANKINGS[rankingIndex];

    // Random background color from the list
    const bgColors = ['b6e3f4', 'c0aede', 'd1d4f9'];
    const bg = bgColors[Math.floor(random() * bgColors.length)];

    // Generate UUID for additional players
    const playerId = generateDeterministicUUID(`player-${i + 1}`);

    players.push({
      id: playerId,
      name,
      // Use ID as seed for guaranteed uniqueness and v9 API
      avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(playerId)}&backgroundColor=${bg}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      age,
      ranking
    });
  }

  return players;
}

export const MOCK_PLAYERS: Player[] = generateMockPlayers(200);

export const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: MOCK_IDS.t1,
    name: 'Roland Garros 2025',
    sport: 'tennis',
    format: 'single_elimination',
    status: 'active',
    players: MOCK_PLAYERS.slice(0, 8),
    rounds: [
      {
        id: MOCK_IDS.r1,
        name: 'Quarter Finals',
        matches: [
          { id: MOCK_IDS.m1, roundId: MOCK_IDS.r1, player1Id: MOCK_IDS.p1, player2Id: MOCK_IDS.p8, status: 'completed', result: { player1Score: 3, player2Score: 0, winnerId: MOCK_IDS.p1 }, nextMatchId: MOCK_IDS.sm1 },
          { id: MOCK_IDS.m2, roundId: MOCK_IDS.r1, player1Id: MOCK_IDS.p4, player2Id: MOCK_IDS.p5, status: 'completed', result: { player1Score: 2, player2Score: 3, winnerId: MOCK_IDS.p5 }, nextMatchId: MOCK_IDS.sm1 },
          { id: MOCK_IDS.m3, roundId: MOCK_IDS.r1, player1Id: MOCK_IDS.p3, player2Id: MOCK_IDS.p6, status: 'pending', result: undefined, nextMatchId: MOCK_IDS.sm2 },
          { id: MOCK_IDS.m4, roundId: MOCK_IDS.r1, player1Id: MOCK_IDS.p2, player2Id: MOCK_IDS.p7, status: 'pending', result: undefined, nextMatchId: MOCK_IDS.sm2 },
        ]
      },
      {
        id: MOCK_IDS.r2,
        name: 'Semi Finals',
        matches: [
          { id: MOCK_IDS.sm1, roundId: MOCK_IDS.r2, player1Id: MOCK_IDS.p1, player2Id: MOCK_IDS.p5, status: 'pending', result: undefined, nextMatchId: MOCK_IDS.final },
          { id: MOCK_IDS.sm2, roundId: MOCK_IDS.r2, player1Id: undefined, player2Id: undefined, status: 'pending', result: undefined, nextMatchId: MOCK_IDS.final },
        ]
      },
      {
        id: MOCK_IDS.r3,
        name: 'Final',
        matches: [
          { id: MOCK_IDS.final, roundId: MOCK_IDS.r3, player1Id: undefined, player2Id: undefined, status: 'pending', result: undefined }
        ]
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    settings: { pointsForWin: 3, pointsForDraw: 1, pointsForLoss: 0 }
  },
  {
    id: MOCK_IDS.t2,
    name: 'Wimbledon 2025',
    sport: 'tennis',
    format: 'round_robin',
    status: 'completed',
    players: MOCK_PLAYERS.slice(0, 4),
    rounds: [
      {
        id: MOCK_IDS.rr1,
        name: 'Round 1',
        matches: [
          { id: MOCK_IDS.rm1, roundId: MOCK_IDS.rr1, player1Id: MOCK_IDS.p1, player2Id: MOCK_IDS.p2, status: 'completed', result: { player1Score: 11, player2Score: 9, winnerId: MOCK_IDS.p1 } },
          { id: MOCK_IDS.rm2, roundId: MOCK_IDS.rr1, player1Id: MOCK_IDS.p3, player2Id: MOCK_IDS.p4, status: 'completed', result: { player1Score: 5, player2Score: 11, winnerId: MOCK_IDS.p4 } }
        ]
      },
      {
        id: MOCK_IDS.rr2,
        name: 'Round 2',
        matches: [
          { id: MOCK_IDS.rm3, roundId: MOCK_IDS.rr2, player1Id: MOCK_IDS.p1, player2Id: MOCK_IDS.p3, status: 'completed', result: { player1Score: 11, player2Score: 7, winnerId: MOCK_IDS.p1 } },
          { id: MOCK_IDS.rm4, roundId: MOCK_IDS.rr2, player1Id: MOCK_IDS.p2, player2Id: MOCK_IDS.p4, status: 'completed', result: { player1Score: 12, player2Score: 10, winnerId: MOCK_IDS.p2 } }
        ]
      },
      {
        id: MOCK_IDS.rr3,
        name: 'Round 3',
        matches: [
          { id: MOCK_IDS.rm5, roundId: MOCK_IDS.rr3, player1Id: MOCK_IDS.p1, player2Id: MOCK_IDS.p4, status: 'completed', result: { player1Score: 8, player2Score: 11, winnerId: MOCK_IDS.p4 } },
          { id: MOCK_IDS.rm6, roundId: MOCK_IDS.rr3, player1Id: MOCK_IDS.p2, player2Id: MOCK_IDS.p3, status: 'completed', result: { player1Score: 11, player2Score: 4, winnerId: MOCK_IDS.p2 } }
        ]
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    settings: { pointsForWin: 3, pointsForDraw: 1, pointsForLoss: 0 }
  },
  {
    id: MOCK_IDS.t3,
    name: 'US Open 2025',
    sport: 'tennis',
    format: 'round_robin',
    status: 'active',
    players: MOCK_PLAYERS.slice(0, 6),
    rounds: [
      {
        id: MOCK_IDS.fr1,
        name: 'Week 1',
        matches: [
          { id: MOCK_IDS.fm1, roundId: MOCK_IDS.fr1, player1Id: MOCK_IDS.p1, player2Id: MOCK_IDS.p2, status: 'completed', result: { player1Score: 3, player2Score: 1, winnerId: MOCK_IDS.p1 } },
          { id: MOCK_IDS.fm2, roundId: MOCK_IDS.fr1, player1Id: MOCK_IDS.p3, player2Id: MOCK_IDS.p4, status: 'completed', result: { player1Score: 2, player2Score: 2, winnerId: undefined } },
          { id: MOCK_IDS.fm3, roundId: MOCK_IDS.fr1, player1Id: MOCK_IDS.p5, player2Id: MOCK_IDS.p6, status: 'active', result: undefined }
        ]
      },
      {
        id: MOCK_IDS.fr2,
        name: 'Week 2',
        matches: [
          { id: MOCK_IDS.fm4, roundId: MOCK_IDS.fr2, player1Id: MOCK_IDS.p1, player2Id: MOCK_IDS.p3, status: 'scheduled', result: undefined },
          { id: MOCK_IDS.fm5, roundId: MOCK_IDS.fr2, player1Id: MOCK_IDS.p2, player2Id: MOCK_IDS.p5, status: 'scheduled', result: undefined },
          { id: MOCK_IDS.fm6, roundId: MOCK_IDS.fr2, player1Id: MOCK_IDS.p4, player2Id: MOCK_IDS.p6, status: 'scheduled', result: undefined }
        ]
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    settings: { pointsForWin: 3, pointsForDraw: 1, pointsForLoss: 0 }
  },
  {
    id: MOCK_IDS.t4,
    name: 'Australian Open 2025',
    sport: 'tennis',
    format: 'swiss',
    status: 'active',
    players: MOCK_PLAYERS.slice(0, 7),
    rounds: [
      {
        id: MOCK_IDS.sw1,
        name: 'Round 1',
        matches: [
          { id: MOCK_IDS.swm1, roundId: MOCK_IDS.sw1, player1Id: MOCK_IDS.p1, player2Id: MOCK_IDS.p2, status: 'completed', result: { player1Score: 1, player2Score: 0, winnerId: MOCK_IDS.p1 } },
          { id: MOCK_IDS.swm2, roundId: MOCK_IDS.sw1, player1Id: MOCK_IDS.p3, player2Id: MOCK_IDS.p4, status: 'completed', result: { player1Score: 0, player2Score: 1, winnerId: MOCK_IDS.p4 } },
          { id: MOCK_IDS.swm3, roundId: MOCK_IDS.sw1, player1Id: MOCK_IDS.p5, player2Id: MOCK_IDS.p6, status: 'completed', result: { player1Score: 1, player2Score: 0, winnerId: MOCK_IDS.p5 } },
          { id: MOCK_IDS.swm4, roundId: MOCK_IDS.sw1, player1Id: MOCK_IDS.p7, status: 'completed', result: { player1Score: 1, player2Score: 0, winnerId: MOCK_IDS.p7, isWalkover: true } }
        ]
      },
      {
        id: MOCK_IDS.sw2,
        name: 'Round 2',
        matches: [
          { id: MOCK_IDS.swm5, roundId: MOCK_IDS.sw2, player1Id: MOCK_IDS.p1, player2Id: MOCK_IDS.p7, status: 'completed', result: { player1Score: 0, player2Score: 1, winnerId: MOCK_IDS.p7 } },
          { id: MOCK_IDS.swm6, roundId: MOCK_IDS.sw2, player1Id: MOCK_IDS.p4, player2Id: MOCK_IDS.p5, status: 'completed', result: { player1Score: 1, player2Score: 0, winnerId: MOCK_IDS.p4 } },
          { id: MOCK_IDS.swm7, roundId: MOCK_IDS.sw2, player1Id: MOCK_IDS.p2, player2Id: MOCK_IDS.p3, status: 'pending', result: undefined },
          { id: MOCK_IDS.swm8, roundId: MOCK_IDS.sw2, player1Id: MOCK_IDS.p6, status: 'completed', result: { player1Score: 1, player2Score: 0, winnerId: MOCK_IDS.p6, isWalkover: true } }
        ]
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date().toISOString(),
    settings: { pointsForWin: 1, pointsForDraw: 0.5, pointsForLoss: 0 }
  }
];
export const ALL_MOCK_TOURNAMENTS = [...MOCK_TOURNAMENTS];

import type { Tournament, Player } from '@/types/tournament';
import { v4 as uuidv4 } from 'uuid';

import { RANKINGS } from '@/config/rankings';

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
    { id: 'p1', name: 'Alex Rivera', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=p1&backgroundColor=b6e3f4', email: 'alex@example.com', age: 19, ranking: '15/1' },
    { id: 'p2', name: 'Sarah Chen', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=p2&backgroundColor=c0aede', email: 'sarah@example.com', age: 17, ranking: '15/3' },
    { id: 'p3', name: 'Mike Johnson', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=p3&backgroundColor=d1d4f9', email: 'mike@example.com', age: 14, ranking: '30/1' },
    { id: 'p4', name: 'Emma Wilson', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=p4&backgroundColor=ffdfbf', email: 'emma@example.com', age: 13, ranking: '30/3' },
    { id: 'p5', name: 'David Kim', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=p5&backgroundColor=ffd5dc', email: 'david@example.com', age: 12, ranking: '30/5' },
    { id: 'p6', name: 'Lisa Park', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=p6&backgroundColor=c0aede', email: 'lisa@example.com', age: 11, ranking: '40' },
    { id: 'p7', name: 'James Bond', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=p7&backgroundColor=b6e3f4', email: 'james@example.com', age: 25, ranking: 'NC' },
    { id: 'p8', name: 'Diana Prince', avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=p8&backgroundColor=ffdfbf', email: 'diana@example.com', age: 28, ranking: 'NC' },
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

    players.push({
      id: `p${i + 1}`,
      name,
      // Use ID as seed for guaranteed uniqueness and v9 API
      avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(`p${i + 1}`)}&backgroundColor=${bg}`,
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
    id: 't1',
    name: 'Roland Garros 2025',
    sport: 'tennis',
    format: 'single_elimination',
    status: 'active',
    players: MOCK_PLAYERS.slice(0, 8),
    rounds: [
      {
        id: 'r1',
        name: 'Quarter Finals',
        matches: [
          { id: 'm1', roundId: 'r1', player1Id: 'p1', player2Id: 'p8', status: 'completed', result: { player1Score: 3, player2Score: 0, winnerId: 'p1' }, nextMatchId: 'sm1' },
          { id: 'm2', roundId: 'r1', player1Id: 'p4', player2Id: 'p5', status: 'completed', result: { player1Score: 2, player2Score: 3, winnerId: 'p5' }, nextMatchId: 'sm1' },
          { id: 'm3', roundId: 'r1', player1Id: 'p3', player2Id: 'p6', status: 'pending', result: undefined, nextMatchId: 'sm2' },
          { id: 'm4', roundId: 'r1', player1Id: 'p2', player2Id: 'p7', status: 'pending', result: undefined, nextMatchId: 'sm2' },
        ]
      },
      {
        id: 'r2',
        name: 'Semi Finals',
        matches: [
          { id: 'sm1', roundId: 'r2', player1Id: 'p1', player2Id: 'p5', status: 'pending', result: undefined, nextMatchId: 'final' },
          { id: 'sm2', roundId: 'r2', player1Id: undefined, player2Id: undefined, status: 'pending', result: undefined, nextMatchId: 'final' },
        ]
      },
      {
        id: 'r3',
        name: 'Final',
        matches: [
          { id: 'final', roundId: 'r3', player1Id: undefined, player2Id: undefined, status: 'pending', result: undefined }
        ]
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    settings: { pointsForWin: 3, pointsForDraw: 1, pointsForLoss: 0 }
  },
  {
    id: 't2',
    name: 'Wimbledon 2025',
    sport: 'tennis',
    format: 'round_robin',
    status: 'completed',
    players: MOCK_PLAYERS.slice(0, 4),
    rounds: [
      {
        id: 'rr1',
        name: 'Round 1',
        matches: [
          { id: 'rm1', roundId: 'rr1', player1Id: 'p1', player2Id: 'p2', status: 'completed', result: { player1Score: 11, player2Score: 9, winnerId: 'p1' } },
          { id: 'rm2', roundId: 'rr1', player1Id: 'p3', player2Id: 'p4', status: 'completed', result: { player1Score: 5, player2Score: 11, winnerId: 'p4' } }
        ]
      },
      {
        id: 'rr2',
        name: 'Round 2',
        matches: [
          { id: 'rm3', roundId: 'rr2', player1Id: 'p1', player2Id: 'p3', status: 'completed', result: { player1Score: 11, player2Score: 7, winnerId: 'p1' } },
          { id: 'rm4', roundId: 'rr2', player1Id: 'p2', player2Id: 'p4', status: 'completed', result: { player1Score: 12, player2Score: 10, winnerId: 'p2' } }
        ]
      },
      {
        id: 'rr3',
        name: 'Round 3',
        matches: [
          { id: 'rm5', roundId: 'rr3', player1Id: 'p1', player2Id: 'p4', status: 'completed', result: { player1Score: 8, player2Score: 11, winnerId: 'p4' } },
          { id: 'rm6', roundId: 'rr3', player1Id: 'p2', player2Id: 'p3', status: 'completed', result: { player1Score: 11, player2Score: 4, winnerId: 'p2' } }
        ]
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    settings: { pointsForWin: 3, pointsForDraw: 1, pointsForLoss: 0 }
  },
  {
    id: 't3',
    name: 'US Open 2025',
    sport: 'tennis',
    format: 'round_robin',
    status: 'active',
    players: MOCK_PLAYERS.slice(0, 6),
    rounds: [
      {
        id: 'fr1',
        name: 'Week 1',
        matches: [
          { id: 'fm1', roundId: 'fr1', player1Id: 'p1', player2Id: 'p2', status: 'completed', result: { player1Score: 3, player2Score: 1, winnerId: 'p1' } },
          { id: 'fm2', roundId: 'fr1', player1Id: 'p3', player2Id: 'p4', status: 'completed', result: { player1Score: 2, player2Score: 2, winnerId: undefined } },
          { id: 'fm3', roundId: 'fr1', player1Id: 'p5', player2Id: 'p6', status: 'active', result: undefined }
        ]
      },
      {
        id: 'fr2',
        name: 'Week 2',
        matches: [
          { id: 'fm4', roundId: 'fr2', player1Id: 'p1', player2Id: 'p3', status: 'scheduled', result: undefined },
          { id: 'fm5', roundId: 'fr2', player1Id: 'p2', player2Id: 'p5', status: 'scheduled', result: undefined },
          { id: 'fm6', roundId: 'fr2', player1Id: 'p4', player2Id: 'p6', status: 'scheduled', result: undefined }
        ]
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
    settings: { pointsForWin: 3, pointsForDraw: 1, pointsForLoss: 0 }
  },
  {
    id: 't4',
    name: 'Australian Open 2025',
    sport: 'tennis',
    format: 'swiss',
    status: 'active',
    players: MOCK_PLAYERS.slice(0, 7),
    rounds: [
      {
        id: 'sw1',
        name: 'Round 1',
        matches: [
          { id: 'swm1', roundId: 'sw1', player1Id: 'p1', player2Id: 'p2', status: 'completed', result: { player1Score: 1, player2Score: 0, winnerId: 'p1' } },
          { id: 'swm2', roundId: 'sw1', player1Id: 'p3', player2Id: 'p4', status: 'completed', result: { player1Score: 0, player2Score: 1, winnerId: 'p4' } },
          { id: 'swm3', roundId: 'sw1', player1Id: 'p5', player2Id: 'p6', status: 'completed', result: { player1Score: 1, player2Score: 0, winnerId: 'p5' } },
          { id: 'swm4', roundId: 'sw1', player1Id: 'p7', status: 'completed', result: { player1Score: 1, player2Score: 0, winnerId: 'p7', isWalkover: true } }
        ]
      },
      {
        id: 'sw2',
        name: 'Round 2',
        matches: [
          { id: 'swm5', roundId: 'sw2', player1Id: 'p1', player2Id: 'p7', status: 'completed', result: { player1Score: 0, player2Score: 1, winnerId: 'p7' } },
          { id: 'swm6', roundId: 'sw2', player1Id: 'p4', player2Id: 'p5', status: 'completed', result: { player1Score: 1, player2Score: 0, winnerId: 'p4' } },
          { id: 'swm7', roundId: 'sw2', player1Id: 'p2', player2Id: 'p3', status: 'pending', result: undefined },
          { id: 'swm8', roundId: 'sw2', player1Id: 'p6', status: 'completed', result: { player1Score: 1, player2Score: 0, winnerId: 'p6', isWalkover: true } }
        ]
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date().toISOString(),
    settings: { pointsForWin: 1, pointsForDraw: 0.5, pointsForLoss: 0 }
  }
];
export const ALL_MOCK_TOURNAMENTS = [...MOCK_TOURNAMENTS];

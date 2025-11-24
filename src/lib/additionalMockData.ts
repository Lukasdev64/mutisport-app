import type { Tournament, Player } from '@/types/tournament';

// Create additional players for variety (to avoid circular dependency)
const createMockPlayer = (id: string, name: string): Player => ({
  id,
  name,
  email: `${name.toLowerCase().replace(' ', '.')}@example.com`
});

const ADDITIONAL_PLAYERS: Player[] = [
  createMockPlayer('p9', 'James Wilson'),
  createMockPlayer('p10', 'Emma Davis'),
  createMockPlayer('p11', 'Oliver Taylor'),
  createMockPlayer('p12', 'Sophia Martinez')
];

// Additional mock tournaments for different sports
// Note: These use simple player arrays. They'll be merged with MOCK_PLAYERS in mockData.ts
export const ADDITIONAL_MOCK_TOURNAMENTS: Tournament[] = [
  // Tennis tournaments
  {
    id: 't6',
    name: 'Wimbledon 2025',
    sport: 'tennis',
    format: 'single_elimination',
    status: 'active',
    players: ADDITIONAL_PLAYERS,
    rounds: [
      {
        id: 'wim-r1',
        name: 'Quarter Finals',
        matches: [
          { id: 'wim-m1', roundId: 'wim-r1', player1Id: 'p9', player2Id: 'p12', status: 'pending', result: undefined, tournamentId: 't6' },
          { id: 'wim-m2', roundId: 'wim-r1', player1Id: 'p10', player2Id: 'p11', status: 'pending', result: undefined, tournamentId: 't6' },
          { id: 'wim-m3', roundId: 'wim-r1', player1Id: 'p9', player2Id: 'p10', status: 'pending', result: undefined, tournamentId: 't6' },
          { id: 'wim-m4', roundId: 'wim-r1', player1Id: 'p11', player2Id: 'p12', status: 'pending', result: undefined, tournamentId: 't6' },
        ]
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updatedAt: new Date().toISOString(),
    settings: { pointsForWin: 1, pointsForDraw: 0, pointsForLoss: 0 }
  },
  
  // Football tournaments
  {
    id: 't7',
    name: 'Champions League Mini',
    sport: 'football',
    format: 'single_elimination',
    status: 'completed',
    players: [
      createMockPlayer('pf1', 'Lucas Kane'),
      createMockPlayer('pf2', 'Marco Silva'),
      createMockPlayer('pf3', 'David Rossi'),
      createMockPlayer('pf4', 'Alex Morgan')
    ],
    rounds: [
      {
        id: 'cl-r1',
        name: 'Semi Finals',
        matches: [
          { id: 'cl-m1', roundId: 'cl-r1', player1Id: 'pf1', player2Id: 'pf4', status: 'completed', result: { player1Score: 2, player2Score: 1, winnerId: 'pf1' }, tournamentId: 't7' },
          { id: 'cl-m2', roundId: 'cl-r1', player1Id: 'pf2', player2Id: 'pf3', status: 'completed', result: { player1Score: 3, player2Score: 2, winnerId: 'pf2' }, tournamentId: 't7' },
        ]
      },
      {
        id: 'cl-r2',
        name: 'Final',
        matches: [
          { id: 'cl-final', roundId: 'cl-r2', player1Id: 'pf1', player2Id: 'pf2', status: 'completed', result: { player1Score: 1, player2Score: 0, winnerId: 'pf1' }, tournamentId: 't7' }
        ]
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    settings: { pointsForWin: 3, pointsForDraw: 1, pointsForLoss: 0 }
  },

  // Basketball tournaments
  {
    id: 't8',
    name: '3x3 Street Basketball',
    sport: 'basketball',
    format: 'round_robin',
    status: 'active',
    players: [
      createMockPlayer('pb1', 'Jordan Hayes'),
      createMockPlayer('pb2', 'Kobe Wilson'),
      createMockPlayer('pb3', 'LeBron Carter'),
      createMockPlayer('pb4', 'Curry Thompson'),
      createMockPlayer('pb5', 'Durant Smith'),
      createMockPlayer('pb6', 'Giannis Brown')
    ],
    rounds: [
      {
        id: 'bb-r1',
        name: 'Week 1',
        matches: [
          { id: 'bb-m1', roundId: 'bb-r1', player1Id: 'pb1', player2Id: 'pb2', status: 'completed', result: { player1Score: 21, player2Score: 15, winnerId: 'pb1' }, tournamentId: 't8' },
          { id: 'bb-m2', roundId: 'bb-r1', player1Id: 'pb3', player2Id: 'pb4', status: 'completed', result: { player1Score: 18, player2Score: 21, winnerId: 'pb4' }, tournamentId: 't8' },
          { id: 'bb-m3', roundId: 'bb-r1', player1Id: 'pb5', player2Id: 'pb6', status: 'pending', result: undefined, tournamentId: 't8' }
        ]
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    updatedAt: new Date().toISOString(),
    settings: { pointsForWin: 2, pointsForDraw: 0, pointsForLoss: 0 }
  },

  // Ping Pong tournament
  {
    id: 't9',
    name: 'Office Ping Pong Championship',
    sport: 'ping_pong',
    format: 'single_elimination',
    status: 'active',
    players: [
      createMockPlayer('pp1', 'Chen Wei'),
      createMockPlayer('pp2', 'Liu Yang'),
      createMockPlayer('pp3', 'Zhang Ming'),
      createMockPlayer('pp4', 'Wang Lei'),
      createMockPlayer('pp5', 'Li Na'),
      createMockPlayer('pp6', 'Zhou Jie'),
      createMockPlayer('pp7', 'Sun Yue'),
      createMockPlayer('pp8', 'Ma Long')
    ],
    rounds: [
      {
        id: 'pp-r1',
        name: 'Quarter Finals',
        matches: [
          { id: 'pp-m1', roundId: 'pp-r1', player1Id: 'pp1', player2Id: 'pp8', status: 'completed', result: { player1Score: 11, player2Score: 7, winnerId: 'pp1' }, tournamentId: 't9' },
          { id: 'pp-m2', roundId: 'pp-r1', player1Id: 'pp4', player2Id: 'pp5', status: 'pending', result: undefined, tournamentId: 't9' },
          { id: 'pp-m3', roundId: 'pp-r1', player1Id: 'pp3', player2Id: 'pp6', status: 'pending', result: undefined, tournamentId: 't9' },
          { id: 'pp-m4', roundId: 'pp-r1', player1Id: 'pp2', player2Id: 'pp7', status: 'pending', result: undefined, tournamentId: 't9' },
        ]
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
    settings: { pointsForWin: 1, pointsForDraw: 0, pointsForLoss: 0 }
  }
];

// Merge with main mock tournaments
export function getAllMockTournaments(): Tournament[] {
  // This will be imported in mockData.ts
  return [];
}

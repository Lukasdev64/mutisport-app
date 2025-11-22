import type { Tournament, Player } from '@/types/tournament';
import { v4 as uuidv4 } from 'uuid';

export const MOCK_PLAYERS: Player[] = [
  { id: 'p1', name: 'Alex Rivera', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', email: 'alex@example.com' },
  { id: 'p2', name: 'Sarah Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', email: 'sarah@example.com' },
  { id: 'p3', name: 'Mike Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', email: 'mike@example.com' },
  { id: 'p4', name: 'Emma Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', email: 'emma@example.com' },
  { id: 'p5', name: 'David Kim', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', email: 'david@example.com' },
  { id: 'p6', name: 'Lisa Park', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa', email: 'lisa@example.com' },
  { id: 'p7', name: 'James Bond', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', email: 'james@example.com' },
  { id: 'p8', name: 'Diana Prince', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana', email: 'diana@example.com' },
];

export const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: 't1',
    name: 'Summer Championship 2025',
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
    name: 'Friday Night Ping Pong',
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
    name: 'Office FIFA League',
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
    name: 'Chess Club Swiss',
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

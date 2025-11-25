import { describe, it, expect, beforeEach } from 'bun:test';
import { TournamentEngine } from './engine';
import type { Player, Tournament } from '@/types/tournament';

describe('TournamentEngine', () => {
  let players4: Player[];
  let players8: Player[];
  let players5: Player[]; // Odd number for bye handling

  beforeEach(() => {
    players4 = [
      { id: 'p1', name: 'Player 1' },
      { id: 'p2', name: 'Player 2' },
      { id: 'p3', name: 'Player 3' },
      { id: 'p4', name: 'Player 4' }
    ];

    players8 = [
      { id: 'p1', name: 'Player 1' },
      { id: 'p2', name: 'Player 2' },
      { id: 'p3', name: 'Player 3' },
      { id: 'p4', name: 'Player 4' },
      { id: 'p5', name: 'Player 5' },
      { id: 'p6', name: 'Player 6' },
      { id: 'p7', name: 'Player 7' },
      { id: 'p8', name: 'Player 8' }
    ];

    players5 = [
      { id: 'p1', name: 'Player 1' },
      { id: 'p2', name: 'Player 2' },
      { id: 'p3', name: 'Player 3' },
      { id: 'p4', name: 'Player 4' },
      { id: 'p5', name: 'Player 5' }
    ];
  });

  describe('generateBracket - Single Elimination', () => {
    it('should generate correct number of rounds for 4 players', () => {
      const rounds = TournamentEngine.generateBracket(players4, 'single_elimination');

      // 4 players = 2 rounds (semi-finals, final)
      expect(rounds.length).toBe(2);
    });

    it('should generate correct number of rounds for 8 players', () => {
      const rounds = TournamentEngine.generateBracket(players8, 'single_elimination');

      // 8 players = 3 rounds (quarter-finals, semi-finals, final)
      expect(rounds.length).toBe(3);
    });

    it('should generate correct number of matches in first round', () => {
      const rounds = TournamentEngine.generateBracket(players4, 'single_elimination');

      // 4 players = 2 matches in first round
      expect(rounds[0].matches.length).toBe(2);
    });

    it('should create final with 1 match', () => {
      const rounds = TournamentEngine.generateBracket(players8, 'single_elimination');

      // Final should have exactly 1 match
      const final = rounds[rounds.length - 1];
      expect(final.matches.length).toBe(1);
      expect(final.name).toBe('Final');
    });

    it('should name rounds correctly', () => {
      const rounds = TournamentEngine.generateBracket(players8, 'single_elimination');

      expect(rounds[0].name).toBe('Quarter-Finals');
      expect(rounds[1].name).toBe('Semi-Finals');
      expect(rounds[2].name).toBe('Final');
    });

    it('should link matches to next round', () => {
      const rounds = TournamentEngine.generateBracket(players8, 'single_elimination');

      // Each match in round 1 should have nextMatchId pointing to round 2
      const firstRoundMatches = rounds[0].matches;
      const secondRoundMatches = rounds[1].matches;

      expect(firstRoundMatches[0].nextMatchId).toBe(secondRoundMatches[0].id);
      expect(firstRoundMatches[1].nextMatchId).toBe(secondRoundMatches[0].id);
      expect(firstRoundMatches[2].nextMatchId).toBe(secondRoundMatches[1].id);
      expect(firstRoundMatches[3].nextMatchId).toBe(secondRoundMatches[1].id);
    });

    it('should handle byes for non-power-of-2 players', () => {
      const rounds = TournamentEngine.generateBracket(players5, 'single_elimination');

      // 5 players -> 8 bracket slots (next power of 2)
      // Some matches should be byes (completed with walkover)
      const firstRound = rounds[0];
      const byeMatches = firstRound.matches.filter(
        m => m.status === 'completed' && m.result?.isWalkover
      );

      expect(byeMatches.length).toBeGreaterThan(0);
    });

    it('should assign player IDs to matches', () => {
      const rounds = TournamentEngine.generateBracket(players4, 'single_elimination');

      const firstRoundMatches = rounds[0].matches;
      const assignedPlayers = new Set<string | undefined>();

      firstRoundMatches.forEach(match => {
        if (match.player1Id) assignedPlayers.add(match.player1Id);
        if (match.player2Id) assignedPlayers.add(match.player2Id);
      });

      // All 4 players should be assigned
      expect(assignedPlayers.size).toBe(4);
      players4.forEach(p => {
        expect(assignedPlayers.has(p.id)).toBe(true);
      });
    });
  });

  describe('generateBracket - Round Robin', () => {
    it('should generate correct number of rounds for 4 players', () => {
      const rounds = TournamentEngine.generateBracket(players4, 'round_robin');

      // Round robin with 4 players = 3 rounds (n-1)
      expect(rounds.length).toBe(3);
    });

    it('should generate all pairings (each player plays each other once)', () => {
      const rounds = TournamentEngine.generateBracket(players4, 'round_robin');

      const pairings = new Set<string>();

      rounds.forEach(round => {
        round.matches.forEach(match => {
          if (match.player1Id && match.player2Id) {
            const pair = [match.player1Id, match.player2Id].sort().join('-');
            pairings.add(pair);
          }
        });
      });

      // With 4 players, should have 6 unique pairings (4 choose 2)
      expect(pairings.size).toBe(6);
    });

    it('should handle odd number of players with bye', () => {
      const players3: Player[] = [
        { id: 'p1', name: 'Player 1' },
        { id: 'p2', name: 'Player 2' },
        { id: 'p3', name: 'Player 3' }
      ];

      const rounds = TournamentEngine.generateBracket(players3, 'round_robin');

      // With 3 players (+ 1 bye = 4), should be 3 rounds
      expect(rounds.length).toBe(3);

      // Each round should have at least 1 match
      rounds.forEach(round => {
        expect(round.matches.length).toBeGreaterThan(0);
      });
    });

    it('should name rounds correctly', () => {
      const rounds = TournamentEngine.generateBracket(players4, 'round_robin');

      expect(rounds[0].name).toBe('Round 1');
      expect(rounds[1].name).toBe('Round 2');
      expect(rounds[2].name).toBe('Round 3');
    });
  });

  describe('generateBracket - Swiss', () => {
    it('should generate only first round initially', () => {
      const rounds = TournamentEngine.generateBracket(players4, 'swiss');

      // Swiss generates only round 1 initially
      expect(rounds.length).toBe(1);
      expect(rounds[0].name).toBe('Round 1');
    });

    it('should pair all players in first round', () => {
      const rounds = TournamentEngine.generateBracket(players4, 'swiss');

      const firstRound = rounds[0];
      // 4 players = 2 matches
      expect(firstRound.matches.length).toBe(2);

      const pairedPlayers = new Set<string | undefined>();
      firstRound.matches.forEach(match => {
        if (match.player1Id) pairedPlayers.add(match.player1Id);
        if (match.player2Id) pairedPlayers.add(match.player2Id);
      });

      expect(pairedPlayers.size).toBe(4);
    });

    it('should handle odd number of players with bye', () => {
      const players3: Player[] = [
        { id: 'p1', name: 'Player 1' },
        { id: 'p2', name: 'Player 2' },
        { id: 'p3', name: 'Player 3' }
      ];

      const rounds = TournamentEngine.generateBracket(players3, 'swiss');

      const firstRound = rounds[0];
      // 3 players = 1 match + 1 bye
      expect(firstRound.matches.length).toBe(2);

      const byeMatch = firstRound.matches.find(m => m.result?.isWalkover);
      expect(byeMatch).toBeDefined();
      expect(byeMatch?.status).toBe('completed');
    });
  });

  describe('generateSwissRound', () => {
    it('should generate next round avoiding repeat pairings', () => {
      const tournament: Tournament = {
        id: 't1',
        name: 'Test Tournament',
        sport: 'tennis',
        format: 'swiss',
        status: 'in_progress',
        players: players4,
        rounds: [{
          id: 'r1',
          tournamentId: 't1',
          number: 1,
          name: 'Round 1',
          matches: [
            {
              id: 'm1',
              tournamentId: 't1',
              roundId: 'r1',
              player1Id: 'p1',
              player2Id: 'p2',
              status: 'completed',
              result: { player1Score: 2, player2Score: 0, winnerId: 'p1' }
            },
            {
              id: 'm2',
              tournamentId: 't1',
              roundId: 'r1',
              player1Id: 'p3',
              player2Id: 'p4',
              status: 'completed',
              result: { player1Score: 2, player2Score: 0, winnerId: 'p3' }
            }
          ],
          status: 'completed'
        }],
        settings: {
          pointsForWin: 3,
          pointsForDraw: 1,
          pointsForLoss: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const round2 = TournamentEngine.generateSwissRound(tournament, 2);

      expect(round2.number).toBe(2);
      expect(round2.matches.length).toBe(2);

      // Check no repeat pairings
      const round1Pairings = new Set(['p1-p2', 'p2-p1', 'p3-p4', 'p4-p3']);
      round2.matches.forEach(match => {
        if (match.player1Id && match.player2Id) {
          const pairing = `${match.player1Id}-${match.player2Id}`;
          expect(round1Pairings.has(pairing)).toBe(false);
        }
      });
    });
  });

  describe('getStandings', () => {
    it('should calculate standings correctly', () => {
      const tournament: Tournament = {
        id: 't1',
        name: 'Test Tournament',
        sport: 'tennis',
        format: 'round_robin',
        status: 'in_progress',
        players: players4,
        rounds: [{
          id: 'r1',
          tournamentId: 't1',
          number: 1,
          name: 'Round 1',
          matches: [
            {
              id: 'm1',
              tournamentId: 't1',
              roundId: 'r1',
              player1Id: 'p1',
              player2Id: 'p2',
              status: 'completed',
              result: { player1Score: 2, player2Score: 0, winnerId: 'p1' }
            },
            {
              id: 'm2',
              tournamentId: 't1',
              roundId: 'r1',
              player1Id: 'p3',
              player2Id: 'p4',
              status: 'completed',
              result: { player1Score: 2, player2Score: 1, winnerId: 'p3' }
            }
          ],
          status: 'completed'
        }],
        settings: {
          pointsForWin: 3,
          pointsForDraw: 1,
          pointsForLoss: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const standings = TournamentEngine.getStandings(tournament);

      // p1 and p3 won, should be top
      expect(standings[0].playerId).toBe('p1');
      expect(standings[0].points).toBe(3);
      expect(standings[0].won).toBe(1);
      expect(standings[0].lost).toBe(0);

      expect(standings[1].playerId).toBe('p3');
      expect(standings[1].points).toBe(3);

      // p2 and p4 lost
      const p2Standing = standings.find(s => s.playerId === 'p2');
      expect(p2Standing?.points).toBe(0);
      expect(p2Standing?.lost).toBe(1);
    });

    it('should handle draws', () => {
      const tournament: Tournament = {
        id: 't1',
        name: 'Test Tournament',
        sport: 'tennis',
        format: 'round_robin',
        status: 'in_progress',
        players: [players4[0], players4[1]],
        rounds: [{
          id: 'r1',
          tournamentId: 't1',
          number: 1,
          name: 'Round 1',
          matches: [
            {
              id: 'm1',
              tournamentId: 't1',
              roundId: 'r1',
              player1Id: 'p1',
              player2Id: 'p2',
              status: 'completed',
              result: { player1Score: 1, player2Score: 1 } // Draw - no winnerId
            }
          ],
          status: 'completed'
        }],
        settings: {
          pointsForWin: 3,
          pointsForDraw: 1,
          pointsForLoss: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const standings = TournamentEngine.getStandings(tournament);

      // Both players should have 1 point for draw
      expect(standings[0].drawn).toBe(1);
      expect(standings[0].points).toBe(1);
      expect(standings[1].drawn).toBe(1);
      expect(standings[1].points).toBe(1);
    });

    it('should sort by points, then wins, then fewer games played', () => {
      const tournament: Tournament = {
        id: 't1',
        name: 'Test Tournament',
        sport: 'tennis',
        format: 'round_robin',
        status: 'in_progress',
        players: players4,
        rounds: [
          {
            id: 'r1',
            tournamentId: 't1',
            number: 1,
            name: 'Round 1',
            matches: [
              {
                id: 'm1',
                tournamentId: 't1',
                roundId: 'r1',
                player1Id: 'p1',
                player2Id: 'p2',
                status: 'completed',
                result: { player1Score: 2, player2Score: 0, winnerId: 'p1' }
              }
            ],
            status: 'completed'
          },
          {
            id: 'r2',
            tournamentId: 't1',
            number: 2,
            name: 'Round 2',
            matches: [
              {
                id: 'm2',
                tournamentId: 't1',
                roundId: 'r2',
                player1Id: 'p1',
                player2Id: 'p3',
                status: 'completed',
                result: { player1Score: 2, player2Score: 0, winnerId: 'p1' }
              },
              {
                id: 'm3',
                tournamentId: 't1',
                roundId: 'r2',
                player1Id: 'p4',
                player2Id: 'p2',
                status: 'completed',
                result: { player1Score: 2, player2Score: 0, winnerId: 'p4' }
              }
            ],
            status: 'completed'
          }
        ],
        settings: {
          pointsForWin: 3,
          pointsForDraw: 1,
          pointsForLoss: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const standings = TournamentEngine.getStandings(tournament);

      // p1: 2 wins, 6 points, 2 played
      expect(standings[0].playerId).toBe('p1');
      expect(standings[0].points).toBe(6);
      expect(standings[0].played).toBe(2);

      // p4: 1 win, 3 points, 1 played (better than p2 who has more losses)
      expect(standings[1].playerId).toBe('p4');
      expect(standings[1].points).toBe(3);
    });
  });

  describe('Error handling', () => {
    it('should throw error for unsupported format', () => {
      expect(() => {
        TournamentEngine.generateBracket(players4, 'unknown_format' as any);
      }).toThrow('Unsupported format: unknown_format');
    });

    it('should return empty array for double elimination (not implemented)', () => {
      const rounds = TournamentEngine.generateBracket(players4, 'double_elimination');
      expect(rounds).toEqual([]);
    });
  });
});

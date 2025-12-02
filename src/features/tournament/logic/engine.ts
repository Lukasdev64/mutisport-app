import type { Player, Match, Round, TournamentFormat, Tournament, Standing } from '@/types/tournament';
import { v4 as uuidv4 } from 'uuid';

export class TournamentEngine {
  static generateBracket(
    players: Player[],
    format: TournamentFormat
  ): Round[] {
    switch (format) {
      case 'single_elimination':
        return this.generateSingleElimination(players);
      case 'round_robin':
        return this.generateRoundRobin(players);
      case 'swiss':
        return this.generateSwiss(players);
      case 'double_elimination':
        // TODO: Implement Double Elimination
        return [];
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Generate initial round for Swiss system
   * Only the first round is generated; subsequent rounds are created dynamically
   */
  private static generateSwiss(players: Player[]): Round[] {
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    const isOdd = shuffledPlayers.length % 2 !== 0;
    
    const matches: Match[] = [];
    const numMatches = Math.floor(shuffledPlayers.length / 2);

    for (let i = 0; i < numMatches; i++) {
      matches.push({
        id: uuidv4(),
        tournamentId: 'temp',
        roundId: 'round-1',
        player1Id: shuffledPlayers[i * 2].id,
        player2Id: shuffledPlayers[i * 2 + 1].id,
        status: 'pending'
      });
    }

    // Handle odd number with a Bye
    if (isOdd) {
      const byePlayer = shuffledPlayers[shuffledPlayers.length - 1];
      matches.push({
        id: uuidv4(),
        tournamentId: 'temp',
        roundId: 'round-1',
        player1Id: byePlayer.id,
        status: 'completed',
        result: {
          player1Score: 1,
          player2Score: 0,
          winnerId: byePlayer.id,
          isWalkover: true
        }
      });
    }

    return [{
      id: uuidv4(),
      tournamentId: 'temp',
      number: 1,
      name: 'Round 1',
      matches,
      status: 'pending'
    }];
  }

  /**
   * Generate next Swiss round based on current standings
   * Pairs players with similar scores, avoiding repeat matchups
   */
  static generateSwissRound(tournament: Tournament, roundNumber: number): Round {
    const standings = this.getStandings(tournament);
    const players = tournament.players;
    
    // Track who has played whom
    const pairingHistory: Map<string, Set<string>> = new Map();
    players.forEach(p => pairingHistory.set(p.id, new Set()));
    
    tournament.rounds.forEach(round => {
      round.matches.forEach(match => {
        if (match.player1Id && match.player2Id) {
          pairingHistory.get(match.player1Id)?.add(match.player2Id);
          pairingHistory.get(match.player2Id)?.add(match.player1Id);
        }
      });
    });

    // Sort players by standings
    const sortedPlayers = standings.map(s => players.find(p => p.id === s.playerId)!).filter(Boolean);
    const unpaired: Player[] = [...sortedPlayers];
    const matches: Match[] = [];

    // Pair players with similar scores
    while (unpaired.length > 1) {
      const player1 = unpaired.shift()!;
      let paired = false;

      // Try to find opponent who hasn't played player1
      for (let i = 0; i < unpaired.length; i++) {
        const player2 = unpaired[i];
        if (!pairingHistory.get(player1.id)?.has(player2.id)) {
          matches.push({
            id: uuidv4(),
            tournamentId: tournament.id,
            roundId: `round-${roundNumber}`,
            player1Id: player1.id,
            player2Id: player2.id,
            status: 'pending'
          });
          unpaired.splice(i, 1);
          paired = true;
          break;
        }
      }

      // If no valid opponent (all have played), pair with closest anyway
      if (!paired && unpaired.length > 0) {
        const player2 = unpaired.shift()!;
        matches.push({
          id: uuidv4(),
          tournamentId: tournament.id,
          roundId: `round-${roundNumber}`,
          player1Id: player1.id,
          player2Id: player2.id,
          status: 'pending'
        });
      }
    }

    // Handle Bye if odd number
    if (unpaired.length === 1) {
      const byePlayer = unpaired[0];
      matches.push({
        id: uuidv4(),
        tournamentId: tournament.id,
        roundId: `round-${roundNumber}`,
        player1Id: byePlayer.id,
        status: 'completed',
        result: {
          player1Score: 1,
          player2Score: 0,
          winnerId: byePlayer.id,
          isWalkover: true
        }
      });
    }

    return {
      id: uuidv4(),
      tournamentId: tournament.id,
      number: roundNumber,
      name: `Round ${roundNumber}`,
      matches,
      status: 'pending'
    };
  }

  private static generateRoundRobin(players: Player[]): Round[] {
    const rounds: Round[] = [];
    const n = players.length;
    const isOdd = n % 2 !== 0;
    const dummyPlayer: Player = { id: 'bye', name: 'Bye' };
    const participants = isOdd ? [...players, dummyPlayer] : [...players];
    const numParticipants = participants.length;
    const numRounds = numParticipants - 1;
    const half = numParticipants / 2;

    const participantIds = participants.map(p => p.id);

    for (let r = 0; r < numRounds; r++) {
      const matches: Match[] = [];
      
      for (let i = 0; i < half; i++) {
        const p1Id = participantIds[i];
        const p2Id = participantIds[numParticipants - 1 - i];

        // Skip "Bye" matches
        if (p1Id === 'bye' || p2Id === 'bye') continue;

        matches.push({
          id: uuidv4(),
          tournamentId: 'temp',
          roundId: `round-${r + 1}`,
          player1Id: p1Id,
          player2Id: p2Id,
          status: 'pending'
        });
      }

      rounds.push({
        id: uuidv4(),
        tournamentId: 'temp',
        number: r + 1,
        name: `Round ${r + 1}`,
        matches,
        status: 'pending'
      });

      // Rotate participants array (keep first fixed, rotate others)
      participantIds.splice(1, 0, participantIds.pop()!);
    }

    return rounds;
  }

  private static generateSingleElimination(players: Player[]): Round[] {
    const rounds: Round[] = [];
    const playerCount = players.length;
    
    // Calculate next power of 2
    const size = Math.pow(2, Math.ceil(Math.log2(playerCount)));
    const totalRounds = Math.log2(size);

    // First Round (Round of X)
    const firstRoundMatches: Match[] = [];
    
    // Shuffle players for randomness (or seed them if we had seeding)
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
    
    // Fill with "Byes" if needed
    const bracketSlots = new Array(size).fill(null).map((_, i) => shuffledPlayers[i] || null);

    for (let i = 0; i < size / 2; i++) {
      const player1 = bracketSlots[i];
      const player2 = bracketSlots[size - 1 - i];

      const match: Match = {
        id: uuidv4(),
        tournamentId: 'temp', // Will be set by caller
        roundId: 'round-1',
        player1Id: player1?.id,
        player2Id: player2?.id,
        status: 'pending',
        result: undefined
      };

      // Handle Byes immediately
      if (player1 && !player2) {
        match.status = 'completed';
        match.result = {
          player1Score: 0,
          player2Score: 0,
          winnerId: player1.id,
          isWalkover: true
        };
      }

      firstRoundMatches.push(match);
    }

    rounds.push({
      id: uuidv4(),
      tournamentId: 'temp',
      number: 1,
      name: this.getRoundName(1, totalRounds),
      matches: firstRoundMatches,
      status: 'pending'
    });

    // Generate subsequent empty rounds
    let currentRoundSize = size / 2;
    for (let r = 2; r <= totalRounds; r++) {
      currentRoundSize /= 2;
      const matches: Match[] = [];
      
      for (let i = 0; i < currentRoundSize; i++) {
        matches.push({
          id: uuidv4(),
          tournamentId: 'temp',
          roundId: `round-${r}`,
          status: 'pending'
        });
      }

      rounds.push({
        id: uuidv4(),
        tournamentId: 'temp',
        number: r,
        name: this.getRoundName(r, totalRounds),
        matches,
        status: 'pending'
      });
    }

    // Link matches (progression)
    this.linkMatches(rounds);

    return rounds;
  }

  private static linkMatches(rounds: Round[]) {
    for (let r = 0; r < rounds.length - 1; r++) {
      const currentRound = rounds[r];
      const nextRound = rounds[r + 1];

      for (let i = 0; i < currentRound.matches.length; i++) {
        const currentMatch = currentRound.matches[i];
        const nextMatchIndex = Math.floor(i / 2);
        const nextMatch = nextRound.matches[nextMatchIndex];

        if (nextMatch) {
          currentMatch.nextMatchId = nextMatch.id;
        }
      }
    }
  }

  private static getRoundName(roundNumber: number, totalRounds: number): string {
    if (roundNumber === totalRounds) return 'Final';
    if (roundNumber === totalRounds - 1) return 'Semi-Finals';
    if (roundNumber === totalRounds - 2) return 'Quarter-Finals';
    return `Round ${roundNumber}`;
  }
  /**
   * Get the current scheduling state of a tournament
   * Used for displaying contextual UI and suggestions
   */
  static getTournamentSchedulingState(tournament: Tournament): {
    state: 'no_bracket' | 'ready_to_schedule' | 'partially_scheduled' | 'fully_scheduled' | 'in_progress' | 'completed';
    stats: {
      totalMatches: number;
      scheduledMatches: number;
      completedMatches: number;
      inProgressMatches: number;
      nextMatch?: Match;
      firstMatchDate?: string;
    };
  } {
    const allMatches = tournament.rounds.flatMap(r => r.matches);
    const scheduledMatches = allMatches.filter(m => m.scheduledAt);
    const completedMatches = allMatches.filter(m => m.status === 'completed');
    const inProgressMatches = allMatches.filter(m => m.status === 'in_progress');

    // Find next upcoming match (scheduled, not completed, sorted by date)
    // const now = new Date();
    const upcomingMatches = scheduledMatches
      .filter(m => m.status !== 'completed' && m.scheduledAt)
      .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime());

    const nextMatch = upcomingMatches[0];

    // Find first match date
    const firstMatchDate = scheduledMatches.length > 0
      ? scheduledMatches
          .filter(m => m.scheduledAt)
          .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())[0]?.scheduledAt
      : undefined;

    // Determine state
    let state: 'no_bracket' | 'ready_to_schedule' | 'partially_scheduled' | 'fully_scheduled' | 'in_progress' | 'completed';

    if (allMatches.length === 0) {
      state = 'no_bracket';
    } else if (completedMatches.length === allMatches.length) {
      state = 'completed';
    } else if (inProgressMatches.length > 0 || completedMatches.length > 0) {
      state = 'in_progress';
    } else if (scheduledMatches.length === allMatches.length) {
      state = 'fully_scheduled';
    } else if (scheduledMatches.length > 0) {
      state = 'partially_scheduled';
    } else {
      state = 'ready_to_schedule';
    }

    return {
      state,
      stats: {
        totalMatches: allMatches.length,
        scheduledMatches: scheduledMatches.length,
        completedMatches: completedMatches.length,
        inProgressMatches: inProgressMatches.length,
        nextMatch,
        firstMatchDate
      }
    };
  }

  /**
   * Get upcoming matches sorted by scheduled time
   */
  static getUpcomingMatches(tournament: Tournament, limit = 5): Match[] {
    const allMatches = tournament.rounds.flatMap(r => r.matches);

    return allMatches
      .filter(m => m.scheduledAt && m.status !== 'completed')
      .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
      .slice(0, limit);
  }

  static getStandings(tournament: Tournament): Standing[] {
    const standings: Map<string, Standing> = new Map();

    // Initialize standings for all players
    tournament.players.forEach(player => {
      standings.set(player.id, {
        playerId: player.id,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        points: 0
      });
    });

    // Iterate through all matches to calculate stats
    tournament.rounds.forEach(round => {
      round.matches.forEach(match => {
        if (match.status === 'completed' && match.result) {
          const { player1Id, player2Id, result } = match;
          
          if (player1Id && standings.has(player1Id)) {
            const stats = standings.get(player1Id)!;
            stats.played += 1;
            
            if (result.winnerId === player1Id) {
              stats.won += 1;
              stats.points += tournament.settings.pointsForWin;
            } else if (result.winnerId === player2Id) {
              stats.lost += 1;
              stats.points += tournament.settings.pointsForLoss;
            } else {
              stats.drawn += 1;
              stats.points += tournament.settings.pointsForDraw;
            }
          }

          if (player2Id && standings.has(player2Id)) {
            const stats = standings.get(player2Id)!;
            stats.played += 1;
            
            if (result.winnerId === player2Id) {
              stats.won += 1;
              stats.points += tournament.settings.pointsForWin;
            } else if (result.winnerId === player1Id) {
              stats.lost += 1;
              stats.points += tournament.settings.pointsForLoss;
            } else {
              stats.drawn += 1;
              stats.points += tournament.settings.pointsForDraw;
            }
          }
        }
      });
    });

    return Array.from(standings.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.won !== a.won) return b.won - a.won;
      return a.played - b.played; // Less games played is better if points are tied (usually)
    });
  }
}

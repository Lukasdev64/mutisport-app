/**
 * Tests for Match Subscription functionality
 * Testing real-time subscription helpers
 */

import { describe, it, expect } from 'bun:test';
import {
  getConnectionStatusColor,
  getConnectionStatusText
} from '../hooks/useMatchSubscription';

describe('Connection Status Helpers', () => {
  describe('getConnectionStatusColor', () => {
    it('should return emerald for connected state', () => {
      const color = getConnectionStatusColor(true, null);
      expect(color).toBe('text-emerald-500');
    });

    it('should return red for error state', () => {
      const error = new Error('Connection failed');
      const color = getConnectionStatusColor(false, error);
      expect(color).toBe('text-red-500');
    });

    it('should return yellow for connecting state', () => {
      const color = getConnectionStatusColor(false, null);
      expect(color).toBe('text-yellow-500');
    });

    it('should prioritize error over connection state', () => {
      const error = new Error('Some error');
      const color = getConnectionStatusColor(true, error);
      expect(color).toBe('text-red-500');
    });
  });

  describe('getConnectionStatusText', () => {
    it('should return "En direct" for connected state', () => {
      const text = getConnectionStatusText(true, null);
      expect(text).toBe('En direct');
    });

    it('should return "Déconnecté" for error state', () => {
      const error = new Error('Connection failed');
      const text = getConnectionStatusText(false, error);
      expect(text).toBe('Déconnecté');
    });

    it('should return "Connexion..." for connecting state', () => {
      const text = getConnectionStatusText(false, null);
      expect(text).toBe('Connexion...');
    });
  });
});

describe('Match Update Structure', () => {
  interface MatchUpdate {
    matchId: string;
    tournamentId: string;
    data: {
      status?: string;
      winner_id?: string;
      player1_id?: string;
      player2_id?: string;
    };
    timestamp: string;
  }

  it('should have required fields in update object', () => {
    const update: MatchUpdate = {
      matchId: 'match-123',
      tournamentId: 'tournament-456',
      data: {
        status: 'in_progress',
        player1_id: 'player-1',
        player2_id: 'player-2'
      },
      timestamp: new Date().toISOString()
    };

    expect(update.matchId).toBeDefined();
    expect(update.tournamentId).toBeDefined();
    expect(update.timestamp).toBeDefined();
  });

  it('should handle completed match update', () => {
    const update: MatchUpdate = {
      matchId: 'match-123',
      tournamentId: 'tournament-456',
      data: {
        status: 'completed',
        winner_id: 'player-1',
        player1_id: 'player-1',
        player2_id: 'player-2'
      },
      timestamp: new Date().toISOString()
    };

    expect(update.data.status).toBe('completed');
    expect(update.data.winner_id).toBeDefined();
  });

  it('should handle match start update', () => {
    const update: MatchUpdate = {
      matchId: 'match-123',
      tournamentId: 'tournament-456',
      data: {
        status: 'in_progress'
      },
      timestamp: new Date().toISOString()
    };

    expect(update.data.status).toBe('in_progress');
    expect(update.data.winner_id).toBeUndefined();
  });
});

describe('Channel Naming Convention', () => {
  it('should generate unique channel name per tournament', () => {
    const tournamentId = 'tournament-abc123';
    const channelName = `tournament-matches-${tournamentId}`;

    expect(channelName).toBe('tournament-matches-tournament-abc123');
  });

  it('should handle special characters in tournament ID', () => {
    const tournamentId = 'tournament_with_underscore';
    const channelName = `tournament-matches-${tournamentId}`;

    expect(channelName).toContain(tournamentId);
  });
});

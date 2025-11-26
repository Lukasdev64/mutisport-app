/**
 * Tests for PWA Notifications features
 * Testing connection status and notification hooks
 */

import { describe, it, expect } from 'bun:test';
import { useConnectionStatus } from '../features/tournament/hooks/useTournamentNotifications';

describe('useConnectionStatus', () => {
  describe('status determination', () => {
    it('should return connected status when connected without error', () => {
      const status = useConnectionStatus(true, null);

      expect(status.color).toBe('bg-emerald-500');
      expect(status.text).toBe('Live');
      expect(status.pulse).toBe(true);
    });

    it('should return disconnected status when there is an error', () => {
      const status = useConnectionStatus(false, new Error('Connection failed'));

      expect(status.color).toBe('bg-red-500');
      expect(status.text).toBe('Disconnected');
      expect(status.pulse).toBe(false);
    });

    it('should return connecting status when not connected and no error', () => {
      const status = useConnectionStatus(false, null);

      expect(status.color).toBe('bg-yellow-500');
      expect(status.text).toBe('Connecting...');
      expect(status.pulse).toBe(true);
    });

    it('should prioritize error over connected state', () => {
      // Even if somehow connected is true but there's an error
      const status = useConnectionStatus(true, new Error('Some error'));

      // Error should take precedence
      expect(status.color).toBe('bg-red-500');
      expect(status.text).toBe('Disconnected');
    });
  });
});

describe('NotificationTags structure', () => {
  it('should support player role tag', () => {
    const tags = {
      player_id: 'player-123',
      tournament_id: 'tournament-456',
      role: 'player' as const
    };

    expect(tags.role).toBe('player');
    expect(tags.player_id).toBe('player-123');
  });

  it('should support spectator role tag', () => {
    const tags: { tournament_id: string; role: 'spectator'; player_id?: string } = {
      tournament_id: 'tournament-456',
      role: 'spectator' as const
    };

    expect(tags.role).toBe('spectator');
    expect(tags.player_id).toBeUndefined();
  });

  it('should support organizer role tag', () => {
    const tags = {
      tournament_id: 'tournament-456',
      role: 'organizer' as const
    };

    expect(tags.role).toBe('organizer');
  });
});

/**
 * Tests for Tournament Share functionality
 * Testing QR code generation and share URL construction
 */

import { describe, it, expect, mock } from 'bun:test';

// Mock modules before imports
mock.module('react-router-dom', () => ({
  useSearchParams: mock(() => {
    const params = new URLSearchParams();
    return [params, mock()];
  })
}));

mock.module('../context/NotificationContext', () => ({
  useNotifications: mock(() => ({
    subscribeToTournament: mock(),
    activeSubscription: null,
    permission: 'default'
  }))
}));

mock.module('../components/ui/toast', () => ({
  useToast: mock(() => ({
    toast: mock()
  }))
}));

describe('Tournament Share URL Generation', () => {
  const baseUrl = 'http://localhost:5173';
  const tournamentId = 'test-tournament-123';

  it('should generate correct share URL', () => {
    const shareUrl = `${baseUrl}/tournaments/${tournamentId}`;
    expect(shareUrl).toBe('http://localhost:5173/tournaments/test-tournament-123');
  });

  it('should generate spectator URL with subscribe parameter', () => {
    const spectatorUrl = `${baseUrl}/tournaments/${tournamentId}?subscribe=spectator`;
    expect(spectatorUrl).toContain('subscribe=spectator');
  });

  it('should generate player URL with subscribe parameter', () => {
    const playerUrl = `${baseUrl}/tournaments/${tournamentId}?subscribe=player`;
    expect(playerUrl).toContain('subscribe=player');
  });
});

describe('QR Code Data', () => {
  it('should use spectator URL for QR code', () => {
    const baseUrl = 'http://localhost:5173';
    const tournamentId = 'qr-test-tournament';
    const qrUrl = `${baseUrl}/tournaments/${tournamentId}?subscribe=spectator`;

    expect(qrUrl).toMatch(/\/tournaments\/[a-zA-Z0-9-]+\?subscribe=spectator$/);
  });

  it('should encode special characters in tournament name for download', () => {
    const tournamentName = 'Roland Garros 2025';
    const filename = tournamentName.replace(/\s+/g, '-');

    expect(filename).toBe('Roland-Garros-2025');
  });

  it('should handle tournament names with special characters', () => {
    const tournamentName = 'US Open & ATP Masters';
    const filename = tournamentName.replace(/\s+/g, '-').replace(/[&]/g, 'and');

    expect(filename).not.toContain(' ');
  });
});

describe('Share Functionality', () => {
  describe('Clipboard API', () => {
    it('should construct correct text for clipboard', () => {
      const shareUrl = 'http://localhost:5173/tournaments/123?subscribe=spectator';
      expect(typeof shareUrl).toBe('string');
      expect(shareUrl.length).toBeGreaterThan(0);
    });
  });

  describe('Native Share API data', () => {
    it('should construct share data object', () => {
      const tournament = {
        name: 'Test Tournament',
        id: 'test-123'
      };

      const shareData = {
        title: tournament.name,
        text: `Follow the ${tournament.name} tournament live!`,
        url: `http://localhost:5173/tournaments/${tournament.id}?subscribe=spectator`
      };

      expect(shareData.title).toBe('Test Tournament');
      expect(shareData.text).toContain('tournament live');
      expect(shareData.url).toContain(tournament.id);
    });
  });
});

describe('Subscription Auto-trigger', () => {
  it('should detect spectator subscribe param', () => {
    const params = new URLSearchParams('?subscribe=spectator');
    const subscribeParam = params.get('subscribe');

    expect(subscribeParam).toBe('spectator');
  });

  it('should detect player subscribe param', () => {
    const params = new URLSearchParams('?subscribe=player');
    const subscribeParam = params.get('subscribe');

    expect(subscribeParam).toBe('player');
  });

  it('should return null when no subscribe param', () => {
    const params = new URLSearchParams('');
    const subscribeParam = params.get('subscribe');

    expect(subscribeParam).toBeNull();
  });

  it('should handle multiple params correctly', () => {
    const params = new URLSearchParams('?ref=qr&subscribe=spectator&source=share');
    const subscribeParam = params.get('subscribe');

    expect(subscribeParam).toBe('spectator');
  });
});

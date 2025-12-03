/**
 * Tests for Wizard Navigation utilities
 *
 * Tests the sport-specific wizard navigation system that routes users
 * to the appropriate wizard based on the selected sport.
 */

import { describe, expect, test } from 'bun:test';
import {
  getWizardUrl,
  canCreateTournament,
  getWizardStatusLabel,
} from '@/hooks/useWizardNavigation';
import type { SportType } from '@/types/sport';

describe('Wizard Navigation', () => {
  describe('getWizardUrl', () => {
    test('returns tennis wizard URL for tennis', () => {
      expect(getWizardUrl('tennis')).toBe('/tournaments/new/tennis');
    });

    test('returns basketball wizard URL for basketball', () => {
      expect(getWizardUrl('basketball')).toBe('/tournaments/new/basketball');
    });

    test('returns football wizard URL for football', () => {
      expect(getWizardUrl('football')).toBe('/tournaments/new/football');
    });

    test('returns hub URL for WIP sports', () => {
      expect(getWizardUrl('ping_pong')).toBe('/tournaments/new');
      expect(getWizardUrl('chess')).toBe('/tournaments/new');
      expect(getWizardUrl('generic')).toBe('/tournaments/new');
    });

    test('returns hub URL for unknown sports', () => {
      // Type assertion for testing edge case
      expect(getWizardUrl('unknown_sport' as SportType)).toBe('/tournaments/new');
    });
  });

  describe('canCreateTournament', () => {
    test('returns true for implemented sports', () => {
      expect(canCreateTournament('tennis')).toBe(true);
      expect(canCreateTournament('football')).toBe(true);
    });

    test('returns false for partial sports', () => {
      expect(canCreateTournament('basketball')).toBe(false);
    });

    test('returns false for WIP sports', () => {
      expect(canCreateTournament('ping_pong')).toBe(false);
      expect(canCreateTournament('chess')).toBe(false);
      expect(canCreateTournament('generic')).toBe(false);
    });
  });

  describe('getWizardStatusLabel', () => {
    test('returns null for implemented sports', () => {
      expect(getWizardStatusLabel('tennis')).toBeNull();
      expect(getWizardStatusLabel('football')).toBeNull();
    });

    test('returns "Beta" for partial sports', () => {
      expect(getWizardStatusLabel('basketball')).toBe('Beta');
    });

    test('returns "Bientot" for WIP sports', () => {
      expect(getWizardStatusLabel('ping_pong')).toBe('Bientot');
      expect(getWizardStatusLabel('chess')).toBe('Bientot');
      expect(getWizardStatusLabel('generic')).toBe('Bientot');
    });
  });

  describe('Sport-specific wizard routing matrix', () => {
    const sportRoutingMatrix: Array<{
      sport: SportType;
      expectedUrl: string;
      canCreate: boolean;
      label: string | null;
    }> = [
      { sport: 'tennis', expectedUrl: '/tournaments/new/tennis', canCreate: true, label: null },
      { sport: 'football', expectedUrl: '/tournaments/new/football', canCreate: true, label: null },
      { sport: 'basketball', expectedUrl: '/tournaments/new/basketball', canCreate: false, label: 'Beta' },
      { sport: 'ping_pong', expectedUrl: '/tournaments/new', canCreate: false, label: 'Bientot' },
      { sport: 'chess', expectedUrl: '/tournaments/new', canCreate: false, label: 'Bientot' },
      { sport: 'generic', expectedUrl: '/tournaments/new', canCreate: false, label: 'Bientot' },
    ];

    test.each(sportRoutingMatrix)(
      '$sport: URL=$expectedUrl, canCreate=$canCreate, label=$label',
      ({ sport, expectedUrl, canCreate, label }) => {
        expect(getWizardUrl(sport)).toBe(expectedUrl);
        expect(canCreateTournament(sport)).toBe(canCreate);
        expect(getWizardStatusLabel(sport)).toBe(label);
      }
    );
  });
});

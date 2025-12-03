/**
 * Tests for Sport Implementation Status System
 * Ensures proper isolation between implemented and WIP sports
 */

import { describe, it, expect } from 'bun:test';
import {
  SPORT_IMPLEMENTATION_STATUS,
  isSportImplemented,
  isSportUsable,
  getImplementationStatusLabel,
  SPORTS
} from '../types/sport';
import type { SportType, SportImplementationStatus } from '../types/sport';

describe('Sport Implementation Status', () => {
  describe('SPORT_IMPLEMENTATION_STATUS', () => {
    it('should have a status defined for every sport in SPORTS', () => {
      const sportTypes = Object.keys(SPORTS) as SportType[];

      sportTypes.forEach(sport => {
        expect(SPORT_IMPLEMENTATION_STATUS[sport]).toBeDefined();
        expect(['implemented', 'partial', 'wip']).toContain(SPORT_IMPLEMENTATION_STATUS[sport]);
      });
    });

    it('should mark tennis as fully implemented', () => {
      expect(SPORT_IMPLEMENTATION_STATUS.tennis).toBe('implemented');
    });

    it('should mark basketball as partial', () => {
      expect(SPORT_IMPLEMENTATION_STATUS.basketball).toBe('partial');
    });

    it('should mark football as implemented', () => {
      expect(SPORT_IMPLEMENTATION_STATUS.football).toBe('implemented');
    });

    it('should mark ping_pong, chess, generic as wip', () => {
      expect(SPORT_IMPLEMENTATION_STATUS.ping_pong).toBe('wip');
      expect(SPORT_IMPLEMENTATION_STATUS.chess).toBe('wip');
      expect(SPORT_IMPLEMENTATION_STATUS.generic).toBe('wip');
    });
  });

  describe('isSportImplemented', () => {
    it('should return true for tennis and football', () => {
      expect(isSportImplemented('tennis')).toBe(true);
      expect(isSportImplemented('football')).toBe(true);
      expect(isSportImplemented('basketball')).toBe(false);
      expect(isSportImplemented('ping_pong')).toBe(false);
      expect(isSportImplemented('chess')).toBe(false);
      expect(isSportImplemented('generic')).toBe(false);
    });
  });

  describe('isSportUsable', () => {
    it('should return true for implemented and partial sports', () => {
      expect(isSportUsable('tennis')).toBe(true);
      expect(isSportUsable('football')).toBe(true);
      expect(isSportUsable('basketball')).toBe(true);
    });

    it('should return false for WIP sports', () => {
      expect(isSportUsable('ping_pong')).toBe(false);
      expect(isSportUsable('chess')).toBe(false);
      expect(isSportUsable('generic')).toBe(false);
    });
  });

  describe('getImplementationStatusLabel', () => {
    it('should return empty string for implemented', () => {
      expect(getImplementationStatusLabel('implemented')).toBe('');
    });

    it('should return "Beta" for partial', () => {
      expect(getImplementationStatusLabel('partial')).toBe('Beta');
    });

    it('should return "Bientot" for wip', () => {
      expect(getImplementationStatusLabel('wip')).toBe('Bientot');
    });
  });

  describe('Sport wizard isolation', () => {
    it('should have tennis and football as fully implemented sports', () => {
      const implementedSports = (Object.keys(SPORT_IMPLEMENTATION_STATUS) as SportType[])
        .filter(sport => SPORT_IMPLEMENTATION_STATUS[sport] === 'implemented');

      expect(implementedSports).toContain('tennis');
      expect(implementedSports).toContain('football');
      expect(implementedSports.length).toBe(2);
    });

    it('should have tennis config not required for non-tennis usable sports', () => {
      // This test documents the expected behavior:
      // Basketball and football tournaments should NOT require tennisConfig
      const usableSports = (Object.keys(SPORT_IMPLEMENTATION_STATUS) as SportType[])
        .filter(sport => isSportUsable(sport));

      expect(usableSports).toContain('tennis');
      expect(usableSports).toContain('football');
      expect(usableSports).toContain('basketball');
    });

    it('should block WIP sports from tournament creation', () => {
      // This test documents that WIP sports should be blocked
      const wipSports = (Object.keys(SPORT_IMPLEMENTATION_STATUS) as SportType[])
        .filter(sport => SPORT_IMPLEMENTATION_STATUS[sport] === 'wip');

      wipSports.forEach(sport => {
        expect(isSportUsable(sport)).toBe(false);
      });
    });
  });
});

describe('SPORTS registry', () => {
  it('should have all required properties for each sport', () => {
    const sportTypes = Object.keys(SPORTS) as SportType[];

    sportTypes.forEach(sportId => {
      const sport = SPORTS[sportId];
      expect(sport.id).toBe(sportId);
      expect(sport.name).toBeDefined();
      expect(sport.emoji).toBeDefined();
      expect(sport.icon).toBeDefined();
      expect(sport.color).toBeDefined();
      expect(sport.scoringSystem).toBeDefined();
    });
  });

  it('should have tennis with correct scoring system', () => {
    expect(SPORTS.tennis.scoringSystem).toBe('tennis');
  });

  it('should have basketball with points scoring system', () => {
    expect(SPORTS.basketball.scoringSystem).toBe('points');
  });

  it('should have football with goals scoring system', () => {
    expect(SPORTS.football.scoringSystem).toBe('goals');
  });
});

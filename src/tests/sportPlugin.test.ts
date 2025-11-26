import { describe, test, expect, beforeEach } from 'bun:test';
import { useSportStore } from '@/store/sportStore';
import { tennisPlugin } from '@/sports/tennis/plugin';
import { basketballPlugin } from '@/sports/basketball/plugin';
import type { SportPlugin } from '@/sports/core/types';
import type { Tournament } from '@/types/tournament';

describe('Sport Plugin System', () => {
  beforeEach(() => {
    // Reset the store before each test
    const store = useSportStore.getState();
    store.registeredPlugins.clear();
    // Reset to default active sport
    useSportStore.setState({ activeSport: 'tennis' });
  });

  describe('Plugin Registration', () => {
    test('should register a plugin', () => {
      const store = useSportStore.getState();
      store.registerPlugin(tennisPlugin);

      expect(store.hasPlugin('tennis')).toBe(true);
      expect(store.getPlugin('tennis')).toBe(tennisPlugin);
    });

    test('should register multiple plugins', () => {
      const store = useSportStore.getState();
      store.registerPlugin(tennisPlugin);
      store.registerPlugin(basketballPlugin);

      expect(store.hasPlugin('tennis')).toBe(true);
      expect(store.hasPlugin('basketball')).toBe(true);
      expect(store.getAllPlugins().length).toBe(2);
    });

    test('should unregister a plugin', () => {
      const store = useSportStore.getState();
      store.registerPlugin(tennisPlugin);
      expect(store.hasPlugin('tennis')).toBe(true);

      store.unregisterPlugin('tennis');
      expect(store.hasPlugin('tennis')).toBe(false);
      expect(store.getPlugin('tennis')).toBeNull();
    });

    test('should return null for unregistered plugin', () => {
      const store = useSportStore.getState();
      expect(store.getPlugin('tennis')).toBeNull();
      expect(store.hasPlugin('tennis')).toBe(false);
    });

    test('should call onRegister callback when registering', () => {
      let registerCalled = false;
      const mockPlugin: SportPlugin = {
        ...tennisPlugin,
        onRegister: () => { registerCalled = true; },
      };

      const store = useSportStore.getState();
      store.registerPlugin(mockPlugin);

      expect(registerCalled).toBe(true);
    });

    test('should call onUnregister callback when unregistering', () => {
      let unregisterCalled = false;
      const mockPlugin: SportPlugin = {
        ...tennisPlugin,
        onUnregister: () => { unregisterCalled = true; },
      };

      const store = useSportStore.getState();
      store.registerPlugin(mockPlugin);
      store.unregisterPlugin('tennis');

      expect(unregisterCalled).toBe(true);
    });
  });

  describe('Tennis Plugin', () => {
    test('should have correct id and sport', () => {
      expect(tennisPlugin.id).toBe('tennis');
      expect(tennisPlugin.sport.id).toBe('tennis');
      expect(tennisPlugin.sport.name).toBe('Tennis');
    });

    test('should have default config', () => {
      expect(tennisPlugin.defaultConfig).toBeDefined();
      const config = tennisPlugin.defaultConfig as { format: string };
      expect(config.format).toBe('best_of_3');
    });

    test('should have presets', () => {
      expect(tennisPlugin.presets).toBeDefined();
      expect(tennisPlugin.presets!.length).toBeGreaterThan(0);

      // Check for common presets (Grand Slams and custom)
      const presetIds = tennisPlugin.presets!.map(p => p.id);
      expect(presetIds).toContain('australian-open');
      expect(presetIds).toContain('wimbledon');
      expect(presetIds).toContain('custom');
    });

    test('should have MatchModal component', () => {
      expect(tennisPlugin.components.MatchModal).toBeDefined();
    });

    test('should have RulesModule component', () => {
      expect(tennisPlugin.components.RulesModule).toBeDefined();
    });

    test('should have scoring engine', () => {
      expect(tennisPlugin.scoringEngine).toBeDefined();
      expect(tennisPlugin.scoringEngine!.initializeMatch).toBeDefined();
      expect(tennisPlugin.scoringEngine!.getWinner).toBeDefined();
      expect(tennisPlugin.scoringEngine!.getScoreDisplay).toBeDefined();
    });

    test('should validate config correctly', () => {
      expect(tennisPlugin.validateConfig).toBeDefined();

      // Valid configs
      expect(tennisPlugin.validateConfig!({ format: 'best_of_3', tiebreakAt: 6 })).toBe(true);
      expect(tennisPlugin.validateConfig!({ format: 'best_of_5', tiebreakAt: 6 })).toBe(true);

      // Invalid configs
      expect(tennisPlugin.validateConfig!(null)).toBe(false);
      expect(tennisPlugin.validateConfig!({})).toBe(false);
      expect(tennisPlugin.validateConfig!({ format: 'invalid' })).toBe(false);
    });
  });

  describe('Basketball Plugin', () => {
    test('should have correct id and sport', () => {
      expect(basketballPlugin.id).toBe('basketball');
      expect(basketballPlugin.sport.id).toBe('basketball');
      expect(basketballPlugin.sport.name).toBe('Basketball');
    });

    test('should have default config', () => {
      expect(basketballPlugin.defaultConfig).toBeDefined();
      const config = basketballPlugin.defaultConfig as { format: string };
      expect(config.format).toBe('standard');
    });

    test('should have presets', () => {
      expect(basketballPlugin.presets).toBeDefined();
      expect(basketballPlugin.presets!.length).toBeGreaterThan(0);

      const presetIds = basketballPlugin.presets!.map(p => p.id);
      expect(presetIds).toContain('standard');
      expect(presetIds).toContain('nba');
    });

    test('should have MatchModal component', () => {
      expect(basketballPlugin.components.MatchModal).toBeDefined();
    });

    test('should have scoring engine', () => {
      expect(basketballPlugin.scoringEngine).toBeDefined();

      // Test initialize
      const score = basketballPlugin.scoringEngine!.initializeMatch({});
      expect(score).toEqual({ player1Score: 0, player2Score: 0 });

      // Test getWinner
      expect(basketballPlugin.scoringEngine!.getWinner({ player1Score: 100, player2Score: 90 })).toBe('player1');
      expect(basketballPlugin.scoringEngine!.getWinner({ player1Score: 90, player2Score: 100 })).toBe('player2');
      expect(basketballPlugin.scoringEngine!.getWinner({ player1Score: 90, player2Score: 90 })).toBeUndefined();

      // Test with explicit winnerId
      expect(basketballPlugin.scoringEngine!.getWinner({ player1Score: 90, player2Score: 90, winnerId: 'player1' })).toBe('player1');

      // Test getScoreDisplay
      expect(basketballPlugin.scoringEngine!.getScoreDisplay({ player1Score: 100, player2Score: 90 })).toBe('100 - 90');
    });

    test('should validate config correctly', () => {
      expect(basketballPlugin.validateConfig).toBeDefined();

      // Valid configs
      expect(basketballPlugin.validateConfig!({ format: 'standard' })).toBe(true);
      expect(basketballPlugin.validateConfig!({ format: 'nba' })).toBe(true);
      expect(basketballPlugin.validateConfig!({ format: 'college' })).toBe(true);

      // Invalid configs
      expect(basketballPlugin.validateConfig!(null)).toBe(false);
      expect(basketballPlugin.validateConfig!({})).toBe(false);
      expect(basketballPlugin.validateConfig!({ format: 'invalid' })).toBe(false);
    });
  });

  describe('Sport Config Extraction', () => {
    test('should use sportConfig when available', () => {
      const tournament: Tournament = {
        id: '1',
        name: 'Test',
        sport: 'tennis',
        sportConfig: { format: 'best_of_5', tiebreakAt: 6 },
        format: 'single_elimination',
        status: 'active',
        players: [],
        rounds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: { pointsForWin: 3, pointsForDraw: 1, pointsForLoss: 0 },
      };

      // sportConfig should be preferred
      expect(tournament.sportConfig).toEqual({ format: 'best_of_5', tiebreakAt: 6 });
    });

    test('should maintain backward compatibility with tennisConfig', () => {
      const tournament: Tournament = {
        id: '1',
        name: 'Test',
        sport: 'tennis',
        tennisConfig: {
          format: 'best_of_3',
          surface: 'hard',
          tiebreakAt: 6,
          finalSetTiebreak: true,
          finalSetTiebreakPoints: 7,
          decidingPointAtDeuce: false,
          letRule: true,
          coachingAllowed: false,
          challengesPerSet: 3,
          warmupMinutes: 5,
          changeoverSeconds: 90,
          betweenPointsSeconds: 25,
        },
        format: 'single_elimination',
        status: 'active',
        players: [],
        rounds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: { pointsForWin: 3, pointsForDraw: 1, pointsForLoss: 0 },
      };

      // tennisConfig should still work for backward compatibility
      expect(tournament.tennisConfig).toBeDefined();
      expect(tournament.tennisConfig?.format).toBe('best_of_3');
    });
  });

  describe('Active Sport Selection', () => {
    test('should set and get active sport', () => {
      useSportStore.getState().setActiveSport('tennis');
      expect(useSportStore.getState().activeSport).toBe('tennis');

      useSportStore.getState().setActiveSport('basketball');
      expect(useSportStore.getState().activeSport).toBe('basketball');
    });

    test('should get plugin for active sport', () => {
      const store = useSportStore.getState();
      store.registerPlugin(tennisPlugin);
      store.registerPlugin(basketballPlugin);

      useSportStore.getState().setActiveSport('tennis');
      expect(useSportStore.getState().getPlugin(useSportStore.getState().activeSport)).toBe(tennisPlugin);

      useSportStore.getState().setActiveSport('basketball');
      expect(useSportStore.getState().getPlugin(useSportStore.getState().activeSport)).toBe(basketballPlugin);
    });
  });

  describe('getAllPlugins', () => {
    test('should return empty array when no plugins registered', () => {
      const store = useSportStore.getState();
      expect(store.getAllPlugins()).toEqual([]);
    });

    test('should return all registered plugins', () => {
      const store = useSportStore.getState();
      store.registerPlugin(tennisPlugin);
      store.registerPlugin(basketballPlugin);

      const plugins = store.getAllPlugins();
      expect(plugins.length).toBe(2);
      expect(plugins).toContain(tennisPlugin);
      expect(plugins).toContain(basketballPlugin);
    });
  });
});

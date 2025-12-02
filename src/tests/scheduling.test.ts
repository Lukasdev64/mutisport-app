/**
 * Tests for Tournament Scheduling features
 * Testing schedule generation and configuration
 */

import { describe, it, expect } from 'bun:test';
import { getScheduleStats } from '../features/tournament/hooks/useScheduleGeneration';
import type { ScheduledMatch } from '../features/tournament/logic/schedulingEngine';
import type { SchedulingConfig, ReminderConfig, ResourceType } from '../types/tournament';

describe('SchedulingConfig', () => {
  it('should have correct default structure', () => {
    const defaultConfig: SchedulingConfig = {
      enabled: false,
      startDate: '2025-01-15',
      dailyStartTime: '09:00',
      dailyEndTime: '18:00',
      matchDurationMinutes: 60,
      breakBetweenMatches: 15,
      resources: []
    };

    expect(defaultConfig.enabled).toBe(false);
    expect(defaultConfig.matchDurationMinutes).toBe(60);
    expect(defaultConfig.breakBetweenMatches).toBe(15);
    expect(defaultConfig.resources).toHaveLength(0);
  });

  it('should support optional endDate for multi-day tournaments', () => {
    const multiDayConfig: SchedulingConfig = {
      enabled: true,
      startDate: '2025-01-15',
      endDate: '2025-01-17',
      dailyStartTime: '09:00',
      dailyEndTime: '18:00',
      matchDurationMinutes: 60,
      breakBetweenMatches: 15,
      resources: []
    };

    expect(multiDayConfig.endDate).toBe('2025-01-17');
  });

  it('should support different resource types', () => {
    const resourceTypes: ResourceType[] = ['court', 'field', 'table'];

    resourceTypes.forEach(type => {
      expect(['court', 'field', 'table']).toContain(type);
    });
  });
});

describe('ReminderConfig', () => {
  it('should have correct default structure', () => {
    const defaultConfig: ReminderConfig = {
      enabled: true,
      reminderTimes: [15, 60, 1440], // 15min, 1h, 1 day
      notifyOnRoundStart: true,
      notifyOnMatchEnd: false
    };

    expect(defaultConfig.enabled).toBe(true);
    expect(defaultConfig.reminderTimes).toContain(15);
    expect(defaultConfig.reminderTimes).toContain(60);
    expect(defaultConfig.reminderTimes).toContain(1440);
  });

  it('should allow configuring multiple reminder times', () => {
    const config: ReminderConfig = {
      enabled: true,
      reminderTimes: [15, 60],
      notifyOnRoundStart: false,
      notifyOnMatchEnd: false
    };

    expect(config.reminderTimes).toHaveLength(2);
    expect(config.reminderTimes[0]).toBe(15);
    expect(config.reminderTimes[1]).toBe(60);
  });

  it('should convert reminder minutes to readable format', () => {
    const formatReminderTime = (minutes: number): string => {
      if (minutes < 60) {
        return `${minutes} minutes`;
      } else if (minutes === 60) {
        return '1 hour';
      } else if (minutes < 1440) {
        const hours = Math.floor(minutes / 60);
        return `${hours} hour${hours > 1 ? 's' : ''}`;
      } else {
        const days = Math.floor(minutes / 1440);
        return `${days} day${days > 1 ? 's' : ''}`;
      }
    };

    expect(formatReminderTime(15)).toBe('15 minutes');
    expect(formatReminderTime(60)).toBe('1 hour');
    expect(formatReminderTime(120)).toBe('2 hours');
    expect(formatReminderTime(1440)).toBe('1 day');
    expect(formatReminderTime(2880)).toBe('2 days');
  });
});

describe('getScheduleStats', () => {
  it('should return null for empty schedule', () => {
    const stats = getScheduleStats([]);
    expect(stats).toBeNull();
  });

  it('should calculate stats for scheduled matches', () => {
    const schedule: ScheduledMatch[] = [
      {
        id: 'match-1',
        player1Id: 'p1',
        player2Id: 'p2',
        status: 'scheduled',
        scheduledAt: '2025-01-15T09:00:00.000Z',
        resourceId: 'court-1',
        location: 'Court 1'
      },
      {
        id: 'match-2',
        player1Id: 'p3',
        player2Id: 'p4',
        status: 'scheduled',
        scheduledAt: '2025-01-15T10:00:00.000Z',
        resourceId: 'court-1',
        location: 'Court 1'
      },
      {
        id: 'match-3',
        player1Id: 'p1',
        player2Id: 'p3',
        status: 'scheduled',
        scheduledAt: '2025-01-16T09:00:00.000Z',
        resourceId: 'court-2',
        location: 'Court 2'
      }
    ];

    const stats = getScheduleStats(schedule);

    expect(stats).not.toBeNull();
    expect(stats!.totalMatches).toBe(3);
    expect(stats!.scheduledMatches).toBe(3);
    expect(stats!.daysCount).toBe(2);
    expect(stats!.resourcesUsed).toBe(2);
  });

  it('should handle matches without scheduledAt', () => {
    const schedule: ScheduledMatch[] = [
      {
        id: 'match-1',
        player1Id: 'p1',
        player2Id: 'p2',
        status: 'pending',
        scheduledAt: '2025-01-15T09:00:00.000Z',
        resourceId: 'court-1',
        location: 'Court 1'
      },
      {
        id: 'match-2',
        player1Id: 'p3',
        player2Id: 'p4',
        status: 'pending'
        // No scheduledAt
      }
    ];

    const stats = getScheduleStats(schedule);

    expect(stats).not.toBeNull();
    expect(stats!.totalMatches).toBe(2);
    expect(stats!.scheduledMatches).toBe(1);
  });
});

describe('Resource Management', () => {
  it('should create resources with unique IDs', () => {
    const createResource = (name: string, type: ResourceType) => ({
      id: `resource-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      name,
      type
    });

    const court1 = createResource('Court 1', 'court');
    const court2 = createResource('Court 2', 'court');

    expect(court1.id).not.toBe(court2.id);
    expect(court1.name).toBe('Court 1');
    expect(court2.type).toBe('court');
  });

  it('should support all resource types', () => {
    const resources = [
      { id: 'r1', name: 'Tennis Court 1', type: 'court' as ResourceType },
      { id: 'r2', name: 'Football Field A', type: 'field' as ResourceType },
      { id: 'r3', name: 'Ping Pong Table 1', type: 'table' as ResourceType }
    ];

    expect(resources[0].type).toBe('court');
    expect(resources[1].type).toBe('field');
    expect(resources[2].type).toBe('table');
  });
});

describe('Time Bounds Validation', () => {
  it('should validate daily time format', () => {
    const isValidTimeFormat = (time: string): boolean => {
      const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      return regex.test(time);
    };

    expect(isValidTimeFormat('09:00')).toBe(true);
    expect(isValidTimeFormat('18:30')).toBe(true);
    expect(isValidTimeFormat('23:59')).toBe(true);
    expect(isValidTimeFormat('00:00')).toBe(true);
    expect(isValidTimeFormat('9:00')).toBe(true);
    expect(isValidTimeFormat('25:00')).toBe(false);
    expect(isValidTimeFormat('12:60')).toBe(false);
  });

  it('should validate start time is before end time', () => {
    const isValidTimeRange = (start: string, end: string): boolean => {
      const [startH, startM] = start.split(':').map(Number);
      const [endH, endM] = end.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      return startMinutes < endMinutes;
    };

    expect(isValidTimeRange('09:00', '18:00')).toBe(true);
    expect(isValidTimeRange('08:00', '20:00')).toBe(true);
    expect(isValidTimeRange('18:00', '09:00')).toBe(false);
    expect(isValidTimeRange('12:00', '12:00')).toBe(false);
  });

  it('should calculate available slots per day', () => {
    const calculateSlots = (
      startTime: string,
      endTime: string,
      matchDuration: number,
      breakTime: number
    ): number => {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      const availableMinutes = (endH * 60 + endM) - (startH * 60 + startM);
      const slotDuration = matchDuration + breakTime;
      return Math.floor(availableMinutes / slotDuration);
    };

    // 9am to 6pm = 540 minutes, with 60min match + 15min break = 75min slots
    expect(calculateSlots('09:00', '18:00', 60, 15)).toBe(7);

    // 9am to 5pm = 480 minutes, with 45min match + 15min break = 60min slots
    expect(calculateSlots('09:00', '17:00', 45, 15)).toBe(8);
  });
});

describe('Match Scheduling Integration', () => {
  it('should update match with scheduled time and resource', () => {
    interface Match {
      id: string;
      scheduledAt?: string;
      resourceId?: string;
      location?: string;
      status: 'pending' | 'scheduled' | 'in_progress' | 'completed';
    }

    const match: Match = {
      id: 'match-123',
      status: 'pending'
    };

    // Simulate scheduling
    const scheduledMatch = {
      ...match,
      scheduledAt: '2025-01-15T10:00:00.000Z',
      resourceId: 'court-1',
      location: 'Court 1',
      status: 'scheduled' as const
    };

    expect(scheduledMatch.scheduledAt).toBeDefined();
    expect(scheduledMatch.resourceId).toBe('court-1');
    expect(scheduledMatch.status).toBe('scheduled');
  });
});

describe('TournamentEngine Scheduling State', () => {
  // Import TournamentEngine for testing
  const { TournamentEngine } = require('../features/tournament/logic/engine');

  const createMockTournament = (matches: any[]) => ({
    id: 'tournament-1',
    name: 'Test Tournament',
    format: 'single_elimination',
    status: 'active',
    players: [
      { id: 'p1', name: 'Player 1' },
      { id: 'p2', name: 'Player 2' },
      { id: 'p3', name: 'Player 3' },
      { id: 'p4', name: 'Player 4' },
    ],
    rounds: [{ id: 'round-1', name: 'Round 1', matches }],
    settings: { pointsForWin: 3, pointsForDraw: 1, pointsForLoss: 0 },
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
  });

  it('should detect "no_bracket" state', () => {
    const tournament = createMockTournament([]);

    const { state, stats } = TournamentEngine.getTournamentSchedulingState(tournament);

    expect(state).toBe('no_bracket');
    expect(stats.totalMatches).toBe(0);
  });

  it('should detect "ready_to_schedule" state', () => {
    const tournament = createMockTournament([
      { id: 'm1', player1Id: 'p1', player2Id: 'p2', status: 'pending' },
      { id: 'm2', player1Id: 'p3', player2Id: 'p4', status: 'pending' },
    ]);

    const { state, stats } = TournamentEngine.getTournamentSchedulingState(tournament);

    expect(state).toBe('ready_to_schedule');
    expect(stats.totalMatches).toBe(2);
    expect(stats.scheduledMatches).toBe(0);
  });

  it('should detect "partially_scheduled" state', () => {
    const tournament = createMockTournament([
      { id: 'm1', player1Id: 'p1', player2Id: 'p2', status: 'scheduled', scheduledAt: '2025-01-15T10:00:00.000Z' },
      { id: 'm2', player1Id: 'p3', player2Id: 'p4', status: 'pending' },
    ]);

    const { state, stats } = TournamentEngine.getTournamentSchedulingState(tournament);

    expect(state).toBe('partially_scheduled');
    expect(stats.totalMatches).toBe(2);
    expect(stats.scheduledMatches).toBe(1);
  });

  it('should detect "fully_scheduled" state', () => {
    const tournament = createMockTournament([
      { id: 'm1', player1Id: 'p1', player2Id: 'p2', status: 'scheduled', scheduledAt: '2025-01-15T10:00:00.000Z' },
      { id: 'm2', player1Id: 'p3', player2Id: 'p4', status: 'scheduled', scheduledAt: '2025-01-15T11:00:00.000Z' },
    ]);

    const { state, stats } = TournamentEngine.getTournamentSchedulingState(tournament);

    expect(state).toBe('fully_scheduled');
    expect(stats.totalMatches).toBe(2);
    expect(stats.scheduledMatches).toBe(2);
    expect(stats.firstMatchDate).toBe('2025-01-15T10:00:00.000Z');
  });

  it('should detect "in_progress" state', () => {
    const tournament = createMockTournament([
      { id: 'm1', player1Id: 'p1', player2Id: 'p2', status: 'completed', result: { winnerId: 'p1', player1Score: 2, player2Score: 0 } },
      { id: 'm2', player1Id: 'p3', player2Id: 'p4', status: 'pending' },
    ]);

    const { state, stats } = TournamentEngine.getTournamentSchedulingState(tournament);

    expect(state).toBe('in_progress');
    expect(stats.completedMatches).toBe(1);
  });

  it('should detect "completed" state', () => {
    const tournament = createMockTournament([
      { id: 'm1', player1Id: 'p1', player2Id: 'p2', status: 'completed', result: { winnerId: 'p1', player1Score: 2, player2Score: 0 } },
      { id: 'm2', player1Id: 'p3', player2Id: 'p4', status: 'completed', result: { winnerId: 'p3', player1Score: 2, player2Score: 1 } },
    ]);

    const { state, stats } = TournamentEngine.getTournamentSchedulingState(tournament);

    expect(state).toBe('completed');
    expect(stats.completedMatches).toBe(2);
  });
});

describe('TournamentEngine getUpcomingMatches', () => {
  const { TournamentEngine } = require('../features/tournament/logic/engine');

  it('should return empty array when no scheduled matches', () => {
    const tournament = {
      id: 'tournament-1',
      rounds: [
        {
          id: 'round-1',
          matches: [
            { id: 'm1', status: 'pending' },
            { id: 'm2', status: 'pending' },
          ],
        },
      ],
    };

    const upcoming = TournamentEngine.getUpcomingMatches(tournament);

    expect(upcoming).toHaveLength(0);
  });

  it('should return scheduled matches sorted by time', () => {
    const tournament = {
      id: 'tournament-1',
      rounds: [
        {
          id: 'round-1',
          matches: [
            { id: 'm1', status: 'scheduled', scheduledAt: '2025-01-15T14:00:00.000Z' },
            { id: 'm2', status: 'scheduled', scheduledAt: '2025-01-15T10:00:00.000Z' },
            { id: 'm3', status: 'scheduled', scheduledAt: '2025-01-15T12:00:00.000Z' },
          ],
        },
      ],
    };

    const upcoming = TournamentEngine.getUpcomingMatches(tournament);

    expect(upcoming).toHaveLength(3);
    expect(upcoming[0].id).toBe('m2'); // 10:00
    expect(upcoming[1].id).toBe('m3'); // 12:00
    expect(upcoming[2].id).toBe('m1'); // 14:00
  });

  it('should exclude completed matches', () => {
    const tournament = {
      id: 'tournament-1',
      rounds: [
        {
          id: 'round-1',
          matches: [
            { id: 'm1', status: 'completed', scheduledAt: '2025-01-15T10:00:00.000Z' },
            { id: 'm2', status: 'scheduled', scheduledAt: '2025-01-15T12:00:00.000Z' },
          ],
        },
      ],
    };

    const upcoming = TournamentEngine.getUpcomingMatches(tournament);

    expect(upcoming).toHaveLength(1);
    expect(upcoming[0].id).toBe('m2');
  });

  it('should respect limit parameter', () => {
    const tournament = {
      id: 'tournament-1',
      rounds: [
        {
          id: 'round-1',
          matches: [
            { id: 'm1', status: 'scheduled', scheduledAt: '2025-01-15T10:00:00.000Z' },
            { id: 'm2', status: 'scheduled', scheduledAt: '2025-01-15T11:00:00.000Z' },
            { id: 'm3', status: 'scheduled', scheduledAt: '2025-01-15T12:00:00.000Z' },
          ],
        },
      ],
    };

    const upcoming = TournamentEngine.getUpcomingMatches(tournament, 2);

    expect(upcoming).toHaveLength(2);
    expect(upcoming[0].id).toBe('m1');
    expect(upcoming[1].id).toBe('m2');
  });
});

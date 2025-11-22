import { Tournament, Match } from '@/types/tournament';
import { RegistrationData } from './selectionAlgorithm';

export interface Resource {
  id: string;
  name: string; // e.g., "Court 1", "Terrain A"
  type: 'court' | 'field' | 'table';
}

export interface TimeSlot {
  start: Date;
  end: Date;
}

export interface ScheduledMatch extends Match {
  scheduledAt?: string; // ISO string
  resourceId?: string;
  location?: string;
}

export class SchedulingEngine {
  /**
   * Generates a schedule for the tournament matches.
   */
  static generateSchedule(
    matches: Match[],
    resources: Resource[],
    availabilities: Map<string, RegistrationData>, // playerId -> data
    startDate: Date,
    matchDurationMinutes: number = 60
  ): ScheduledMatch[] {
    const scheduledMatches: ScheduledMatch[] = [...matches];
    const scheduleStart = new Date(startDate);
    
    // Simple greedy algorithm
    // 1. Iterate through matches
    // 2. Find first available slot where both players are available and a resource is free
    
    let currentSlotStart = new Date(scheduleStart);
    let matchesScheduledCount = 0;

    // Mock: Just assigning sequential slots for now to demonstrate
    scheduledMatches.forEach((match, index) => {
      if (match.winner) return; // Skip completed matches

      // Assign resource (Round Robin style distribution)
      const resource = resources[index % resources.length];
      
      // Assign time (staggered by resource count)
      // If we have 2 courts, matches 0 and 1 start at T0, matches 2 and 3 at T0 + duration
      const batchIndex = Math.floor(index / resources.length);
      const matchTime = new Date(scheduleStart.getTime() + (batchIndex * matchDurationMinutes * 60000));

      match.scheduledAt = matchTime.toISOString();
      match.resourceId = resource.id;
      match.location = resource.name;
      
      // In a real implementation, we would check:
      // - Player availability (availabilities.get(player1Id).constraints...)
      // - Resource availability (is resource free at matchTime?)
    });

    return scheduledMatches;
  }

  /**
   * Checks if a specific slot is valid for two players.
   */
  static isSlotValid(
    slot: TimeSlot,
    player1: RegistrationData,
    player2: RegistrationData
  ): boolean {
    // Check player 1 constraints
    // Check player 2 constraints
    return true; // Mock
  }
}

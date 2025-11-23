import type { Match } from '@/types/tournament';
import type { RegistrationData } from './selectionAlgorithm';

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
   * Now with full constraint awareness!
   */
  static generateSchedule(
    matches: Match[],
    resources: Resource[],
    availabilities: Map<string, RegistrationData>,
    startDate: Date,
    matchDurationMinutes: number = 60
  ): ScheduledMatch[] {
    const scheduledMatches: ScheduledMatch[] = [];
    const scheduleStart = new Date(startDate);
    
    // Process each match
    for (const match of matches) {
      if ((match as any).winner) {
        // Match already played, keep existing schedule
        scheduledMatches.push(match as ScheduledMatch);
        continue;
      }

      // Get player availability data
      const p1 = availabilities.get(match.player1Id);
      const p2 = availabilities.get(match.player2Id);

      if (!p1 || !p2) {
        console.warn(`Missing player data for match ${match.id}, scheduling without constraints`);
        // Fallback: schedule without constraints
        const resource = resources[scheduledMatches.length % resources.length];
        const batchIndex = Math.floor(scheduledMatches.length / resources.length);
        const matchTime = new Date(scheduleStart.getTime() + (batchIndex * matchDurationMinutes * 60000));
        
        scheduledMatches.push({
          ...match,
          scheduledAt: matchTime.toISOString(),
          resourceId: resource.id,
          location: resource.name
        });
        continue;
      }

      // Find a valid time slot
      let slotFound = false;
      let currentTime = new Date(scheduleStart);
      const maxDaysToSearch = 30; // Don't search forever
      const endSearchTime = new Date(scheduleStart.getTime() + maxDaysToSearch * 24 * 60 * 60 * 1000);

      while (!slotFound && currentTime < endSearchTime) {
        // Try each resource at this time
        for (const resource of resources) {
          const slot = {
            start: currentTime,
            end: new Date(currentTime.getTime() + matchDurationMinutes * 60000),
            resourceId: resource.id
          };

          // Check if this slot works for both players and the resource
          if (this.isSlotValid(slot, scheduledMatches, p1, p2)) {
            // Found a valid slot!
            scheduledMatches.push({
              ...match,
              scheduledAt: slot.start.toISOString(),
              resourceId: resource.id,
              location: resource.name
            });
            slotFound = true;
            break;
          }
        }

        if (!slotFound) {
          // Move to next time slot (15 minute increments for flexibility)
          currentTime = new Date(currentTime.getTime() + 15 * 60000);
        }
      }

      if (!slotFound) {
        console.error(`Could not find valid slot for match ${match.id} within ${maxDaysToSearch} days`);
        // Last resort: schedule anyway with warning
        const resource = resources[scheduledMatches.length % resources.length];
        scheduledMatches.push({
          ...match,
          scheduledAt: currentTime.toISOString(),
          resourceId: resource.id,
          location: resource.name + ' (⚠️ Constraint violation)'
        });
      }
    }

    return scheduledMatches;
  }

  /**
   * Checks if a player's constraints allow scheduling at a specific date.
   */
  private static checkConstraints(
    player: RegistrationData,
    date: Date,
    existingMatches: Match[]
  ): boolean {
    if (!player.constraints) return true;

    // 1. Check unavailable dates
    const dateString = date.toISOString().split('T')[0];
    if (player.constraints.unavailableDates?.includes(dateString)) {
      console.log(`Player ${player.name} is unavailable on ${dateString}`);
      return false;
    }

    // 2. Check max matches per day
    const playerMatchesOnDate = existingMatches.filter(m => 
      (m.player1Id === player.id || m.player2Id === player.id) &&
      m.scheduledAt?.startsWith(dateString)
    );

    if (player.constraints.maxMatchesPerDay && playerMatchesOnDate.length >= player.constraints.maxMatchesPerDay) {
      console.log(`Player ${player.name} has reached max matches (${player.constraints.maxMatchesPerDay}) on ${dateString}`);
      return false;
    }

    return true;
  }

  /**
   * Checks if a specific time slot is valid for both players and the resource.
   */
  private static isSlotValid(
    slot: { start: Date; end: Date; resourceId: string },
    matches: Match[],
    p1: RegistrationData,
    p2: RegistrationData
  ): boolean {
    // Check resource availability
    const resourceBusy = matches.some(m => 
      m.resourceId === slot.resourceId &&
      m.scheduledAt &&
      new Date(m.scheduledAt).getTime() === slot.start.getTime()
    );
    if (resourceBusy) return false;

    // Check player constraints
    if (!this.checkConstraints(p1, slot.start, matches)) return false;
    if (!this.checkConstraints(p2, slot.start, matches)) return false;

    return true;
  }
}

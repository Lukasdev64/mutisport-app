import { useState, useCallback } from 'react';
import type { Tournament, SchedulingConfig, Match } from '@/types/tournament';
import { SchedulingEngine, type ScheduledMatch, type Resource } from '../logic/schedulingEngine';
import type { RegistrationData } from '../logic/selectionAlgorithm';

interface UseScheduleGenerationResult {
  generatedSchedule: ScheduledMatch[] | null;
  isGenerating: boolean;
  error: string | null;
  generateSchedule: () => Promise<void>;
  clearSchedule: () => void;
}

/**
 * Hook to generate tournament schedules using the SchedulingEngine
 */
export function useScheduleGeneration(
  tournament: Tournament,
  schedulingConfig: SchedulingConfig
): UseScheduleGenerationResult {
  const [generatedSchedule, setGeneratedSchedule] = useState<ScheduledMatch[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSchedule = useCallback(async () => {
    if (!schedulingConfig.enabled) {
      setError('Le scheduling n\'est pas activé');
      return;
    }

    if (!schedulingConfig.startDate) {
      setError('Veuillez définir une date de début');
      return;
    }

    if (schedulingConfig.resources.length === 0) {
      setError('Veuillez ajouter au moins une ressource');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Collect all matches from all rounds
      const allMatches: Match[] = tournament.rounds.flatMap(round => round.matches);

      if (allMatches.length === 0) {
        setError('Aucun match à planifier');
        setIsGenerating(false);
        return;
      }

      // Convert our Resource type to SchedulingEngine Resource type
      const resources: Resource[] = schedulingConfig.resources.map(r => ({
        id: r.id,
        name: r.name,
        type: r.type
      }));

      // Build availability map from tournament players
      const availabilities = new Map<string, RegistrationData>();
      tournament.players.forEach(player => {
        availabilities.set(player.id, {
          id: player.id,
          name: player.name,
          email: player.email || '',
          registrationDate: player.registrationDate
            ? new Date(player.registrationDate)
            : new Date(),
          constraints: player.constraints || { unavailableDates: [], maxMatchesPerDay: 3 }
        });
      });

      // Parse start date with time
      const startDateTime = parseStartDateTime(
        schedulingConfig.startDate,
        schedulingConfig.dailyStartTime
      );

      // Calculate effective match duration including break
      const effectiveDuration = schedulingConfig.matchDurationMinutes + schedulingConfig.breakBetweenMatches;

      // Generate the schedule
      const scheduled = SchedulingEngine.generateSchedule(
        allMatches,
        resources,
        availabilities,
        startDateTime,
        effectiveDuration
      );

      // Filter scheduled matches to only include those within daily time bounds
      const filteredSchedule = filterByDailyBounds(
        scheduled,
        schedulingConfig.dailyStartTime,
        schedulingConfig.dailyEndTime
      );

      setGeneratedSchedule(filteredSchedule);
    } catch (err) {
      console.error('Schedule generation failed:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération');
    } finally {
      setIsGenerating(false);
    }
  }, [tournament, schedulingConfig]);

  const clearSchedule = useCallback(() => {
    setGeneratedSchedule(null);
    setError(null);
  }, []);

  return {
    generatedSchedule,
    isGenerating,
    error,
    generateSchedule,
    clearSchedule
  };
}

/**
 * Parse start date and time into a Date object
 */
function parseStartDateTime(dateStr: string, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(dateStr);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Filter scheduled matches to ensure they fall within daily time bounds
 * Matches outside the bounds will be moved to the next available day
 */
function filterByDailyBounds(
  matches: ScheduledMatch[],
  startTime: string,
  endTime: string
): ScheduledMatch[] {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  return matches.map(match => {
    if (!match.scheduledAt) return match;

    const matchDate = new Date(match.scheduledAt);
    const matchHour = matchDate.getHours();
    const matchMin = matchDate.getMinutes();

    // Check if match time is before daily start
    if (matchHour < startHour || (matchHour === startHour && matchMin < startMin)) {
      matchDate.setHours(startHour, startMin, 0, 0);
      return { ...match, scheduledAt: matchDate.toISOString() };
    }

    // Check if match time is after daily end
    if (matchHour > endHour || (matchHour === endHour && matchMin > endMin)) {
      // Move to next day at start time
      matchDate.setDate(matchDate.getDate() + 1);
      matchDate.setHours(startHour, startMin, 0, 0);
      return { ...match, scheduledAt: matchDate.toISOString() };
    }

    return match;
  });
}

/**
 * Utility to get schedule statistics
 */
export function getScheduleStats(schedule: ScheduledMatch[]) {
  if (!schedule.length) return null;

  const scheduledMatches = schedule.filter(m => m.scheduledAt);
  const dates = new Set(scheduledMatches.map(m => m.scheduledAt!.split('T')[0]));
  const resources = new Set(scheduledMatches.map(m => m.resourceId).filter(Boolean));

  // Find earliest and latest times
  const times = scheduledMatches.map(m => new Date(m.scheduledAt!).getTime());
  const earliest = new Date(Math.min(...times));
  const latest = new Date(Math.max(...times));

  return {
    totalMatches: schedule.length,
    scheduledMatches: scheduledMatches.length,
    daysCount: dates.size,
    resourcesUsed: resources.size,
    startDate: earliest.toLocaleDateString('fr-FR'),
    endDate: latest.toLocaleDateString('fr-FR'),
    startTime: earliest.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    endTime: latest.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  };
}

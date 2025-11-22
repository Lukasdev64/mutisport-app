import { Player } from '@/types/tournament';

export interface RegistrationData {
  playerId: string;
  name: string;
  email: string;
  registrationDate: Date;
  constraints: {
    unavailableDates: string[];
    maxMatchesPerDay?: number;
    preferredTimes?: string[];
  };
  skillLevel?: number; // 1-10
}

export interface SelectionResult {
  selected: RegistrationData[];
  waitlist: RegistrationData[];
  rejected: { data: RegistrationData; reason: string }[];
}

export class SelectionAlgorithm {
  /**
   * Calculates a score for a candidate based on registration time and constraints.
   * Higher score is better.
   */
  static calculateScore(candidate: RegistrationData, tournamentStartDate: Date): number {
    let score = 100;

    // 1. Registration Time (Early bird bonus)
    // Decay score by 1 point for every hour late relative to opening (mock logic)
    // For simplicity, we just use a base score.
    
    // 2. Constraints Penalty
    // Heavy penalty for unavailable dates during tournament
    if (candidate.constraints.unavailableDates.length > 0) {
      score -= (candidate.constraints.unavailableDates.length * 10);
    }

    // Penalty for restrictive max matches
    if (candidate.constraints.maxMatchesPerDay && candidate.constraints.maxMatchesPerDay < 2) {
      score -= 15;
    }

    // Bonus for skill level match (optional, not implemented yet)

    return Math.max(0, score);
  }

  /**
   * Selects participants for the tournament.
   */
  static selectParticipants(
    candidates: RegistrationData[],
    maxParticipants: number,
    tournamentStartDate: Date
  ): SelectionResult {
    // 1. Sort candidates by score (descending) then by registration date (ascending)
    const scoredCandidates = candidates.map(c => ({
      candidate: c,
      score: this.calculateScore(c, tournamentStartDate)
    }));

    scoredCandidates.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score; // Higher score first
      }
      return a.candidate.registrationDate.getTime() - b.candidate.registrationDate.getTime(); // Earlier registration first
    });

    const selected: RegistrationData[] = [];
    const waitlist: RegistrationData[] = [];
    const rejected: { data: RegistrationData; reason: string }[] = [];

    scoredCandidates.forEach((item, index) => {
      // Reject if score is too low (e.g., too many constraints)
      if (item.score < 50) {
        rejected.push({
          data: item.candidate,
          reason: "Disponibilités trop restreintes pour le format du tournoi."
        });
        return;
      }

      if (selected.length < maxParticipants) {
        selected.push(item.candidate);
      } else {
        waitlist.push(item.candidate);
      }
    });

    return { selected, waitlist, rejected };
  }
}

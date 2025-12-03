import { v4 as uuidv4 } from 'uuid';
import type { FootballMatchScore, FootballMatchEvent } from '@/types/football';

export class FootballScoringEngine {
  static getInitialScore(): FootballMatchScore {
    return {
      homeScore: 0,
      awayScore: 0,
      period: '1st_half',
      timeElapsed: 0,
      events: []
    };
  }

  static addGoal(score: FootballMatchScore, team: 'home' | 'away', minute: number, playerId?: string): FootballMatchScore {
    const newScore = { ...score };
    
    if (team === 'home') {
      newScore.homeScore++;
    } else {
      newScore.awayScore++;
    }

    const event: FootballMatchEvent = {
      id: uuidv4(),
      type: 'goal',
      team,
      minute,
      playerId
    };

    newScore.events = [...newScore.events, event];
    return newScore;
  }

  static removeGoal(score: FootballMatchScore, eventId: string): FootballMatchScore {
    const newScore = { ...score };
    const eventIndex = newScore.events.findIndex(e => e.id === eventId);
    
    if (eventIndex === -1) return score;

    const event = newScore.events[eventIndex];
    if (event.type === 'goal') {
      if (event.team === 'home') {
        newScore.homeScore = Math.max(0, newScore.homeScore - 1);
      } else {
        newScore.awayScore = Math.max(0, newScore.awayScore - 1);
      }
    }

    newScore.events = newScore.events.filter(e => e.id !== eventId);
    return newScore;
  }

  static nextPeriod(score: FootballMatchScore): FootballMatchScore {
    const newScore = { ...score };
    
    switch (score.period) {
      case '1st_half':
        newScore.period = '2nd_half';
        newScore.timeElapsed = 45;
        break;
      case '2nd_half':
        if (newScore.homeScore === newScore.awayScore) {
          newScore.period = 'extra_time_1';
          newScore.timeElapsed = 90;
        } else {
          newScore.period = 'finished';
        }
        break;
      case 'extra_time_1':
        newScore.period = 'extra_time_2';
        newScore.timeElapsed = 105;
        break;
      case 'extra_time_2':
        if (newScore.homeScore === newScore.awayScore) {
          newScore.period = 'penalties';
          newScore.penaltiesScore = { home: 0, away: 0 };
        } else {
          newScore.period = 'finished';
        }
        break;
      case 'penalties':
        newScore.period = 'finished';
        break;
    }

    return newScore;
  }
}

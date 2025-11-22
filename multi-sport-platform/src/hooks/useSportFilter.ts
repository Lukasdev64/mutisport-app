import { useMemo } from 'react';
import { useTournamentStore } from '@/features/tournament/store/tournamentStore';
import { useSportStore } from '@/store/sportStore';

/**
 * Hook to get tournaments filtered by the active sport
 */
export function useSportFilteredTournaments() {
  const tournaments = useTournamentStore((state) => state.tournaments);
  const activeSport = useSportStore((state) => state.activeSport);

  const filteredTournaments = useMemo(() => {
    return tournaments.filter(t => t.sport === activeSport);
  }, [tournaments, activeSport]);

  return filteredTournaments;
}

/**
 * Hook to get sport-specific stats
 */
export function useSportStats() {
  const tournaments = useSportFilteredTournaments();
  
  const stats = useMemo(() => {
    const activeTournaments = tournaments.filter(t => t.status === 'active').length;
    const totalPlayers = tournaments.reduce((acc, t) => acc + t.players.length, 0);
    const completedTournaments = tournaments.filter(t => t.status === 'completed').length;

    return {
      totalTournaments: tournaments.length,
      activeTournaments,
      completedTournaments,
      totalPlayers
    };
  }, [tournaments]);

  return stats;
}

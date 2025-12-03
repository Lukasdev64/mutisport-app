import { useState, useEffect, useMemo } from 'react';
import { useTournamentStore } from '@/features/tournament/store/tournamentStore';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/types/arena';

/**
 * Hook to determine the user's role for a specific tournament.
 *
 * Roles:
 * - organizer: Created the tournament (local or remote)
 * - referee: Assigned as referee (future feature)
 * - spectator: Viewing someone else's tournament
 *
 * @param tournamentId - The tournament ID to check role for
 * @returns UserRole - The user's role for this tournament
 */
export function useUserRole(tournamentId: string): UserRole {
  const [role, setRole] = useState<UserRole>('spectator');

  // Check if tournament exists in local store (user created it)
  const isLocalTournament = useTournamentStore(
    (state) => state.tournaments.some((t) => t.id === tournamentId)
  );

  useEffect(() => {
    const checkRole = async () => {
      // If tournament is in local store, user is the organizer
      if (isLocalTournament) {
        setRole('organizer');
        return;
      }

      // Check if user is authenticated and owns the remote tournament
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Check tournament ownership in database
          const { data: tournamentData } = await supabase
            .from('tournaments')
            .select('organizer_id')
            .eq('id', tournamentId)
            .single();

          const organizerId = (tournamentData as { organizer_id?: string } | null)?.organizer_id;
          if (organizerId === user.id) {
            setRole('organizer');
            return;
          }
        }

        // Default to spectator
        setRole('spectator');
      } catch {
        // On error, default to spectator
        setRole('spectator');
      }
    };

    if (tournamentId) {
      checkRole();
    }
  }, [tournamentId, isLocalTournament]);

  return role;
}

/**
 * Hook to get role-based permissions.
 *
 * @param role - The user's role
 * @returns Object with boolean permissions
 */
export function useRolePermissions(role: UserRole) {
  return useMemo(() => ({
    canScore: role === 'organizer' || role === 'referee',
    canEdit: role === 'organizer',
    canSchedule: role === 'organizer',
    canShare: true, // Everyone can share
    canViewSettings: role === 'organizer',
    canManagePlayers: role === 'organizer',
  }), [role]);
}

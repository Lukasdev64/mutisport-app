import { useEffect, useRef, useCallback } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { useToast } from '@/components/ui/toast';
import type { Tournament } from '@/types/tournament';

interface MatchUpdate {
  matchId: string;
  tournamentId: string;
  data: {
    status?: string;
    winner_id?: string;
    player1_id?: string;
    player2_id?: string;
    [key: string]: unknown;
  };
  timestamp: string;
}

interface UseTournamentNotificationsOptions {
  tournament: Tournament | undefined;
  lastUpdate: MatchUpdate | null;
}

/**
 * Hook that handles tournament notification logic:
 * - Shows toast notifications for match updates
 * - Triggers push notifications via OneSignal tags
 *
 * Note: Subscription is handled by SpectatorSubscribePage (/tournaments/:id/spectator)
 */
export function useTournamentNotifications({
  tournament,
  lastUpdate
}: UseTournamentNotificationsOptions) {
  const { subscribeToTournament, activeSubscription, permission } = useNotifications();
  const { toast } = useToast();
  const previousUpdateRef = useRef<MatchUpdate | null>(null);

  // Handle match updates and show toast notifications
  useEffect(() => {
    if (!tournament || !lastUpdate) return;

    // Prevent duplicate processing
    if (
      previousUpdateRef.current?.matchId === lastUpdate.matchId &&
      previousUpdateRef.current?.timestamp === lastUpdate.timestamp
    ) {
      return;
    }
    previousUpdateRef.current = lastUpdate;

    const matchData = lastUpdate.data;
    if (!matchData) return;

    // Find player names from tournament
    const getPlayerName = (playerId: string | undefined) => {
      if (!playerId) return 'Unknown';
      const player = tournament.players.find(p => p.id === playerId);
      return player?.name || 'Unknown';
    };

    // Show toast based on match status change
    if (matchData.status === 'in_progress') {
      const player1 = getPlayerName(matchData.player1_id);
      const player2 = getPlayerName(matchData.player2_id);
      toast(`Match started: ${player1} vs ${player2}`, 'info');
    } else if (matchData.status === 'completed' && matchData.winner_id) {
      const winner = getPlayerName(matchData.winner_id);
      toast(`Match completed! ${winner} wins`, 'success');
    }
  }, [tournament, lastUpdate, toast]);

  // Check if currently subscribed to this tournament
  const isSubscribed = activeSubscription?.tournamentId === tournament?.id;

  // Manual subscribe function
  const subscribe = useCallback(async (role: 'player' | 'spectator' | 'organizer' = 'spectator') => {
    if (!tournament) return;
    await subscribeToTournament(tournament.id, role);
  }, [tournament, subscribeToTournament]);

  return {
    isSubscribed,
    subscribe,
    permission,
    activeSubscription
  };
}

/**
 * Connection status badge component data
 * Pure function - not a hook
 */
export function useConnectionStatus(isConnected: boolean, error: Error | null) {
  if (error) {
    return {
      color: 'bg-red-500',
      text: 'Disconnected',
      pulse: false
    };
  }
  if (isConnected) {
    return {
      color: 'bg-emerald-500',
      text: 'Live',
      pulse: true
    };
  }
  return {
    color: 'bg-yellow-500',
    text: 'Connecting...',
    pulse: true
  };
}

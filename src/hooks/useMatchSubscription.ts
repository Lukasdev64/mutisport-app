import { useEffect, useCallback, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Match } from '@/types/tournament';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/** Supabase Realtime payload for match changes */
interface MatchRow {
  id: string;
  [key: string]: unknown;
}
type MatchChangePayload = RealtimePostgresChangesPayload<MatchRow>;

interface MatchUpdate {
  matchId: string;
  tournamentId: string;
  data: Partial<Match>;
  timestamp: string;
}

interface UseMatchSubscriptionOptions {
  tournamentId: string;
  onMatchUpdate?: (update: MatchUpdate) => void;
  enabled?: boolean;
}

interface UseMatchSubscriptionReturn {
  isConnected: boolean;
  lastUpdate: MatchUpdate | null;
  error: Error | null;
}

/**
 * Hook for subscribing to real-time match updates via Supabase Realtime
 *
 * Note: This hook is designed for when tournaments are stored in Supabase.
 * Currently, tournaments are stored in localStorage, so this serves as
 * infrastructure for future migration.
 *
 * Usage:
 * ```tsx
 * const { isConnected, lastUpdate } = useMatchSubscription({
 *   tournamentId: 'abc123',
 *   onMatchUpdate: (update) => {
 *     // Update local state with the new match data
 *     updateMatchInStore(update.matchId, update.data);
 *   }
 * });
 * ```
 */
export function useMatchSubscription({
  tournamentId,
  onMatchUpdate,
  enabled = true
}: UseMatchSubscriptionOptions): UseMatchSubscriptionReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<MatchUpdate | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const handleMatchChange = useCallback((payload: MatchChangePayload) => {
    // Safely extract id from new or old record
    const newRecord = payload.new as MatchRow | undefined;
    const oldRecord = payload.old as MatchRow | undefined;
    const matchId = newRecord?.id || oldRecord?.id || '';

    const update: MatchUpdate = {
      matchId,
      tournamentId,
      data: newRecord as Partial<Match>,
      timestamp: new Date().toISOString()
    };

    setLastUpdate(update);

    if (onMatchUpdate) {
      onMatchUpdate(update);
    }
  }, [tournamentId, onMatchUpdate]);

  useEffect(() => {
    // Skip if disabled or Supabase not configured
    if (!enabled || !isSupabaseConfigured()) {
      return;
    }

    let channel: ReturnType<typeof supabase.channel> | null = null;

    const subscribe = async () => {
      try {
        // Create a unique channel name for this tournament
        const channelName = `tournament-matches-${tournamentId}`;

        channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: '*', // Listen to INSERT, UPDATE, DELETE
              schema: 'public',
              table: 'tournament_matches',
              filter: `tournament_id=eq.${tournamentId}`
            },
            handleMatchChange
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setIsConnected(true);
              setError(null);
            } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
              setIsConnected(false);
              setError(new Error(`Subscription ${status.toLowerCase()}`));
            }
          });

      } catch (err) {
        setError(err instanceof Error ? err : new Error('Subscription failed'));
        setIsConnected(false);
      }
    };

    subscribe();

    // Cleanup on unmount or when dependencies change
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
        setIsConnected(false);
      }
    };
  }, [tournamentId, enabled, handleMatchChange]);

  return {
    isConnected,
    lastUpdate,
    error
  };
}

/**
 * Hook for broadcasting match updates (for the organizer/scorer)
 * This broadcasts updates to all subscribers
 */
export function useBroadcastMatchUpdate() {
  const broadcastUpdate = useCallback(async (
    tournamentId: string,
    matchId: string,
    data: Partial<Match>
  ) => {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, skipping broadcast');
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      // In a real implementation, this would update the database
      // and Realtime would automatically broadcast to subscribers
      const { error } = await (supabase
        .from('tournament_matches') as ReturnType<typeof supabase.from>)
        .update({
          ...data,
          updated_at: new Date().toISOString()
        } as Record<string, unknown>)
        .eq('id', matchId)
        .eq('tournament_id', tournamentId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (err) {
      console.error('Failed to broadcast match update:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  }, []);

  return { broadcastUpdate };
}

/**
 * Connection status indicator component helper
 */
export function getConnectionStatusColor(isConnected: boolean, error: Error | null): string {
  if (error) return 'text-red-500';
  if (isConnected) return 'text-emerald-500';
  return 'text-yellow-500';
}

export function getConnectionStatusText(isConnected: boolean, error: Error | null): string {
  if (error) return 'Déconnecté';
  if (isConnected) return 'En direct';
  return 'Connexion...';
}

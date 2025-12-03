import { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, RefreshCw } from 'lucide-react';
import { MobileMatchCard } from './MobileMatchCard';
import type { MobileMatchListProps, MatchGroup } from '@/types/arena';
import { getMatchDisplayStatus } from '@/types/arena';

type FilterType = 'all' | 'live' | 'upcoming' | 'completed';

/**
 * Mobile-optimized scrollable match list with filtering and grouping.
 * Groups matches by status/date and supports pull-to-refresh.
 */
export function MobileMatchList({
  tournament,
  role,
  onMatchSelect,
  onQuickScore,
}: MobileMatchListProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get all matches from all rounds
  const allMatches = useMemo(() => {
    return tournament.rounds.flatMap((round) =>
      round.matches.map((match) => ({
        ...match,
        roundName: round.name,
        roundNumber: round.number,
      }))
    );
  }, [tournament.rounds]);

  // Filter matches
  const filteredMatches = useMemo(() => {
    return allMatches.filter((match) => {
      const status = getMatchDisplayStatus(match);
      switch (filter) {
        case 'live':
          return status === 'live';
        case 'upcoming':
          return status === 'upcoming' || status === 'scheduled';
        case 'completed':
          return status === 'completed';
        default:
          return true;
      }
    });
  }, [allMatches, filter]);

  // Group matches
  const groupedMatches = useMemo((): MatchGroup[] => {
    const groups: MatchGroup[] = [];

    // Live matches first
    const liveMatches = filteredMatches.filter(
      (m) => getMatchDisplayStatus(m) === 'live'
    );
    if (liveMatches.length > 0) {
      groups.push({ date: 'live', label: 'En cours', matches: liveMatches });
    }

    // Upcoming matches
    const upcomingMatches = filteredMatches.filter((m) => {
      const status = getMatchDisplayStatus(m);
      return status === 'upcoming' || status === 'scheduled';
    });
    if (upcomingMatches.length > 0) {
      groups.push({ date: 'upcoming', label: 'À venir', matches: upcomingMatches });
    }

    // Completed matches
    const completedMatches = filteredMatches.filter(
      (m) => getMatchDisplayStatus(m) === 'completed'
    );
    if (completedMatches.length > 0) {
      groups.push({ date: 'completed', label: 'Terminés', matches: completedMatches });
    }

    return groups;
  }, [filteredMatches]);

  // Simulate pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // In real implementation, this would trigger a data refetch
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, []);

  const getPlayer = (playerId?: string) => {
    return tournament.players.find((p) => p.id === playerId);
  };

  const filters: { id: FilterType; label: string }[] = [
    { id: 'all', label: 'Tous' },
    { id: 'live', label: 'En cours' },
    { id: 'upcoming', label: 'À venir' },
    { id: 'completed', label: 'Terminés' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Filter bar */}
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-xl px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  filter === f.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
                {f.id === 'live' && (
                  <span className="ml-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse" />
                )}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="ml-auto p-2 text-slate-400 hover:text-white disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Match list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar-mobile px-4 py-4 pb-24">
        <AnimatePresence mode="popLayout">
          {groupedMatches.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-slate-400"
            >
              <p className="text-sm">Aucun match {filter !== 'all' && 'dans cette catégorie'}</p>
            </motion.div>
          ) : (
            groupedMatches.map((group) => (
              <motion.div
                key={group.date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mb-6"
              >
                {/* Group header */}
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-slate-300">
                    {group.label}
                  </h3>
                  <span className="text-xs text-slate-500">
                    ({group.matches.length})
                  </span>
                  {group.date === 'live' && (
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  )}
                </div>

                {/* Match cards */}
                <div className="space-y-3">
                  {group.matches.map((match, index) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <MobileMatchCard
                        match={match}
                        tournament={tournament}
                        player1={getPlayer(match.player1Id)}
                        player2={getPlayer(match.player2Id)}
                        role={role}
                        onTap={() => onMatchSelect(match)}
                        onQuickScore={onQuickScore ? () => onQuickScore(match) : undefined}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';
import type { MobileStandingsViewProps } from '@/types/arena';

interface PlayerStanding {
  id: string;
  name: string;
  rank: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
  matchesPlayed: number;
}

/**
 * Mobile-optimized standings/leaderboard view.
 * Shows player rankings with special styling for top 3.
 */
export function MobileStandingsView({
  tournament,
  onPlayerTap,
}: MobileStandingsViewProps) {
  // Calculate standings from tournament data
  const standings = useMemo((): PlayerStanding[] => {
    const playerStats = new Map<string, PlayerStanding>();

    // Initialize all players with zero stats
    tournament.players.forEach((player) => {
      playerStats.set(player.id, {
        id: player.id,
        name: player.name,
        rank: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        points: 0,
        matchesPlayed: 0,
      });
    });

    // Calculate wins/losses from matches
    tournament.rounds.forEach((round) => {
      round.matches.forEach((match) => {
        if (match.result?.winnerId && match.player1Id && match.player2Id) {
          const winner = playerStats.get(match.result.winnerId);
          const loserId =
            match.player1Id === match.result.winnerId
              ? match.player2Id
              : match.player1Id;
          const loser = playerStats.get(loserId);

          if (winner) {
            winner.wins++;
            winner.matchesPlayed++;
            winner.points += tournament.settings?.pointsForWin || 3;
          }

          if (loser) {
            loser.losses++;
            loser.matchesPlayed++;
            loser.points += tournament.settings?.pointsForLoss || 0;
          }
        }
      });
    });

    // Sort by points, then wins, then name
    const sorted = Array.from(playerStats.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.name.localeCompare(b.name);
    });

    // Assign ranks
    sorted.forEach((player, index) => {
      player.rank = index + 1;
    });

    return sorted;
  }, [tournament]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-300" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-transparent border-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-slate-400/20 to-transparent border-slate-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-transparent border-amber-600/30';
      default:
        return 'bg-slate-900/50 border-white/5';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-xl px-4 py-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Classement</h2>
          <span className="text-xs text-slate-400">
            {standings.length} joueurs
          </span>
        </div>
      </div>

      {/* Stats legend */}
      <div className="grid grid-cols-5 gap-2 px-4 py-2 text-[10px] text-slate-500 uppercase tracking-wider border-b border-white/5">
        <span className="col-span-2">Joueur</span>
        <span className="text-center">V</span>
        <span className="text-center">D</span>
        <span className="text-center">Pts</span>
      </div>

      {/* Standings list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar-mobile pb-24">
        {standings.map((player, index) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => onPlayerTap?.(player.id)}
            className={cn(
              'grid grid-cols-5 gap-2 items-center px-4 py-3 border-b transition-colors',
              getRankStyle(player.rank),
              onPlayerTap && 'cursor-pointer active:bg-white/5'
            )}
          >
            {/* Rank + Player */}
            <div className="col-span-2 flex items-center gap-3">
              {/* Rank */}
              <div className="w-8 flex items-center justify-center flex-shrink-0">
                {getRankIcon(player.rank) || (
                  <span className="text-sm font-bold text-slate-500">
                    {player.rank}
                  </span>
                )}
              </div>

              {/* Avatar + Name */}
              <PlayerAvatar name={player.name} className="w-8 h-8" />
              <span
                className={cn(
                  'font-medium truncate',
                  player.rank <= 3 ? 'text-white' : 'text-slate-300'
                )}
              >
                {player.name}
              </span>
            </div>

            {/* Stats */}
            <span className="text-center font-semibold text-emerald-400">
              {player.wins}
            </span>
            <span className="text-center font-semibold text-red-400">
              {player.losses}
            </span>
            <span
              className={cn(
                'text-center font-bold',
                player.rank === 1
                  ? 'text-yellow-400'
                  : player.rank <= 3
                    ? 'text-white'
                    : 'text-slate-300'
              )}
            >
              {player.points}
            </span>
          </motion.div>
        ))}

        {standings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Trophy className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm">Aucun classement disponible</p>
            <p className="text-xs text-slate-500">
              Les matchs n'ont pas encore commencé
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

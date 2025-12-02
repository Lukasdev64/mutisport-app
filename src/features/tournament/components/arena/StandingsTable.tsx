import type { Tournament } from '@/types/tournament';
import { TournamentEngine } from '../../logic/engine';
import { Trophy, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StandingsTableProps {
  tournament: Tournament;
  compact?: boolean;
}

export function StandingsTable({ tournament, compact = false }: StandingsTableProps) {
  const standings = TournamentEngine.getStandings(tournament);

  if (compact) {
    // Ultra compact version - just rank, name, pts
    return (
      <div className="space-y-1">
        {standings.slice(0, 8).map((standing, index) => {
          const player = tournament.players.find(p => p.id === standing.playerId);
          if (!player) return null;

          return (
            <div
              key={standing.playerId}
              className={cn(
                "flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors",
                index === 0 ? "bg-yellow-500/10" : "hover:bg-white/5"
              )}
            >
              <span className="w-5 text-center shrink-0">
                {index === 0 && <Trophy className="w-3 h-3 text-yellow-500 inline" />}
                {index === 1 && <Medal className="w-3 h-3 text-slate-400 inline" />}
                {index === 2 && <Medal className="w-3 h-3 text-amber-600 inline" />}
                {index > 2 && <span className="text-[10px] text-slate-500">{index + 1}</span>}
              </span>
              <img src={player.avatar} className="w-5 h-5 rounded-full bg-slate-800 shrink-0" />
              <span className="text-[11px] text-slate-300 truncate flex-1">{player.name}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] text-slate-500">{standing.won}W</span>
                <span className="text-xs font-bold text-blue-400">{standing.points}</span>
              </div>
            </div>
          );
        })}
        {standings.length > 8 && (
          <p className="text-[10px] text-slate-500 text-center pt-1">
            +{standings.length - 8} autres
          </p>
        )}
      </div>
    );
  }

  // Full version
  return (
    <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-sm">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-2 py-3 font-medium text-slate-400 w-8">Rk</th>
              <th className="px-2 py-3 font-medium text-slate-400 max-w-[100px]">Player</th>
              <th className="px-2 py-3 font-medium text-slate-400 text-center">P</th>
              <th className="px-2 py-3 font-medium text-slate-400 text-center">W</th>
              <th className="px-2 py-3 font-medium text-slate-400 text-center">D</th>
              <th className="px-2 py-3 font-medium text-slate-400 text-center">L</th>
              <th className="px-2 py-3 font-medium text-slate-400 text-right">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing, index) => {
              const player = tournament.players.find(p => p.id === standing.playerId);
              if (!player) return null;

              return (
                <tr
                  key={standing.playerId}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-2 py-3 font-medium text-slate-500">
                    {index === 0 && <Trophy className="w-3 h-3 text-yellow-500" />}
                    {index === 1 && <Medal className="w-3 h-3 text-slate-400" />}
                    {index === 2 && <Medal className="w-3 h-3 text-amber-700" />}
                    {index > 2 && <span className="ml-1">{index + 1}</span>}
                  </td>
                  <td className="px-2 py-3 max-w-[100px]">
                    <div className="flex items-center gap-2">
                      <img src={player.avatar} className="w-6 h-6 rounded-full bg-slate-800 shrink-0" />
                      <span className="font-medium text-white truncate">{player.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-3 text-center text-slate-400">{standing.played}</td>
                  <td className="px-2 py-3 text-center text-emerald-400 font-medium">{standing.won}</td>
                  <td className="px-2 py-3 text-center text-slate-400">{standing.drawn}</td>
                  <td className="px-2 py-3 text-center text-rose-400">{standing.lost}</td>
                  <td className="px-2 py-3 text-right font-bold text-blue-400 text-base">{standing.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

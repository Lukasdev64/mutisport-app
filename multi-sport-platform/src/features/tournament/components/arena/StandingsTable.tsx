import type { Tournament } from '@/types/tournament';
import { TournamentEngine } from '../../logic/engine';
import { motion } from 'framer-motion';
import { Trophy, Medal } from 'lucide-react';

interface StandingsTableProps {
  tournament: Tournament;
}

export function StandingsTable({ tournament }: StandingsTableProps) {
  const standings = TournamentEngine.getStandings(tournament);

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
                <motion.tr 
                  key={standing.playerId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
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
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

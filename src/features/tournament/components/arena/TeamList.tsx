import { Users } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import type { Tournament } from '@/types/tournament';

interface TeamListProps {
  tournament: Tournament;
}

export function TeamList({ tournament }: TeamListProps) {
  const teams = tournament.players;

  if (teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Users className="w-8 h-8 text-slate-600 mb-2" />
        <p className="text-sm text-slate-400">Aucune équipe</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 p-2">
      {teams.map((team) => {
        const metadata = team.metadata || {};
        const roster = metadata.players || [];
        const formation = metadata.formation || '4-4-2';

        return (
          <Card key={team.id} className="bg-white/5 border-white/10 overflow-hidden">
            {/* Header */}
            <div className="p-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{team.name}</h3>
                  <div className="flex items-center gap-2 text-[10px] text-white/50">
                    <span>{roster.length} joueurs</span>
                    {formation && <span>• {formation}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Pitch Visualization (Mini) - Only if we have roster data with positions */}
            {roster.length > 0 && roster[0].position && (
              <div className="relative h-32 bg-emerald-900/30 border-b border-white/5 overflow-hidden">
                {/* Pitch Markings */}
                <div className="absolute inset-0 flex flex-col">
                  <div className="flex-1 border-b border-white/5"></div>
                  <div className="flex-1"></div>
                </div>
                <div className="absolute inset-x-0 top-0 h-6 border-b border-white/5 mx-8"></div>
                <div className="absolute inset-x-0 bottom-0 h-6 border-t border-white/5 mx-8"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border border-white/5"></div>
                </div>

                {/* Players on Pitch */}
                <div className="absolute inset-0 p-2">
                  {/* GK */}
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                    {roster.filter((p: any) => p.position === 'GK').map((p: any) => (
                      <PlayerDot key={p.id} player={p} />
                    ))}
                  </div>
                  
                  {/* DEF */}
                  <div className="absolute bottom-8 inset-x-4 flex justify-around">
                    {roster.filter((p: any) => p.position === 'DEF').map((p: any) => (
                      <PlayerDot key={p.id} player={p} />
                    ))}
                  </div>

                  {/* MID */}
                  <div className="absolute top-1/2 -translate-y-1/2 inset-x-4 flex justify-around">
                    {roster.filter((p: any) => p.position === 'MID').map((p: any) => (
                      <PlayerDot key={p.id} player={p} />
                    ))}
                  </div>

                  {/* FWD */}
                  <div className="absolute top-6 inset-x-4 flex justify-around">
                    {roster.filter((p: any) => p.position === 'FWD').map((p: any) => (
                      <PlayerDot key={p.id} player={p} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Roster List */}
            {roster.length > 0 && (
              <div className="p-2 space-y-1 bg-black/20">
                {roster.map((player: any) => (
                  <div 
                    key={player.id || player.name} // Fallback key
                    className="flex items-center gap-2 p-1.5 rounded bg-white/5 border border-white/5"
                  >
                    <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-[10px] font-mono font-bold text-white/70">
                      {player.number || '-'}
                    </div>
                    <span className="flex-1 text-xs text-white/90 truncate">{player.name}</span>
                    
                    {player.position && (
                      <span className={cn(
                        "text-[9px] px-1 py-0.5 rounded border",
                        player.position === 'GK' ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
                        player.position === 'DEF' ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                        player.position === 'MID' ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
                        "bg-red-500/20 text-red-400 border-red-500/30"
                      )}>
                        {player.position}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function PlayerDot({ player }: { player: any }) {
  return (
    <div className="group relative flex flex-col items-center">
      <div className={cn(
        "w-4 h-4 rounded-full border flex items-center justify-center text-[8px] font-bold shadow-sm cursor-help",
        player.position === 'GK' ? "bg-yellow-500 border-yellow-300 text-black" :
        player.position === 'DEF' ? "bg-blue-600 border-blue-400 text-white" :
        player.position === 'MID' ? "bg-emerald-600 border-emerald-400 text-white" :
        "bg-red-600 border-red-400 text-white"
      )}>
        {player.number || ''}
      </div>
      <div className="absolute -bottom-4 whitespace-nowrap text-[8px] font-medium text-white/90 bg-black/50 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        {player.name}
      </div>
    </div>
  );
}

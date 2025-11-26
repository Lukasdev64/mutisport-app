import { useShallow } from 'zustand/react/shallow';
import { useWizardStore } from '../../store/wizardStore';
import { Trophy, Users, Calendar, CheckCircle2 } from 'lucide-react';

export function TournamentSummary() {
  // State values - use useShallow to prevent unnecessary re-renders
  const { tournamentName, format, players, selectedPlayers } = useWizardStore(
    useShallow((s) => ({
      tournamentName: s.tournamentName,
      format: s.format,
      players: s.players,
      selectedPlayers: s.selectedPlayers
    }))
  );
  
  // Use selectedPlayers if available (Planned mode), fallback to players (Instant mode)
  const finalPlayers = selectedPlayers.length > 0 ? selectedPlayers : players;

  return (
    <div className="space-y-8">
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 flex items-start gap-4">
        <div className="p-3 bg-emerald-500/20 rounded-full text-emerald-400">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-heading font-semibold text-emerald-400">Ready to Launch!</h3>
          <p className="text-emerald-200/60 mt-1">
            Review your tournament details below before starting.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-3 text-slate-400">
            <Trophy className="w-5 h-5" />
            <span className="text-sm font-medium">Tournament Name</span>
          </div>
          <p className="text-xl font-bold text-white">{tournamentName}</p>
        </div>

        <div className="glass-panel p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-3 text-slate-400">
            <Calendar className="w-5 h-5" />
            <span className="text-sm font-medium">Format</span>
          </div>
          <p className="text-xl font-bold text-white capitalize">
            {format?.replace('_', ' ')}
          </p>
        </div>

        <div className="glass-panel p-6 rounded-xl space-y-4">
          <div className="flex items-center gap-3 text-slate-400">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">Participants</span>
          </div>
          <p className="text-xl font-bold text-white">{finalPlayers.length} Players</p>
        </div>
      </div>

      <div className="glass-panel rounded-xl p-6">
        <h4 className="text-sm font-medium text-slate-400 mb-4">
          Liste des Participants ({finalPlayers.length})
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {finalPlayers.map((player) => (
            <div 
              key={player.id}
              className="flex items-center gap-3 bg-slate-800/50 border border-white/5 rounded-lg p-3 hover:bg-slate-800 transition-colors"
            >
              {player.avatar && (
                <img 
                  src={player.avatar} 
                  alt={player.name}
                  className="w-10 h-10 rounded-full border-2 border-blue-500/20"
                />
              )}
              {!player.avatar && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {player.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {player.name}
                </div>
                {player.email && (
                  <div className="text-xs text-slate-500 truncate">
                    {player.email}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

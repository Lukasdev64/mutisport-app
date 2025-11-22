import { useWizardStore } from '../../store/wizardStore';
import { Trophy, Users, Calendar, CheckCircle2 } from 'lucide-react';

export function TournamentSummary() {
  const { tournamentName, format, players } = useWizardStore();

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
          <p className="text-xl font-bold text-white">{players.length} Players</p>
        </div>
      </div>

      <div className="glass-panel rounded-xl p-6">
        <h4 className="text-sm font-medium text-slate-400 mb-4">Player List</h4>
        <div className="flex flex-wrap gap-2">
          {players.map((player) => (
            <span 
              key={player.id}
              className="px-3 py-1 rounded-full bg-slate-800 border border-white/5 text-sm text-slate-300"
            >
              {player.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

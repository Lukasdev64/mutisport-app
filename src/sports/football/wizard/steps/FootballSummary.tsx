import { Trophy, Calendar, Users, Settings } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useFootballWizardStore } from '../store';

export function FootballSummary() {
  const { tournamentName, venue, startDate, format, config, teams } = useFootballWizardStore();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Prêt pour le Coup d'Envoi ?</h2>
        <p className="text-white/60">Vérifiez les paramètres de votre tournoi avant de commencer</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        <Card className="p-4 bg-white/5 border-white/10 space-y-4">
          <div className="flex items-center gap-3 text-emerald-400 mb-2">
            <Trophy className="w-5 h-5" />
            <h3 className="font-semibold">Infos Générales</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Nom</span>
              <span className="text-white font-medium">{tournamentName || 'Tournoi Sans Titre'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Lieu</span>
              <span className="text-white font-medium">{venue || 'Non spécifié'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Date</span>
              <span className="text-white font-medium">{new Date(startDate).toLocaleDateString()}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white/5 border-white/10 space-y-4">
          <div className="flex items-center gap-3 text-blue-400 mb-2">
            <Settings className="w-5 h-5" />
            <h3 className="font-semibold">Format & Règles</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Format</span>
              <span className="text-white font-medium capitalize">{format?.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Durée du Match</span>
              <span className="text-white font-medium">{config.matchDuration} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Taille de l'Équipe</span>
              <span className="text-white font-medium">{config.playersPerTeam}v{config.playersPerTeam}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white/5 border-white/10 space-y-4 md:col-span-2">
          <div className="flex items-center gap-3 text-purple-400 mb-2">
            <Users className="w-5 h-5" />
            <h3 className="font-semibold">Équipes ({teams.length})</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {teams.map(team => (
              <div key={team.id} className="px-3 py-2 rounded bg-white/10 text-xs text-white flex flex-col gap-1">
                <span className="font-bold">{team.name}</span>
                <span className="text-white/50 text-[10px]">{team.players.length} joueurs</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

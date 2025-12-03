import { Input } from '@/components/ui/input';
import { useFootballWizardStore } from '../store';

export function FootballTournamentSetup() {
  const { tournamentName, venue, description, startDate, setTournamentInfo } = useFootballWizardStore();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Détails du Tournoi</h2>
        <p className="text-white/60">Informations de base sur votre tournoi</p>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">Nom du Tournoi</label>
          <Input
            value={tournamentName}
            onChange={(e) => setTournamentInfo({ tournamentName: e.target.value })}
            placeholder="ex: Coupe du Dimanche"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">Date</label>
          <Input
            type="date"
            value={new Date(startDate).toISOString().split('T')[0]}
            onChange={(e) => setTournamentInfo({ startDate: new Date(e.target.value) })}
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">Lieu</label>
          <Input
            value={venue}
            onChange={(e) => setTournamentInfo({ venue: e.target.value })}
            placeholder="ex: Stade Municipal Terrain 1"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-white/80">Description (Optionnel)</label>
          <Input
            value={description}
            onChange={(e) => setTournamentInfo({ description: e.target.value })}
            placeholder="Brève description de l'événement..."
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
      </div>
    </div>
  );
}

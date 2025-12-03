import { Trophy, Users, GitBranch, RotateCw, Grid, ListOrdered } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/input';
import { FootballRulesModule } from '../../components/FootballRulesModule';
import { useFootballWizardStore } from '../store';
import type { FootballFormatType, FootballTournamentConfig } from '../../models/tournament-formats';

export function FootballFormatAndRules() {
  const { 
    footballFormatConfig, 
    setFootballFormatConfig, 
    config, 
    setConfig,
    setFormat, // Legacy setter for compatibility
    mode,
    tournamentName,
    setTournamentInfo
  } = useFootballWizardStore();

  const currentType = footballFormatConfig?.type || 'ELIMINATION_DIRECTE';

  const formats: { id: FootballFormatType; label: string; icon: any; description: string }[] = [
    {
      id: 'ELIMINATION_DIRECTE',
      label: 'Élimination Directe',
      icon: GitBranch,
      description: 'Tableau standard. Le perdant est éliminé.'
    },
    {
      id: 'CHAMPIONNAT',
      label: 'Championnat',
      icon: RotateCw,
      description: 'Tout le monde joue contre tout le monde. Classement par points.'
    },
    {
      id: 'PHASE_POULES',
      label: 'Phase de Groupes',
      icon: Grid,
      description: 'Groupes suivis de qualifications.'
    },
    {
      id: 'LIGUE_PLUS_PLAYOFFS',
      label: 'Championnat + Playoffs',
      icon: Trophy,
      description: 'Saison régulière puis phases finales pour les meilleures équipes.'
    }
  ];

  const handleFormatSelect = (type: FootballFormatType) => {
    // Create default config for the selected type
    const baseConfig = {
      matchDuration: config.matchDuration || 90,
      extraTime: false,
      penaltyShootout: false,
      points: { win: 3, draw: 1, loss: 0 },
      tieBreakers: ['points', 'difference_buts', 'buts_marques'] as any
    };

    let newConfig: FootballTournamentConfig;

    switch (type) {
      case 'CHAMPIONNAT':
        newConfig = { ...baseConfig, type, hasReturnLeg: false };
        setFormat('round_robin');
        break;
      case 'ELIMINATION_DIRECTE':
        newConfig = { ...baseConfig, type, hasReturnLeg: false, awayGoalsRule: false, hasThirdPlaceMatch: false };
        setFormat('single_elimination');
        break;
      case 'PHASE_POULES':
        newConfig = { ...baseConfig, type, numberOfGroups: 2, qualifiersPerGroup: 2, bestThirdsQualifiers: 0, hasReturnLeg: false };
        setFormat('round_robin'); // Approximate
        break;
      case 'LIGUE_PLUS_PLAYOFFS':
        newConfig = { 
          ...baseConfig, 
          type, 
          regularSeason: { ...baseConfig, type: 'CHAMPIONNAT', hasReturnLeg: false },
          playoffs: { ...baseConfig, type: 'ELIMINATION_DIRECTE', hasReturnLeg: false, awayGoalsRule: false, hasThirdPlaceMatch: false },
          playoffTeamsCount: 4
        };
        setFormat('round_robin'); // Approximate
        break;
      default:
        newConfig = { ...baseConfig, type: 'ELIMINATION_DIRECTE', hasReturnLeg: false, awayGoalsRule: false, hasThirdPlaceMatch: false };
        setFormat('single_elimination');
    }

    setFootballFormatConfig(newConfig);
  };

  // Initialize if null
  if (!footballFormatConfig) {
    // Use setTimeout to avoid state update during render
    setTimeout(() => handleFormatSelect('ELIMINATION_DIRECTE'), 0);
  }

  return (
    <div className="space-y-8">
      {/* Name Input for Instant Mode */}
      {mode === 'instant' && (
        <div className="max-w-md mx-auto space-y-2">
          <label className="text-sm font-medium text-white/80">Nom du Tournoi</label>
          <Input
            value={tournamentName}
            onChange={(e) => setTournamentInfo({ tournamentName: e.target.value })}
            placeholder="ex: Tournoi Express"
            className="bg-white/5 border-white/10 text-white"
          />
        </div>
      )}

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Format & Règles</h2>
        <p className="text-white/60">Configurez le déroulement du tournoi</p>
      </div>

      {/* Format Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Tournament Format</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {formats.map((f) => (
            <Card
              key={f.id}
              className={`p-4 cursor-pointer transition-all hover:border-emerald-500/50 ${
                currentType === f.id ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-white/5'
              }`}
              onClick={() => handleFormatSelect(f.id)}
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`p-3 rounded-full ${
                  currentType === f.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/60'
                }`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-medium text-white">{f.label}</div>
                  <div className="text-xs text-white/50 mt-1">{f.description}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Specific Configuration based on Format */}
      {currentType === 'PHASE_POULES' && footballFormatConfig?.type === 'PHASE_POULES' && (
        <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <h3 className="text-lg font-semibold text-white">Group Stage Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-white/60">Number of Groups</label>
              <Input 
                type="number" 
                min={2} 
                max={16}
                value={footballFormatConfig.numberOfGroups}
                onChange={(e) => setFootballFormatConfig({ ...footballFormatConfig, numberOfGroups: parseInt(e.target.value) || 2 })}
                className="bg-black/20 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/60">Qualifiers per Group</label>
              <Input 
                type="number" 
                min={1} 
                max={4}
                value={footballFormatConfig.qualifiersPerGroup}
                onChange={(e) => setFootballFormatConfig({ ...footballFormatConfig, qualifiersPerGroup: parseInt(e.target.value) || 1 })}
                className="bg-black/20 border-white/10"
              />
            </div>
          </div>
        </div>
      )}

      {currentType === 'CHAMPIONNAT' && footballFormatConfig?.type === 'CHAMPIONNAT' && (
        <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
          <h3 className="text-lg font-semibold text-white">League Settings</h3>
          <div className="flex items-center gap-2">
             <input 
                type="checkbox"
                checked={footballFormatConfig.hasReturnLeg}
                onChange={(e) => setFootballFormatConfig({ ...footballFormatConfig, hasReturnLeg: e.target.checked })}
                className="w-4 h-4 rounded border-white/30 bg-white/10 text-emerald-500 focus:ring-emerald-500"
             />
             <label className="text-sm text-white">Home & Away Matches (Aller-Retour)</label>
          </div>
        </div>
      )}

      {/* Match Rules */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Match Rules</h3>
        <FootballRulesModule
          config={config}
          onChange={setConfig}
          readOnly={false}
        />
      </div>
    </div>
  );
}

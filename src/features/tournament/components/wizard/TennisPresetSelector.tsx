import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TENNIS_TOURNAMENT_PRESETS, 
  type TournamentCategory 
} from '@/sports/tennis/tournamentPresets';
import { PresetCard } from '@/sports/tennis/components/PresetCard';
import { Settings2 } from 'lucide-react';

interface TennisPresetSelectorProps {
  selectedPresetId?: string;
  onSelectPreset: (presetId: string) => void;
  onCustomize: () => void;
}

export function TennisPresetSelector({
  selectedPresetId,
  onSelectPreset,
  onCustomize
}: TennisPresetSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<TournamentCategory | 'all'>('all');

  const categories: Array<{ id: TournamentCategory | 'all'; label: string }> = [
    { id: 'all', label: 'Tous' },
    { id: 'grand_slam', label: 'Grand Chelem' },
    { id: 'atp', label: 'ATP' },
    { id: 'wta', label: 'WTA' },
    { id: 'team', label: 'Équipes' },
    { id: 'junior', label: 'Junior' }
  ];

  const filteredPresets = selectedCategory === 'all'
    ? TENNIS_TOURNAMENT_PRESETS.filter(p => p.id !== 'custom')
    : TENNIS_TOURNAMENT_PRESETS.filter(p => p.category === selectedCategory && p.id !== 'custom');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-6xl mx-auto"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Type de Tournoi</h2>
        <p className="text-slate-400">
          Sélectionnez un format officiel ou créez vos propres règles
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700 border border-white/10'
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>

      {/* Presets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPresets.map(preset => (
          <PresetCard
            key={preset.id}
            preset={preset}
            selected={selectedPresetId === preset.id}
            onClick={() => onSelectPreset(preset.id)}
          />
        ))}
      </div>

      {/* Custom Configuration Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onCustomize}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800/50 border border-white/10 hover:bg-slate-700 hover:border-white/20 transition-all text-white font-medium"
        >
          <Settings2 className="w-5 h-5" />
          <span>Configuration Personnalisée</span>
        </button>
      </div>

      {/* Selected preset info */}
      {selectedPresetId && selectedPresetId !== 'custom' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6"
        >
          <h3 className="text-sm font-medium text-blue-400 mb-3">Règles Sélectionnées</h3>
          {(() => {
            const preset = TENNIS_TOURNAMENT_PRESETS.find(p => p.id === selectedPresetId);
            if (!preset) return null;
            const { config } = preset;
            
            return (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Format:</span>
                  <span className="text-white font-medium">
                    {config.format === 'best_of_5' ? 'Meilleur des 5 sets' : 'Meilleur des 3 sets'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Surface:</span>
                  <span className="text-white font-medium capitalize">{config.surface}</span>
                </div>
                {config.finalSetTiebreak && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tie-break décisif:</span>
                    <span className="text-white font-medium">
                      {config.finalSetTiebreakPoints === 10 ? 'Super (10 pts)' : 'Standard (7 pts)'}
                    </span>
                  </div>
                )}
                {config.decidingPointAtDeuce && (
                  <div className="flex justify-between col-span-2">
                    <span className="text-slate-400">Scoring:</span>
                    <span className="text-yellow-400 font-medium">No-Ad (Point décisif)</span>
                  </div>
                )}
              </div>
            );
          })()}
        </motion.div>
      )}
    </motion.div>
  );
}

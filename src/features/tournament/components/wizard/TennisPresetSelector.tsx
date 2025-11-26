import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TENNIS_TOURNAMENT_PRESETS,
  type TournamentCategory
} from '@/sports/tennis/tournamentPresets';
import { PresetCard } from '@/sports/tennis/components/PresetCard';
import { useFavoritePresets } from '@/sports/tennis/hooks/useFavoritePresets';
import { Settings2, Search, Star } from 'lucide-react';

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
  const [selectedCategory, setSelectedCategory] = useState<TournamentCategory | 'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { favorites, toggleFavorite, isFavorite, hasFavorites } = useFavoritePresets();

  const categories: Array<{ id: TournamentCategory | 'all' | 'favorites'; label: string; icon?: React.ReactNode }> = [
    { id: 'all', label: 'Tous' },
    { id: 'favorites', label: 'Favoris', icon: <Star className="w-3 h-3 fill-current" /> },
    { id: 'grand_slam', label: 'Grand Chelem' },
    { id: 'atp', label: 'ATP' },
    { id: 'wta', label: 'WTA' },
    { id: 'team', label: 'Équipes' },
    { id: 'junior', label: 'Junior' }
  ];

  const filteredPresets = useMemo(() => {
    let presets = TENNIS_TOURNAMENT_PRESETS.filter(p => p.id !== 'custom');

    // Filter by category
    if (selectedCategory === 'favorites') {
      presets = presets.filter(p => favorites.includes(p.id));
    } else if (selectedCategory !== 'all') {
      presets = presets.filter(p => p.category === selectedCategory);
    }

    // Filter by search query (fuzzy search on name and description)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      presets = presets.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.config.surface?.toLowerCase().includes(query)
      );
    }

    return presets;
  }, [selectedCategory, searchQuery, favorites]);

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

      {/* Search Input */}
      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher un format (ex: Roland Garros, terre battue...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all touch-target"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map(category => {
          // Hide favorites tab if no favorites
          if (category.id === 'favorites' && !hasFavorites) return null;

          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                selectedCategory === category.id
                  ? category.id === 'favorites'
                    ? 'bg-yellow-500 text-black shadow-lg'
                    : 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700 border border-white/10'
              }`}
            >
              {category.icon}
              {category.label}
              {category.id === 'favorites' && (
                <span className="text-xs opacity-70">({favorites.length})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Presets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPresets.map(preset => (
          <PresetCard
            key={preset.id}
            preset={preset}
            selected={selectedPresetId === preset.id}
            onClick={() => onSelectPreset(preset.id)}
            isFavorite={isFavorite(preset.id)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>

      {/* Empty state for favorites */}
      {selectedCategory === 'favorites' && filteredPresets.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <Star className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Aucun favori pour le moment</p>
          <p className="text-sm mt-1">Cliquez sur l'étoile d'un preset pour l'ajouter</p>
        </div>
      )}

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

import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TournamentPreset } from '../tournamentPresets';

interface PresetCardProps {
  preset: TournamentPreset;
  selected: boolean;
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (presetId: string) => void;
}

export function PresetCard({ preset, selected, onClick, isFavorite = false, onToggleFavorite }: PresetCardProps) {
  const surfaceColors = {
    clay: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
    hard: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    grass: 'from-green-500/20 to-green-600/10 border-green-500/30',
    indoor: 'from-slate-500/20 to-slate-600/10 border-slate-500/30'
  };

  const selectedStyle = selected
    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20'
    : 'border-white/10 hover:border-white/20 hover:bg-white/5';

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative p-4 rounded-xl border-2 transition-all text-left w-full',
        selectedStyle
      )}
    >
      {/* Selected Indicator */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 bg-emerald-500 rounded-full p-1"
        >
          <Check className="w-4 h-4 text-white" />
        </motion.div>
      )}

      {/* Favorite Button */}
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(preset.id);
          }}
          className={cn(
            "absolute top-2 right-2 p-1.5 rounded-full transition-all z-10",
            selected ? "right-10" : "right-2",
            isFavorite
              ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
              : "bg-slate-800/50 text-slate-500 hover:text-yellow-400 hover:bg-slate-700"
          )}
        >
          <Star className={cn("w-4 h-4", isFavorite && "fill-current")} />
        </button>
      )}

      {/* Category Badge */}
      {preset.isOfficial && (
        <div className="absolute top-2 left-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-medium">
            Officiel
          </span>
        </div>
      )}

      {/* Tournament Emoji/Logo */}
      <div className="text-4xl mb-3 mt-6">{preset.emoji}</div>

      {/* Name */}
      <h3 className="font-bold text-white text-lg mb-1">{preset.name}</h3>

      {/* Description */}
      <p className="text-sm text-slate-400 mb-3">{preset.description}</p>

      {/* Surface Indicator */}
      <div
        className={cn(
          'w-full h-1 rounded-full bg-gradient-to-r',
          surfaceColors[preset.config.surface]
        )}
      />

      {/* Quick Info Tags */}
      <div className="flex flex-wrap gap-2 mt-3">
        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
          {preset.config.format === 'best_of_5' ? 'Best of 5' : 'Best of 3'}
        </span>
        {preset.config.decidingPointAtDeuce && (
          <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
            No-Ad
          </span>
        )}
        {!preset.config.letRule && (
          <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300">
            No-Let
          </span>
        )}
      </div>
    </motion.button>
  );
}

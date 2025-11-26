/**
 * Tennis Format and Rules Step
 *
 * Tennis-specific configuration:
 * - Preset selection (ATP, WTA, Grand Slam, etc.)
 * - Rules customization
 * - Tournament format (bracket type)
 */

import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { motion } from 'framer-motion';
import { Trophy, GitMerge, Users, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TournamentFormat } from '@/types/tournament';
import type { TennisMatchConfig } from '@/types/tennis';

import { useTennisWizardStore } from '../store';
import { TennisPresetSelector } from '@/features/tournament/components/wizard/TennisPresetSelector';
import { TennisRulesCustomizer } from '@/features/tournament/components/wizard/TennisRulesCustomizer';
import { TENNIS_TOURNAMENT_PRESETS } from '../../tournamentPresets';

const FORMAT_OPTIONS = [
  {
    id: 'single_elimination' as TournamentFormat,
    name: 'Simple Élimination',
    description: 'Chaque défaite élimine',
    icon: GitMerge,
    color: 'blue',
  },
  {
    id: 'round_robin' as TournamentFormat,
    name: 'Round Robin',
    description: 'Tous contre tous',
    icon: Users,
    color: 'emerald',
    maxPlayers: 12,
  },
  {
    id: 'swiss' as TournamentFormat,
    name: 'Swiss System',
    description: 'Appariement par niveau',
    icon: Trophy,
    color: 'amber',
  },
];

export function TennisFormatAndRules() {
  const { presetId, config, format } = useTennisWizardStore(useShallow((s) => ({
    presetId: s.presetId,
    config: s.config,
    format: s.format,
  })));

  const setPreset = useTennisWizardStore((s) => s.setPreset);
  const setConfig = useTennisWizardStore((s) => s.setConfig);
  const setFormat = useTennisWizardStore((s) => s.setFormat);

  const [viewMode, setViewMode] = useState<'preset' | 'custom' | 'summary'>(
    presetId ? 'summary' : 'preset'
  );

  const handleSelectPreset = (selectedPresetId: string) => {
    setPreset(selectedPresetId);
    setViewMode('summary');
  };

  const handleCustomize = () => {
    if (!config) {
      // Initialize with default config
      setConfig({
        format: 'best_of_3',
        surface: 'hard',
        tiebreakAt: 6,
        finalSetTiebreak: true,
        finalSetTiebreakPoints: 10,
        decidingPointAtDeuce: false,
        letRule: true,
        coachingAllowed: false,
        warmupMinutes: 5,
        changeoverSeconds: 90,
        betweenPointsSeconds: 25,
      });
    }
    setViewMode('custom');
  };

  const handleConfigChange = (newConfig: TennisMatchConfig) => {
    setConfig(newConfig);
  };

  const selectedPreset = TENNIS_TOURNAMENT_PRESETS.find(p => p.id === presetId);

  // Preset selection view
  if (viewMode === 'preset') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Règles du Match</h2>
          <p className="text-slate-400">Choisissez un preset ou personnalisez vos règles</p>
        </div>

        <TennisPresetSelector
          selectedPresetId={presetId ?? undefined}
          onSelectPreset={handleSelectPreset}
          onCustomize={handleCustomize}
        />
      </motion.div>
    );
  }

  // Custom rules view
  if (viewMode === 'custom' && config) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">Personnaliser les Règles</h2>
          <p className="text-slate-400">Configurez chaque aspect du match</p>
        </div>

        <TennisRulesCustomizer config={config} onChange={handleConfigChange} />

        <div className="flex justify-center">
          <button
            onClick={() => setViewMode('preset')}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-800/50 border border-white/10 rounded-lg hover:bg-slate-700 transition-colors text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux presets
          </button>
        </div>
      </motion.div>
    );
  }

  // Summary view (after selecting preset)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Format & Règles</h2>
        <p className="text-slate-400">Configuration de votre tournoi tennis</p>
      </div>

      {/* Selected Preset Summary */}
      {selectedPreset && config && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-xl p-6"
        >
          <div className="flex items-start gap-4 mb-4">
            <div className="text-4xl">{selectedPreset.emoji}</div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white">{selectedPreset.name}</h3>
              <p className="text-sm text-slate-300">{selectedPreset.description}</p>
            </div>
            <button
              onClick={() => setViewMode('preset')}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Changer
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-slate-500 block">Format</span>
              <span className="text-white font-medium">
                {config.format === 'best_of_5' ? '5 sets' : '3 sets'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Surface</span>
              <span className="text-white font-medium capitalize">{config.surface}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Tie-break</span>
              <span className="text-white font-medium">À {config.tiebreakAt}-{config.tiebreakAt}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Scoring</span>
              <span className="text-white font-medium">
                {config.decidingPointAtDeuce ? 'No-Ad' : 'Avantage'}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tournament Format Selection */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          Format du Tournoi
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FORMAT_OPTIONS.map((option) => {
            const isSelected = format === option.id;
            const Icon = option.icon;

            return (
              <button
                key={option.id}
                onClick={() => setFormat(option.id)}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all",
                  isSelected
                    ? "bg-emerald-500/20 border-emerald-500/50 ring-2 ring-emerald-500"
                    : "bg-slate-900/50 border-white/10 hover:border-white/20"
                )}
              >
                <Icon className={cn(
                  "w-6 h-6 mb-2",
                  isSelected ? "text-emerald-400" : "text-slate-400"
                )} />
                <h4 className="font-bold text-white">{option.name}</h4>
                <p className="text-xs text-slate-400">{option.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { TennisMatchConfig, TennisSurface, TennisFormat } from '@/types/tennis';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TennisRulesCustomizerProps {
  config: TennisMatchConfig;
  onChange: (config: TennisMatchConfig) => void;
}

interface ConfigSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function ConfigSection({ title, children, defaultOpen = false }: ConfigSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-900/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-slate-800/50 hover:bg-slate-800 transition-colors"
      >
        <h3 className="font-semibold text-white">{title}</h3>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-slate-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400" />
        )}
      </button>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="p-4 space-y-4"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

export function TennisRulesCustomizer({ config, onChange }: TennisRulesCustomizerProps) {
  const updateConfig = (updates: Partial<TennisMatchConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Personnalisation des Règles</h2>
        <p className="text-slate-400">Configurez les règles du tournoi selon vos besoins</p>
      </div>

      <div className="space-y-4">
        {/* Format & Surface */}
        <ConfigSection title="Format & Surface" defaultOpen={true}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Format */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Format de Match</label>
              <select
                value={config.format}
                onChange={(e) => updateConfig({ format: e.target.value as TennisFormat })}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="best_of_3">Meilleur des 3 sets</option>
                <option value="best_of_5">Meilleur des 5 sets</option>
              </select>
            </div>

            {/* Surface */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Surface</label>
              <select
                value={config.surface}
                onChange={(e) => updateConfig({ surface: e.target.value as TennisSurface })}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="hard">Dur (Hard Court)</option>
                <option value="clay">Terre battue (Clay)</option>
                <option value="grass">Gazon (Grass)</option>
                <option value="indoor">Indoor (Synthétique)</option>
              </select>
            </div>
          </div>
        </ConfigSection>

        {/* Tie-break Rules */}
        <ConfigSection title="Règles de Tie-break">
          <div className="space-y-4">
            {/* Tiebreak At */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Tie-break à égalité de jeux
              </label>
              <input
                type="number"
                min={5}
                max={7}
                value={config.tiebreakAt}
                onChange={(e) => updateConfig({ tiebreakAt: parseInt(e.target.value) })}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <p className="text-xs text-slate-500">Généralement 6 (tie-break à 6-6)</p>
            </div>

            {/* Final Set Tiebreak */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-300">Tie-break au set décisif</div>
                <p className="text-xs text-slate-500">
                  Si désactivé, le dernier set continue jusqu'à 2 jeux d'écart
                </p>
              </div>
              <button
                onClick={() => updateConfig({ finalSetTiebreak: !config.finalSetTiebreak })}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors',
                  config.finalSetTiebreak ? 'bg-blue-600' : 'bg-slate-700'
                )}
              >
                <motion.div
                  animate={{ x: config.finalSetTiebreak ? 24 : 2 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full"
                />
              </button>
            </div>

            {/* Final Set Tiebreak Points */}
            {config.finalSetTiebreak && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">
                  Points du tie-break décisif
                </label>
                <select
                  value={config.finalSetTiebreakPoints || 7}
                  onChange={(e) =>
                    updateConfig({ finalSetTiebreakPoints: parseInt(e.target.value) })
                  }
                  className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value={7}>Standard (7 points)</option>
                  <option value={10}>Super Tie-break (10 points)</option>
                </select>
              </div>
            )}
          </div>
        </ConfigSection>

        {/* Scoring Variations */}
        <ConfigSection title="Variations de Score">
          <div className="space-y-4">
            {/* No-Ad */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-300">Point décisif à égalité (No-Ad)</div>
                <p className="text-xs text-slate-500">
                  À 40-40, un seul point décisif au lieu de l'avantage
                </p>
              </div>
              <button
                onClick={() => updateConfig({ decidingPointAtDeuce: !config.decidingPointAtDeuce })}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors',
                  config.decidingPointAtDeuce ? 'bg-blue-600' : 'bg-slate-700'
                )}
              >
                <motion.div
                  animate={{ x: config.decidingPointAtDeuce ? 24 : 2 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full"
                />
              </button>
            </div>
          </div>
        </ConfigSection>

        {/* Service Rules */}
        <ConfigSection title="Règles de Service">
          <div className="space-y-4">
            {/* Let Rule */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-300">Let au service</div>
                <p className="text-xs text-slate-500">
                  Si désactivé (No-Let), le let est joué au lieu d'être refait
                </p>
              </div>
              <button
                onClick={() => updateConfig({ letRule: !config.letRule })}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors',
                  config.letRule ? 'bg-blue-600' : 'bg-slate-700'
                )}
              >
                <motion.div
                  animate={{ x: config.letRule ? 24 : 2 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full"
                />
              </button>
            </div>
          </div>
        </ConfigSection>

        {/* Match Rules */}
        <ConfigSection title="Règles de Match">
          <div className="space-y-4">
            {/* Coaching */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-300">Coaching autorisé</div>
                <p className="text-xs text-slate-500">Coaching sur le terrain pendant les changements de côté</p>
              </div>
              <button
                onClick={() => updateConfig({ coachingAllowed: !config.coachingAllowed })}
                className={cn(
                  'relative w-12 h-6 rounded-full transition-colors',
                  config.coachingAllowed ? 'bg-blue-600' : 'bg-slate-700'
                )}
              >
                <motion.div
                  animate={{ x: config.coachingAllowed ? 24 : 2 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full"
                />
              </button>
            </div>

            {/* Challenges */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                Challenges vidéo par set (Hawk-Eye)
              </label>
              <input
                type="number"
                min={0}
                max={10}
                value={config.challengesPerSet || 0}
                onChange={(e) =>
                  updateConfig({ challengesPerSet: parseInt(e.target.value) || undefined })
                }
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <p className="text-xs text-slate-500">0 pour désactiver, généralement 3</p>
            </div>
          </div>
        </ConfigSection>

        {/* Time Rules */}
        <ConfigSection title="Temps Réglementaires">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Warmup */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Échauffement (min)</label>
              <input
                type="number"
                min={0}
                max={15}
                value={config.warmupMinutes}
                onChange={(e) => updateConfig({ warmupMinutes: parseInt(e.target.value) })}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            {/* Changeover */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Changement (sec)</label>
              <input
                type="number"
                min={30}
                max={120}
                step={15}
                value={config.changeoverSeconds}
                onChange={(e) => updateConfig({ changeoverSeconds: parseInt(e.target.value) })}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            {/* Between Points */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Entre points (sec)</label>
              <input
                type="number"
                min={15}
                max={30}
                step={5}
                value={config.betweenPointsSeconds}
                onChange={(e) => updateConfig({ betweenPointsSeconds: parseInt(e.target.value) })}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
        </ConfigSection>
      </div>
    </motion.div>
  );
}

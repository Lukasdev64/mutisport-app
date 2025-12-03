import { Clock, Users, Trophy } from 'lucide-react';
import type { SportRulesModuleProps } from '@/sports/core/types';
import type { FootballMatchConfig, FootballFormat } from '@/types/football';
import { FOOTBALL_CONFIG } from '../config';
import { Input } from '@/components/ui/input';

export function FootballRulesModule({ config, onChange, readOnly = true, compact = false }: SportRulesModuleProps) {
  const footballConfig = config as FootballMatchConfig;

  const updateConfig = (updates: Partial<FootballMatchConfig>) => {
    if (onChange) {
      onChange({ ...footballConfig, ...updates });
    }
  };

  if (compact) {
    return (
      <div className="text-xs text-slate-400 space-y-1">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          <span>{footballConfig.halvesCount} x {footballConfig.halfDurationMinutes} min</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-3 h-3" />
          <span>{footballConfig.format === 'standard' ? '11 vs 11' : '5 vs 5'}</span>
        </div>
      </div>
    );
  }

  if (readOnly) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-slate-800/50 border border-white/5">
            <div className="flex items-center gap-2 mb-3 text-emerald-400">
              <Clock className="w-5 h-5" />
              <h3 className="font-medium">Durée du match</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex justify-between">
                <span>Mi-temps</span>
                <span className="text-white">{footballConfig.halvesCount}</span>
              </li>
              <li className="flex justify-between">
                <span>Durée mi-temps</span>
                <span className="text-white">{footballConfig.halfDurationMinutes} min</span>
              </li>
              {footballConfig.extraTimeEnabled && (
                <li className="flex justify-between">
                  <span>Prolongations</span>
                  <span className="text-white">2 x {footballConfig.extraTimeDurationMinutes} min</span>
                </li>
              )}
            </ul>
          </div>

          <div className="p-4 rounded-lg bg-slate-800/50 border border-white/5">
            <div className="flex items-center gap-2 mb-3 text-blue-400">
              <Trophy className="w-5 h-5" />
              <h3 className="font-medium">Format</h3>
            </div>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex justify-between">
                <span>Type</span>
                <span className="text-white capitalize">{footballConfig.format.replace(/_/g, ' ')}</span>
              </li>
              <li className="flex justify-between">
                <span>Tirs au but</span>
                <span className="text-white">{footballConfig.penaltiesEnabled ? 'Oui' : 'Non'}</span>
              </li>
              <li className="flex justify-between">
                <span>Remplacements</span>
                <span className="text-white">{footballConfig.maxSubstitutions} max</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Edit Mode
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Match Duration Settings */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 mb-2 text-emerald-400">
            <Clock className="w-5 h-5" />
            <h3 className="font-medium">Durée du Match</h3>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-white/60">Nombre de Mi-temps</label>
              <Input
                type="number"
                min={1}
                max={4}
                value={footballConfig.halvesCount}
                onChange={(e) => updateConfig({ halvesCount: parseInt(e.target.value) || 2 })}
                className="bg-black/20 border-white/10 h-8"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-white/60">Durée Mi-temps (min)</label>
              <Input
                type="number"
                min={5}
                max={60}
                value={footballConfig.halfDurationMinutes}
                onChange={(e) => updateConfig({ halfDurationMinutes: parseInt(e.target.value) || 45 })}
                className="bg-black/20 border-white/10 h-8"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                checked={footballConfig.extraTimeEnabled}
                onChange={(e) => updateConfig({ extraTimeEnabled: e.target.checked })}
                className="rounded border-white/30 bg-white/10 text-emerald-500"
              />
              <label className="text-sm text-white">Activer les Prolongations</label>
            </div>
          </div>
        </div>

        {/* Format Settings */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-4">
          <div className="flex items-center gap-2 mb-2 text-blue-400">
            <Trophy className="w-5 h-5" />
            <h3 className="font-medium">Format & Règles</h3>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-white/60">Format du Match</label>
              <select
                value={footballConfig.format}
                onChange={(e) => updateConfig({ format: e.target.value as FootballFormat })}
                className="w-full bg-black/20 border border-white/10 rounded-md h-8 px-2 text-sm text-white focus:ring-emerald-500 focus:border-emerald-500"
              >
                {FOOTBALL_CONFIG.formats.map(f => (
                  <option key={f.id} value={f.id} className="bg-slate-800">
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-white/60">Remplacements Max</label>
              <Input
                type="number"
                min={0}
                max={99}
                value={footballConfig.maxSubstitutions}
                onChange={(e) => updateConfig({ maxSubstitutions: parseInt(e.target.value) || 5 })}
                className="bg-black/20 border-white/10 h-8"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                checked={footballConfig.penaltiesEnabled}
                onChange={(e) => updateConfig({ penaltiesEnabled: e.target.checked })}
                className="rounded border-white/30 bg-white/10 text-blue-500"
              />
              <label className="text-sm text-white">Activer les Tirs au but</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

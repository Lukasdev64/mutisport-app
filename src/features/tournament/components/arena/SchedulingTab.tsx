import { useState } from 'react';
import { Calendar, Clock, Plus, Trash2, Bell, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SchedulingConfig, ReminderConfig, Resource, ResourceType, Tournament } from '@/types/tournament';

interface SchedulingTabProps {
  tournament: Tournament;
  schedulingConfig: SchedulingConfig;
  reminderConfig: ReminderConfig;
  onSchedulingChange: (config: SchedulingConfig) => void;
  onReminderChange: (config: ReminderConfig) => void;
  onGenerateSchedule: () => void;
  isGenerating?: boolean;
}

const RESOURCE_TYPES: { value: ResourceType; label: string }[] = [
  { value: 'court', label: 'Court' },
  { value: 'field', label: 'Terrain' },
  { value: 'table', label: 'Table' },
];

const REMINDER_OPTIONS = [
  { value: 15, label: '15 minutes avant' },
  { value: 60, label: '1 heure avant' },
  { value: 1440, label: '1 jour avant' },
];

export function SchedulingTab({
  tournament,
  schedulingConfig,
  reminderConfig,
  onSchedulingChange,
  onReminderChange,
  onGenerateSchedule,
  isGenerating = false,
}: SchedulingTabProps) {
  const [newResourceName, setNewResourceName] = useState('');
  const [newResourceType, setNewResourceType] = useState<ResourceType>('court');

  const updateScheduling = (updates: Partial<SchedulingConfig>) => {
    onSchedulingChange({ ...schedulingConfig, ...updates });
  };

  const updateReminder = (updates: Partial<ReminderConfig>) => {
    onReminderChange({ ...reminderConfig, ...updates });
  };

  const addResource = () => {
    if (!newResourceName.trim()) return;

    const newResource: Resource = {
      id: `resource-${Date.now()}`,
      name: newResourceName.trim(),
      type: newResourceType,
    };

    updateScheduling({
      resources: [...schedulingConfig.resources, newResource],
    });

    setNewResourceName('');
  };

  const removeResource = (id: string) => {
    updateScheduling({
      resources: schedulingConfig.resources.filter(r => r.id !== id),
    });
  };

  const toggleReminderTime = (minutes: number) => {
    const currentTimes = reminderConfig.reminderTimes || [];
    const isEnabled = currentTimes.includes(minutes);

    updateReminder({
      reminderTimes: isEnabled
        ? currentTimes.filter(t => t !== minutes)
        : [...currentTimes, minutes].sort((a, b) => a - b),
    });
  };

  // Check if schedule can be generated
  const canGenerate = schedulingConfig.enabled &&
    schedulingConfig.startDate &&
    schedulingConfig.resources.length > 0 &&
    tournament.rounds.some(r => r.matches.length > 0);

  const matchCount = tournament.rounds.reduce((acc, r) => acc + r.matches.length, 0);

  return (
    <div className="space-y-6">
      {/* Enable Scheduling */}
      <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-800/50 rounded-lg">
        <input
          type="checkbox"
          checked={schedulingConfig.enabled}
          onChange={e => updateScheduling({ enabled: e.target.checked })}
          className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
        />
        <div>
          <span className="text-white font-medium">Activer la planification</span>
          <p className="text-xs text-slate-400">Générer automatiquement les horaires des matchs</p>
        </div>
      </label>

      {schedulingConfig.enabled && (
        <>
          {/* Date Range */}
          <div className="p-4 bg-slate-800/50 rounded-lg space-y-4">
            <h4 className="text-sm font-medium text-slate-200 flex items-center gap-2">
              <Calendar size={16} />
              Plages horaires
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Date de début *</label>
                <input
                  type="date"
                  value={schedulingConfig.startDate}
                  onChange={e => updateScheduling({ startDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Date de fin (optionnel)</label>
                <input
                  type="date"
                  value={schedulingConfig.endDate || ''}
                  onChange={e => updateScheduling({ endDate: e.target.value || undefined })}
                  min={schedulingConfig.startDate}
                  className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
                  <Clock size={12} />
                  Heure de début
                </label>
                <input
                  type="time"
                  value={schedulingConfig.dailyStartTime}
                  onChange={e => updateScheduling({ dailyStartTime: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 flex items-center gap-1">
                  <Clock size={12} />
                  Heure de fin
                </label>
                <input
                  type="time"
                  value={schedulingConfig.dailyEndTime}
                  onChange={e => updateScheduling({ dailyEndTime: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Durée d'un match (min)</label>
                <input
                  type="number"
                  min={15}
                  max={180}
                  value={schedulingConfig.matchDurationMinutes}
                  onChange={e => updateScheduling({ matchDurationMinutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Pause entre matchs (min)</label>
                <input
                  type="number"
                  min={0}
                  max={60}
                  value={schedulingConfig.breakBetweenMatches}
                  onChange={e => updateScheduling({ breakBetweenMatches: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="p-4 bg-slate-800/50 rounded-lg space-y-4">
            <h4 className="text-sm font-medium text-slate-200">
              Ressources (courts/terrains)
            </h4>

            {/* Resource List */}
            {schedulingConfig.resources.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {schedulingConfig.resources.map(resource => (
                  <div
                    key={resource.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 rounded-lg text-sm"
                  >
                    <span className="text-white">{resource.name}</span>
                    <span className="text-slate-400 text-xs">({resource.type})</span>
                    <button
                      onClick={() => removeResource(resource.id)}
                      className="text-slate-400 hover:text-red-400 ml-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Resource */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newResourceName}
                onChange={e => setNewResourceName(e.target.value)}
                placeholder="Nom (ex: Court 1)"
                className="flex-1 px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={e => e.key === 'Enter' && addResource()}
              />
              <select
                value={newResourceType}
                onChange={e => setNewResourceType(e.target.value as ResourceType)}
                className="px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {RESOURCE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <Button
                onClick={addResource}
                disabled={!newResourceName.trim()}
                size="sm"
                className="bg-blue-600 hover:bg-blue-500"
              >
                <Plus size={16} />
              </Button>
            </div>

            {schedulingConfig.resources.length === 0 && (
              <p className="text-xs text-slate-500">
                Ajoutez au moins une ressource pour générer le planning
              </p>
            )}
          </div>

          {/* Reminder Settings */}
          <div className="p-4 bg-slate-800/50 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-slate-200 flex items-center gap-2">
                <Bell size={16} />
                Rappels de notification
              </h4>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reminderConfig.enabled}
                  onChange={e => updateReminder({ enabled: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-xs text-slate-400">Activer</span>
              </label>
            </div>

            {reminderConfig.enabled && (
              <div className="space-y-3">
                <p className="text-xs text-slate-400">
                  Envoyer un rappel aux joueurs avant leurs matchs :
                </p>

                {REMINDER_OPTIONS.map(option => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminderConfig.reminderTimes?.includes(option.value) || false}
                      onChange={() => toggleReminderTime(option.value)}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-300">{option.label}</span>
                  </label>
                ))}

                <div className="border-t border-slate-700 pt-3 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminderConfig.notifyOnRoundStart || false}
                      onChange={e => updateReminder({ notifyOnRoundStart: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-300">Notifier au début de chaque round</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reminderConfig.notifyOnMatchEnd || false}
                      onChange={e => updateReminder({ notifyOnMatchEnd: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-300">Notifier à la fin des matchs</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-medium text-blue-400">Générer le planning</h4>
                <p className="text-xs text-slate-400">
                  {matchCount} matchs à planifier sur {schedulingConfig.resources.length} ressource(s)
                </p>
              </div>
              <Button
                onClick={onGenerateSchedule}
                disabled={!canGenerate || isGenerating}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin mr-2">&#8987;</span>
                    Génération...
                  </>
                ) : (
                  <>
                    <Play size={16} className="mr-2" />
                    Générer
                  </>
                )}
              </Button>
            </div>

            {!canGenerate && (
              <p className="text-xs text-amber-400">
                {!schedulingConfig.startDate && 'Définissez une date de début. '}
                {schedulingConfig.resources.length === 0 && 'Ajoutez au moins une ressource. '}
                {matchCount === 0 && 'Aucun match à planifier. '}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

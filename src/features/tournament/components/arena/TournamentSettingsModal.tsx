import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { Tournament, SchedulingConfig, ReminderConfig } from '@/types/tournament';
import type { TennisMatchConfig, TennisFormat, TennisSurface } from '@/types/tennis';
import { useTournamentStore } from '../../store/tournamentStore';
import { Settings, Calendar, MapPin, Trophy, X, CalendarClock, ChevronDown, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/toast';
import { SchedulingTab } from './SchedulingTab';
import { SchedulePreview } from './SchedulePreview';
import { useScheduleGeneration } from '../../hooks/useScheduleGeneration';
import { cn } from '@/lib/utils';

interface TournamentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament;
  initialTab?: TabId;
}

type TabId = 'general' | 'scheduling';

export type { TabId };

// Collapsible Section Component
function Section({
  title,
  icon,
  children,
  defaultOpen = false,
  badge
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-blue-400">{icon}</span>
          <span className="text-sm font-medium text-white">{title}</span>
          {badge && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-500/20 text-blue-400 rounded">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          size={16}
          className={cn(
            "text-slate-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3 bg-slate-900/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Quick preset buttons for tennis
function TennisPresets({
  onSelect
}: {
  onSelect: (preset: Partial<TennisMatchConfig>) => void
}) {
  const presets = [
    {
      name: 'Amateur',
      desc: '2 sets, No-Ad',
      config: { format: 'best_of_3' as TennisFormat, decidingPointAtDeuce: true, finalSetTiebreak: true, finalSetTiebreakPoints: 10 }
    },
    {
      name: 'Standard',
      desc: '2 sets classique',
      config: { format: 'best_of_3' as TennisFormat, decidingPointAtDeuce: false, finalSetTiebreak: true, finalSetTiebreakPoints: 7 }
    },
    {
      name: 'Pro',
      desc: '3 sets gagnants',
      config: { format: 'best_of_5' as TennisFormat, decidingPointAtDeuce: false, finalSetTiebreak: true, finalSetTiebreakPoints: 7 }
    },
  ];

  return (
    <div className="flex gap-2">
      {presets.map(preset => (
        <button
          key={preset.name}
          onClick={() => onSelect(preset.config)}
          className="flex-1 p-2 rounded-lg border border-white/10 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all group"
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <Zap size={12} className="text-blue-400" />
            <span className="text-xs font-medium text-white">{preset.name}</span>
          </div>
          <span className="text-[10px] text-slate-400 group-hover:text-slate-300">{preset.desc}</span>
        </button>
      ))}
    </div>
  );
}

const AGE_CATEGORIES = [
  { value: 'open', label: 'Tous âges' },
  { value: 'u12', label: '-12 ans' },
  { value: 'u14', label: '-14 ans' },
  { value: 'u16', label: '-16 ans' },
  { value: 'u18', label: '-18 ans' },
  { value: 'senior', label: '35+' },
  { value: 'veteran', label: '50+' },
];

const SURFACES: { value: TennisSurface; label: string }[] = [
  { value: 'hard', label: 'Dur' },
  { value: 'clay', label: 'Terre battue' },
  { value: 'grass', label: 'Gazon' },
  { value: 'indoor', label: 'Indoor' },
];

export function TournamentSettingsModal({ isOpen, onClose, tournament, initialTab = 'general' }: TournamentSettingsModalProps) {
  const { updateTournament } = useTournamentStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  // Update active tab when initialTab changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // General settings state
  const [name, setName] = useState(tournament.name);
  const [location, setLocation] = useState(tournament.location || '');
  const [tournamentDate, setTournamentDate] = useState(tournament.tournamentDate || '');
  const [ageCategory, setAgeCategory] = useState(tournament.ageCategory || 'open');

  // Tennis config state
  const defaultTennisConfig: TennisMatchConfig = {
    format: 'best_of_3',
    surface: 'hard',
    tiebreakAt: 6,
    finalSetTiebreak: true,
    finalSetTiebreakPoints: 7,
    decidingPointAtDeuce: false,
    letRule: true,
    coachingAllowed: false,
    challengesPerSet: 3,
    warmupMinutes: 5,
    changeoverSeconds: 90,
    betweenPointsSeconds: 25,
  };

  const [tennisConfig, setTennisConfig] = useState<TennisMatchConfig>(
    tournament.tennisConfig || defaultTennisConfig
  );

  // Points settings state
  const [pointsForWin, setPointsForWin] = useState(tournament.settings?.pointsForWin ?? 3);
  const [pointsForDraw, setPointsForDraw] = useState(tournament.settings?.pointsForDraw ?? 1);
  const [pointsForLoss, setPointsForLoss] = useState(tournament.settings?.pointsForLoss ?? 0);

  // Scheduling state
  const defaultSchedulingConfig: SchedulingConfig = {
    enabled: false,
    startDate: tournament.tournamentDate || new Date().toISOString().split('T')[0],
    dailyStartTime: '09:00',
    dailyEndTime: '18:00',
    matchDurationMinutes: 60,
    breakBetweenMatches: 15,
    resources: []
  };

  const defaultReminderConfig: ReminderConfig = {
    enabled: true,
    reminderTimes: [15, 60],
    notifyOnRoundStart: true,
    notifyOnMatchEnd: false
  };

  const [schedulingConfig, setSchedulingConfig] = useState<SchedulingConfig>(
    tournament.schedulingConfig || defaultSchedulingConfig
  );
  const [reminderConfig, setReminderConfig] = useState<ReminderConfig>(
    tournament.reminderConfig || defaultReminderConfig
  );
  const [showSchedulePreview, setShowSchedulePreview] = useState(false);

  // Schedule generation hook
  const {
    generatedSchedule,
    isGenerating,
    error: scheduleError,
    generateSchedule,
    clearSchedule
  } = useScheduleGeneration(tournament, schedulingConfig);

  const handleGenerateSchedule = async () => {
    await generateSchedule();
    if (!scheduleError) {
      setShowSchedulePreview(true);
    }
  };

  // Auto-generate schedule when opening scheduling tab with valid config
  useEffect(() => {
    const hasMatchesToSchedule = tournament.rounds.some(r => r.matches.length > 0);
    const isConfigReady = schedulingConfig.enabled &&
      schedulingConfig.startDate &&
      schedulingConfig.resources.length > 0;

    if (
      isOpen &&
      activeTab === 'scheduling' &&
      initialTab === 'scheduling' &&
      isConfigReady &&
      hasMatchesToSchedule &&
      !isGenerating &&
      !showSchedulePreview &&
      !generatedSchedule
    ) {
      const timer = setTimeout(() => {
        generateSchedule().then(() => {
          setShowSchedulePreview(true);
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeTab, initialTab, schedulingConfig.enabled, schedulingConfig.startDate, schedulingConfig.resources.length, isGenerating, showSchedulePreview, generatedSchedule, generateSchedule, tournament.rounds]);

  const handleConfirmSchedule = () => {
    if (!generatedSchedule) return;

    const updatedRounds = tournament.rounds.map(round => ({
      ...round,
      matches: round.matches.map(match => {
        const scheduled = generatedSchedule.find(m => m.id === match.id);
        if (scheduled) {
          return {
            ...match,
            scheduledAt: scheduled.scheduledAt,
            resourceId: scheduled.resourceId,
            location: scheduled.location,
            status: 'scheduled' as const
          };
        }
        return match;
      })
    }));

    updateTournament(tournament.id, {
      rounds: updatedRounds,
      schedulingConfig,
      reminderConfig
    });

    toast('Planning généré et sauvegardé !', 'success');
    setShowSchedulePreview(false);
    clearSchedule();
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast('Le nom du tournoi est requis', 'error');
      return;
    }

    updateTournament(tournament.id, {
      name: name.trim(),
      location: location.trim() || undefined,
      tournamentDate: tournamentDate || undefined,
      ageCategory,
      tennisConfig: tournament.sport === 'tennis' ? tennisConfig : undefined,
      settings: {
        pointsForWin,
        pointsForDraw,
        pointsForLoss,
      },
      schedulingConfig,
      reminderConfig
    });

    toast('Paramètres sauvegardés !', 'success');
    onClose();
  };

  const updateTennisConfig = (updates: Partial<TennisMatchConfig>) => {
    setTennisConfig(prev => ({ ...prev, ...updates }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-white/10 rounded-xl w-full max-w-md overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
        >
          {/* Header - Simplified */}
          <div className="p-4 border-b border-white/10 flex justify-between items-center shrink-0">
            <h2 className="text-base font-bold text-white">Paramètres</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5">
              <X size={18} />
            </button>
          </div>

          {/* Simplified Tabs - Only 2 */}
          <div className="flex border-b border-white/10 shrink-0">
            <button
              onClick={() => setActiveTab('general')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
                activeTab === 'general'
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Settings size={14} />
              Configuration
            </button>
            <button
              onClick={() => setActiveTab('scheduling')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
                activeTab === 'scheduling'
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              )}
            >
              <CalendarClock size={14} />
              Planning
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto flex-1 space-y-3">
            {activeTab === 'general' && (
              <>
                {/* Essential Info - Always visible */}
                <div className="space-y-3">
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Nom du tournoi *"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="date"
                        value={tournamentDate}
                        onChange={e => setTournamentDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Lieu"
                      />
                    </div>
                  </div>
                </div>

                {/* Tennis Settings - Collapsible */}
                {tournament.sport === 'tennis' && (
                  <Section
                    title="Règles Tennis"
                    icon={<Trophy size={14} />}
                    defaultOpen={true}
                  >
                    {/* Quick Presets */}
                    <div className="mb-3">
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 block">Préréglages rapides</span>
                      <TennisPresets onSelect={updateTennisConfig} />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={tennisConfig.format}
                        onChange={e => updateTennisConfig({ format: e.target.value as TennisFormat })}
                        className="px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="best_of_3">2 sets gagnants</option>
                        <option value="best_of_5">3 sets gagnants</option>
                      </select>
                      <select
                        value={tennisConfig.surface}
                        onChange={e => updateTennisConfig({ surface: e.target.value as TennisSurface })}
                        className="px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {SURFACES.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Quick toggles */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <label className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all text-xs",
                        tennisConfig.decidingPointAtDeuce
                          ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                          : "border-white/10 text-slate-400 hover:border-white/20"
                      )}>
                        <input
                          type="checkbox"
                          checked={tennisConfig.decidingPointAtDeuce}
                          onChange={e => updateTennisConfig({ decidingPointAtDeuce: e.target.checked })}
                          className="sr-only"
                        />
                        No-Ad
                      </label>
                      <label className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all text-xs",
                        !tennisConfig.letRule
                          ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                          : "border-white/10 text-slate-400 hover:border-white/20"
                      )}>
                        <input
                          type="checkbox"
                          checked={!tennisConfig.letRule}
                          onChange={e => updateTennisConfig({ letRule: !e.target.checked })}
                          className="sr-only"
                        />
                        No-Let
                      </label>
                      <label className={cn(
                        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border cursor-pointer transition-all text-xs",
                        tennisConfig.coachingAllowed
                          ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                          : "border-white/10 text-slate-400 hover:border-white/20"
                      )}>
                        <input
                          type="checkbox"
                          checked={tennisConfig.coachingAllowed}
                          onChange={e => updateTennisConfig({ coachingAllowed: e.target.checked })}
                          className="sr-only"
                        />
                        Coaching
                      </label>
                    </div>
                  </Section>
                )}

                {/* Advanced Tennis - Only for power users */}
                {tournament.sport === 'tennis' && (
                  <Section
                    title="Règles avancées"
                    icon={<Settings size={14} />}
                    badge="Pro"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Tie-break à</label>
                        <select
                          value={tennisConfig.tiebreakAt}
                          onChange={e => updateTennisConfig({ tiebreakAt: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 bg-slate-800 border border-white/10 rounded text-white text-sm"
                        >
                          <option value={6}>6-6</option>
                          <option value={5}>5-5</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">TB set décisif</label>
                        <select
                          value={tennisConfig.finalSetTiebreakPoints || 7}
                          onChange={e => updateTennisConfig({ finalSetTiebreakPoints: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 bg-slate-800 border border-white/10 rounded text-white text-sm"
                        >
                          <option value={7}>7 pts</option>
                          <option value={10}>10 pts (Super)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Échauffement</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={1}
                            max={15}
                            value={tennisConfig.warmupMinutes}
                            onChange={e => updateTennisConfig({ warmupMinutes: Number(e.target.value) })}
                            className="w-full px-2 py-1.5 bg-slate-800 border border-white/10 rounded text-white text-sm"
                          />
                          <span className="text-xs text-slate-500">min</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wider text-slate-500 mb-1">Changement</label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={60}
                            max={180}
                            value={tennisConfig.changeoverSeconds}
                            onChange={e => updateTennisConfig({ changeoverSeconds: Number(e.target.value) })}
                            className="w-full px-2 py-1.5 bg-slate-800 border border-white/10 rounded text-white text-sm"
                          />
                          <span className="text-xs text-slate-500">sec</span>
                        </div>
                      </div>
                    </div>
                  </Section>
                )}

                {/* Points System - Collapsible */}
                {(tournament.format === 'round_robin' || tournament.format === 'swiss') && (
                  <Section
                    title="Système de points"
                    icon={<Trophy size={14} />}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-1 text-center">
                        <div className="text-emerald-400 text-lg font-bold">{pointsForWin}</div>
                        <label className="text-[10px] uppercase tracking-wider text-slate-500">Victoire</label>
                        <input
                          type="range"
                          min={0}
                          max={5}
                          value={pointsForWin}
                          onChange={e => setPointsForWin(Number(e.target.value))}
                          className="w-full mt-1 accent-emerald-500"
                        />
                      </div>
                      <div className="flex-1 text-center">
                        <div className="text-yellow-400 text-lg font-bold">{pointsForDraw}</div>
                        <label className="text-[10px] uppercase tracking-wider text-slate-500">Nul</label>
                        <input
                          type="range"
                          min={0}
                          max={5}
                          value={pointsForDraw}
                          onChange={e => setPointsForDraw(Number(e.target.value))}
                          className="w-full mt-1 accent-yellow-500"
                        />
                      </div>
                      <div className="flex-1 text-center">
                        <div className="text-red-400 text-lg font-bold">{pointsForLoss}</div>
                        <label className="text-[10px] uppercase tracking-wider text-slate-500">Défaite</label>
                        <input
                          type="range"
                          min={0}
                          max={5}
                          value={pointsForLoss}
                          onChange={e => setPointsForLoss(Number(e.target.value))}
                          className="w-full mt-1 accent-red-500"
                        />
                      </div>
                    </div>
                  </Section>
                )}

                {/* Category - Collapsible */}
                <Section
                  title="Catégorie"
                  icon={<Trophy size={14} />}
                >
                  <div className="flex flex-wrap gap-1.5">
                    {AGE_CATEGORIES.map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => setAgeCategory(cat.value)}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-xs font-medium transition-all",
                          ageCategory === cat.value
                            ? "bg-blue-500 text-white"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </Section>
              </>
            )}

            {activeTab === 'scheduling' && !showSchedulePreview && (
              <SchedulingTab
                tournament={tournament}
                schedulingConfig={schedulingConfig}
                reminderConfig={reminderConfig}
                onSchedulingChange={setSchedulingConfig}
                onReminderChange={setReminderConfig}
                onGenerateSchedule={handleGenerateSchedule}
                isGenerating={isGenerating}
              />
            )}

            {activeTab === 'scheduling' && showSchedulePreview && generatedSchedule && (
              <SchedulePreview
                schedule={generatedSchedule}
                tournament={tournament}
                onConfirm={handleConfirmSchedule}
                onCancel={() => {
                  setShowSchedulePreview(false);
                  clearSchedule();
                }}
              />
            )}

            {scheduleError && activeTab === 'scheduling' && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                {scheduleError}
              </div>
            )}
          </div>

          {/* Footer - Simplified */}
          <div className="p-3 bg-slate-950/50 border-t border-white/10 flex justify-end gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 text-xs">
              Annuler
            </Button>
            <Button size="sm" onClick={handleSave} className="h-8 text-xs bg-blue-600 hover:bg-blue-500">
              Enregistrer
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

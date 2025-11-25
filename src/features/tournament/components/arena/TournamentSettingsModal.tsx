import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Tournament } from '@/types/tournament';
import type { TennisMatchConfig, TennisFormat, TennisSurface } from '@/types/tennis';
import { useTournamentStore } from '../../store/tournamentStore';
import { Settings, Calendar, MapPin, Trophy, Timer, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/toast';

interface TournamentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: Tournament;
}

type TabId = 'general' | 'tennis' | 'points';

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'general', label: 'Général', icon: <Settings size={16} /> },
  { id: 'tennis', label: 'Tennis', icon: <Trophy size={16} /> },
  { id: 'points', label: 'Points', icon: <Timer size={16} /> },
];

const AGE_CATEGORIES = [
  { value: 'open', label: 'Open (Tous âges)' },
  { value: 'u12', label: 'Moins de 12 ans' },
  { value: 'u14', label: 'Moins de 14 ans' },
  { value: 'u16', label: 'Moins de 16 ans' },
  { value: 'u18', label: 'Moins de 18 ans' },
  { value: 'senior', label: 'Senior (35+)' },
  { value: 'veteran', label: 'Vétéran (50+)' },
];

const SURFACES: { value: TennisSurface; label: string }[] = [
  { value: 'hard', label: 'Dur' },
  { value: 'clay', label: 'Terre battue' },
  { value: 'grass', label: 'Gazon' },
  { value: 'indoor', label: 'Indoor' },
];

const FORMATS: { value: TennisFormat; label: string }[] = [
  { value: 'best_of_3', label: '2 sets gagnants' },
  { value: 'best_of_5', label: '3 sets gagnants' },
];

export function TournamentSettingsModal({ isOpen, onClose, tournament }: TournamentSettingsModalProps) {
  const { updateTournament } = useTournamentStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>('general');

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
          className="bg-slate-900 border border-white/10 rounded-xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <Settings className="text-blue-400" size={20} />
              <h2 className="text-lg font-heading font-bold text-white">Paramètres du tournoi</h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10 shrink-0">
            {TABS.map(tab => {
              // Hide Tennis tab if not tennis sport
              if (tab.id === 'tennis' && tournament.sport !== 'tennis') {
                return null;
              }
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {activeTab === 'general' && (
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Nom du tournoi *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Open de Paris"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    <Calendar className="inline mr-1.5" size={14} />
                    Date
                  </label>
                  <input
                    type="date"
                    value={tournamentDate}
                    onChange={e => setTournamentDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    <MapPin className="inline mr-1.5" size={14} />
                    Lieu
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Tennis Club de Paris"
                  />
                </div>

                {/* Age Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Catégorie d'âge
                  </label>
                  <select
                    value={ageCategory}
                    onChange={e => setAgeCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {AGE_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'tennis' && tournament.sport === 'tennis' && (
              <div className="space-y-4">
                {/* Format */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Format de match
                  </label>
                  <select
                    value={tennisConfig.format}
                    onChange={e => updateTennisConfig({ format: e.target.value as TennisFormat })}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {FORMATS.map(f => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Surface */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Surface
                  </label>
                  <select
                    value={tennisConfig.surface}
                    onChange={e => updateTennisConfig({ surface: e.target.value as TennisSurface })}
                    className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {SURFACES.map(s => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tiebreak Settings */}
                <div className="p-3 bg-slate-800/50 rounded-lg space-y-3">
                  <h4 className="text-sm font-medium text-slate-200">Règles du Tie-break</h4>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Tie-break à</span>
                    <select
                      value={tennisConfig.tiebreakAt}
                      onChange={e => updateTennisConfig({ tiebreakAt: Number(e.target.value) })}
                      className="px-2 py-1 bg-slate-700 border border-white/10 rounded text-white text-sm"
                    >
                      <option value={6}>6-6</option>
                      <option value={5}>5-5</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tennisConfig.finalSetTiebreak}
                      onChange={e => updateTennisConfig({ finalSetTiebreak: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-300">Tie-break au set décisif</span>
                  </label>

                  {tennisConfig.finalSetTiebreak && (
                    <div className="flex items-center justify-between pl-6">
                      <span className="text-sm text-slate-400">Points tie-break décisif</span>
                      <select
                        value={tennisConfig.finalSetTiebreakPoints || 7}
                        onChange={e => updateTennisConfig({ finalSetTiebreakPoints: Number(e.target.value) })}
                        className="px-2 py-1 bg-slate-700 border border-white/10 rounded text-white text-sm"
                      >
                        <option value={7}>7 points</option>
                        <option value={10}>10 points (Super)</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Scoring Rules */}
                <div className="p-3 bg-slate-800/50 rounded-lg space-y-3">
                  <h4 className="text-sm font-medium text-slate-200">Règles de scoring</h4>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tennisConfig.decidingPointAtDeuce}
                      onChange={e => updateTennisConfig({ decidingPointAtDeuce: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-300">No-Ad (point décisif à égalité)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!tennisConfig.letRule}
                      onChange={e => updateTennisConfig({ letRule: !e.target.checked })}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-300">No-Let (filet joué au service)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tennisConfig.coachingAllowed}
                      onChange={e => updateTennisConfig({ coachingAllowed: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-slate-300">Coaching autorisé</span>
                  </label>
                </div>

                {/* Time Rules */}
                <div className="p-3 bg-slate-800/50 rounded-lg space-y-3">
                  <h4 className="text-sm font-medium text-slate-200">Règles de temps</h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Échauffement (min)</label>
                      <input
                        type="number"
                        min={1}
                        max={15}
                        value={tennisConfig.warmupMinutes}
                        onChange={e => updateTennisConfig({ warmupMinutes: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-slate-700 border border-white/10 rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Changement (sec)</label>
                      <input
                        type="number"
                        min={60}
                        max={180}
                        value={tennisConfig.changeoverSeconds}
                        onChange={e => updateTennisConfig({ changeoverSeconds: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-slate-700 border border-white/10 rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Entre points (sec)</label>
                      <input
                        type="number"
                        min={15}
                        max={40}
                        value={tennisConfig.betweenPointsSeconds}
                        onChange={e => updateTennisConfig({ betweenPointsSeconds: Number(e.target.value) })}
                        className="w-full px-2 py-1 bg-slate-700 border border-white/10 rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Challenges/set</label>
                      <input
                        type="number"
                        min={0}
                        max={5}
                        value={tennisConfig.challengesPerSet || 0}
                        onChange={e => updateTennisConfig({ challengesPerSet: Number(e.target.value) || undefined })}
                        className="w-full px-2 py-1 bg-slate-700 border border-white/10 rounded text-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'points' && (
              <div className="space-y-4">
                <p className="text-sm text-slate-400 mb-4">
                  Configurez l'attribution des points pour les formats Round Robin et Suisse.
                </p>

                <div className="space-y-4">
                  {/* Points for Win */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Points par victoire
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={pointsForWin}
                      onChange={e => setPointsForWin(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Points for Draw */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Points par match nul
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={pointsForDraw}
                      onChange={e => setPointsForDraw(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Points for Loss */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                      Points par défaite
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={pointsForLoss}
                      onChange={e => setPointsForLoss(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Preview */}
                <div className="mt-6 p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="text-sm font-medium text-slate-200 mb-3">Aperçu</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-emerald-400">Victoire</span>
                      <span className="text-white font-mono">+{pointsForWin} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-400">Nul</span>
                      <span className="text-white font-mono">+{pointsForDraw} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-400">Défaite</span>
                      <span className="text-white font-mono">+{pointsForLoss} pts</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-950/50 border-t border-white/10 flex justify-end gap-3 shrink-0">
            <Button variant="ghost" onClick={onClose}>
              Annuler
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500">
              Enregistrer
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

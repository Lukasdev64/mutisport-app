import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  Zap, Plus, X, User, Users, Trophy, GitMerge,
  ChevronDown, ChevronUp, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlayerAvatar } from '@/components/ui/PlayerAvatar';
import { cn } from '@/lib/utils';
import { useTournamentStore } from '../../store/tournamentStore';
import { useCreateTournament } from '@/hooks/useTournaments';
import { TournamentEngine } from '../../logic/engine';
import { TENNIS_TOURNAMENT_PRESETS } from '@/sports/tennis/tournamentPresets';
import type { TournamentFormat, Player, Tournament } from '@/types/tournament';
import type { TennisMatchConfig } from '@/types/tennis';

const FORMAT_OPTIONS = [
  {
    id: 'single_elimination' as TournamentFormat,
    name: 'Elimination',
    description: 'Chaque match compte',
    icon: GitMerge,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    minPlayers: 4
  },
  {
    id: 'round_robin' as TournamentFormat,
    name: 'Round Robin',
    description: 'Tous contre tous',
    icon: Users,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    minPlayers: 3,
    maxPlayers: 12
  },
  {
    id: 'swiss' as TournamentFormat,
    name: 'Swiss',
    description: 'Appariement progressif',
    icon: Trophy,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    minPlayers: 4
  }
];

// Popular presets for quick selection (IDs must match TENNIS_TOURNAMENT_PRESETS)
const QUICK_PRESETS = [
  { id: 'atp-250', emoji: '🎾', name: 'ATP Standard' },
  { id: 'custom', emoji: '🤝', name: 'Match Amical' },
  { id: 'junior-grand-slam', emoji: '🌟', name: 'Junior' },
  { id: 'davis-cup', emoji: '🏆', name: 'Davis Cup' }
];

export function QuickStartScreen() {
  const navigate = useNavigate();
  const { createTournament: createLocalTournament } = useTournamentStore();
  const createTournamentMutation = useCreateTournament();

  // State - Default to 'custom' preset for quickest start (Match Amical)
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>('custom');
  const [selectedFormat, setSelectedFormat] = useState<TournamentFormat>('single_elimination');
  const [players, setPlayers] = useState<Player[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showAllPresets, setShowAllPresets] = useState(false);
  const [presetSearch, setPresetSearch] = useState('');

  // Get tennis config from selected preset
  const tennisConfig: TennisMatchConfig | null = useMemo(() => {
    if (!selectedPresetId) return null;
    const preset = TENNIS_TOURNAMENT_PRESETS.find(p => p.id === selectedPresetId);
    return preset?.config ?? null;
  }, [selectedPresetId]);

  // Filter presets for expanded view
  const filteredPresets = useMemo(() => {
    const presets = TENNIS_TOURNAMENT_PRESETS.filter(p => p.id !== 'custom');
    if (!presetSearch.trim()) return presets;
    const query = presetSearch.toLowerCase();
    return presets.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  }, [presetSearch]);

  // Validation
  const canLaunch = tennisConfig !== null && selectedFormat !== null && players.length >= 4;

  // Add player
  const handleAddPlayer = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim()) {
      const id = uuidv4();
      const bgColors = ['b6e3f4', 'c0aede', 'd1d4f9'];
      const bg = bgColors[Math.floor(Math.random() * bgColors.length)];
      setPlayers(prev => [...prev, {
        id,
        name: inputValue.trim(),
        avatar: `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(id)}&backgroundColor=${bg}`
      }]);
      setInputValue('');
    }
  };

  // Remove player
  const handleRemovePlayer = (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
  };

  // Launch tournament
  const handleLaunch = () => {
    if (!canLaunch || !tennisConfig) return;

    const rounds = TournamentEngine.generateBracket(players, selectedFormat);

    const newTournament: Tournament = {
      id: uuidv4(),
      name: `Quick Tennis ${new Date().toLocaleDateString()}`,
      format: selectedFormat,
      sport: 'tennis',
      tennisConfig,
      status: 'active',
      players,
      rounds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        pointsForWin: 3,
        pointsForDraw: 1,
        pointsForLoss: 0
      }
    };

    // Save to local store for immediate access
    createLocalTournament(newTournament);

    // Save to Supabase (async, don't block navigation)
    createTournamentMutation.mutate(newTournament);

    navigate(`/tournaments/${newTournament.id}`);
  };

  const selectedPreset = TENNIS_TOURNAMENT_PRESETS.find(p => p.id === selectedPresetId);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 text-sm font-medium mb-4">
          <Zap className="w-4 h-4" />
          Quick Start
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Lancer un Tournoi</h1>
        <p className="text-slate-400">Tout sur un seul écran - jouez en moins d'une minute</p>
      </div>

      <div className="space-y-6">
        {/* Section 1: Tennis Rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">🎾</span>
            Règles du Match
          </h2>

          {/* Quick Presets */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {QUICK_PRESETS.map(preset => {
              const fullPreset = TENNIS_TOURNAMENT_PRESETS.find(p => p.id === preset.id);
              const isSelected = selectedPresetId === preset.id;

              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={cn(
                    "p-4 rounded-xl border text-center transition-all touch-target no-zoom",
                    isSelected
                      ? "bg-blue-500/20 border-blue-500/50 ring-2 ring-blue-500"
                      : "bg-slate-800/50 border-white/10 hover:border-white/20"
                  )}
                >
                  <div className="text-2xl mb-1">{preset.emoji}</div>
                  <div className="text-sm font-medium text-white">{preset.name}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    {fullPreset?.config.format === 'best_of_5' ? '5 sets' : '3 sets'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Show more presets */}
          <button
            onClick={() => setShowAllPresets(!showAllPresets)}
            className="w-full py-2 text-sm text-slate-400 hover:text-white flex items-center justify-center gap-2 transition-colors"
          >
            {showAllPresets ? (
              <>Moins d'options <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>Plus d'options <ChevronDown className="w-4 h-4" /></>
            )}
          </button>

          <AnimatePresence>
            {showAllPresets && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={presetSearch}
                    onChange={(e) => setPresetSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-white/10 rounded-lg text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* All presets grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
                  {filteredPresets.map(preset => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => {
                          setSelectedPresetId(preset.id);
                          setShowAllPresets(false);
                        }}
                        className={cn(
                          "p-3 rounded-lg border text-left transition-all",
                          isSelected
                            ? "bg-blue-500/20 border-blue-500/50"
                            : "bg-slate-800/50 border-white/5 hover:border-white/20"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{preset.emoji}</span>
                          <div>
                            <div className="text-sm font-medium text-white">{preset.name}</div>
                            <div className="text-xs text-slate-500">
                              {preset.config.format === 'best_of_5' ? '5 sets' : '3 sets'}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selected preset summary */}
          {selectedPreset && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{selectedPreset.emoji}</span>
                <div>
                  <div className="font-bold text-white">{selectedPreset.name}</div>
                  <div className="text-xs text-slate-400">{selectedPreset.description}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 bg-slate-800 rounded text-slate-300">
                  {selectedPreset.config.format === 'best_of_5' ? '5 sets' : '3 sets'}
                </span>
                <span className="px-2 py-1 bg-slate-800 rounded text-slate-300 capitalize">
                  {selectedPreset.config.surface}
                </span>
                {selectedPreset.config.decidingPointAtDeuce && (
                  <span className="px-2 py-1 bg-yellow-500/20 rounded text-yellow-400">No-Ad</span>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Section 2: Tournament Format */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/50 border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            Format du Tournoi
          </h2>

          <div className="grid grid-cols-3 gap-3">
            {FORMAT_OPTIONS.map(option => {
              const isSelected = selectedFormat === option.id;
              const isCompatible = players.length === 0 ||
                (players.length >= option.minPlayers && (!option.maxPlayers || players.length <= option.maxPlayers));

              return (
                <button
                  key={option.id}
                  onClick={() => isCompatible && setSelectedFormat(option.id)}
                  disabled={!isCompatible}
                  className={cn(
                    "p-4 rounded-xl border text-center transition-all touch-target no-zoom",
                    isSelected
                      ? `${option.bg} ${option.border} ring-2 ring-blue-500`
                      : isCompatible
                        ? "bg-slate-800/50 border-white/10 hover:border-white/20"
                        : "bg-slate-900/30 border-white/5 opacity-50 cursor-not-allowed"
                  )}
                >
                  <option.icon className={cn("w-6 h-6 mx-auto mb-2", option.color)} />
                  <div className="text-sm font-medium text-white">{option.name}</div>
                  <div className="text-xs text-slate-400 mt-1">{option.description}</div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Section 3: Players */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 border border-white/10 rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Joueurs
            <span className={cn(
              "ml-auto text-sm font-normal px-2 py-1 rounded",
              players.length >= 4 ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
            )}>
              {players.length}/4 min
            </span>
          </h2>

          {/* Add player input */}
          <form onSubmit={handleAddPlayer} className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Nom du joueur..."
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 touch-target"
                enterKeyHint="done"
              />
            </div>
            <Button
              type="submit"
              disabled={!inputValue.trim()}
              className="px-6 bg-blue-600 hover:bg-blue-500 touch-target"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </form>

          {/* Player list */}
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between p-3 bg-slate-800/50 border border-white/5 rounded-lg group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-6">{index + 1}.</span>
                    <PlayerAvatar
                      src={player.avatar}
                      name={player.name}
                      className="w-8 h-8"
                      fallbackClassName="text-[10px]"
                    />
                    <span className="font-medium text-white">{player.name}</span>
                  </div>
                  <button
                    onClick={() => handleRemovePlayer(player.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 touch-target"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {players.length === 0 && (
              <div className="py-8 text-center border border-dashed border-slate-700 rounded-xl text-slate-500">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Ajoutez au moins 4 joueurs</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Launch Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Button
            onClick={handleLaunch}
            disabled={!canLaunch}
            className={cn(
              "w-full py-6 text-lg font-bold rounded-2xl transition-all touch-target-lg",
              canLaunch
                ? "bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 shadow-lg shadow-emerald-500/20"
                : "bg-slate-700 text-slate-400 cursor-not-allowed"
            )}
          >
            <Zap className="w-6 h-6 mr-3" />
            {canLaunch ? 'Lancer le Tournoi' : 'Complétez les étapes ci-dessus'}
          </Button>

          {!canLaunch && (
            <div className="mt-3 text-center text-sm text-slate-500">
              {!selectedPresetId && <span>• Sélectionnez un format de match<br/></span>}
              {players.length < 4 && <span>• Ajoutez {4 - players.length} joueur{4 - players.length > 1 ? 's' : ''} pour commencer</span>}
            </div>
          )}
        </motion.div>

        {/* Cancel */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-slate-500 hover:text-white text-sm transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

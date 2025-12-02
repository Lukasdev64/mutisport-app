import { useState, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useWizardStore } from '../../store/wizardStore';
import { Trophy, Users, GitMerge, Repeat, Calendar, TrendingUp, ArrowLeft, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AGE_CATEGORIES } from '@/config/categories';
import { RANKINGS } from '@/config/rankings';
import type { TournamentFormat } from '@/types/tournament';
import { TennisPresetSelector } from './TennisPresetSelector';
import { TennisRulesCustomizer } from './TennisRulesCustomizer';
import { TENNIS_TOURNAMENT_PRESETS } from '@/sports/tennis/tournamentPresets';
import type { TennisMatchConfig } from '@/types/tennis';
import {
  SPORT_IMPLEMENTATION_STATUS,
  // isSportImplemented,
  SPORTS
} from '@/types/sport';
import type { SportType } from '@/types/sport';

const FORMAT_OPTIONS = [
  {
    id: 'single_elimination' as TournamentFormat,
    name: 'Simple Élimination',
    description: 'Rapide et intense - chaque défaite élimine',
    icon: GitMerge,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    hover: 'hover:border-blue-500/50',
    minPlayers: 4,
    idealSizes: [4, 8, 16, 32, 64]
  },
  {
    id: 'double_elimination' as TournamentFormat,
    name: 'Double Élimination',
    description: 'Seconde chance avec bracket des perdants',
    icon: Repeat,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    hover: 'hover:border-purple-500/50',
    minPlayers: 4,
    idealSizes: [4, 8, 16, 32]
  },
  {
    id: 'round_robin' as TournamentFormat,
    name: 'Round Robin',
    description: 'Tous contre tous - le plus équitable',
    icon: Users,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    hover: 'hover:border-emerald-500/50',
    minPlayers: 3,
    idealSizes: [4, 6, 8],
    maxPlayers: 12
  },
  {
    id: 'swiss' as TournamentFormat,
    name: 'Swiss System',
    description: 'Appariement progressif par niveau',
    icon: Trophy,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    hover: 'hover:border-amber-500/50',
    minPlayers: 4,
    idealSizes: [8, 16, 32, 64]
  }
];

export function FormatAndRules() {
  // State values - use useShallow to prevent unnecessary re-renders
  const {
    format, ageCategory, customAgeRules, isRanked, rankingRange,
    estimatedMaxParticipants, tennisPresetId, tennisConfig, sport
  } = useWizardStore(useShallow((s) => ({
    format: s.format,
    ageCategory: s.ageCategory,
    customAgeRules: s.customAgeRules,
    isRanked: s.isRanked,
    rankingRange: s.rankingRange,
    estimatedMaxParticipants: s.estimatedMaxParticipants,
    tennisPresetId: s.tennisPresetId,
    tennisConfig: s.tennisConfig,
    sport: s.sport
  })));

  // Actions - stable references, no useShallow needed
  const setFormat = useWizardStore((s) => s.setFormat);
  const setAgeCategory = useWizardStore((s) => s.setAgeCategory);
  const setCustomAgeRules = useWizardStore((s) => s.setCustomAgeRules);
  const setIsRanked = useWizardStore((s) => s.setIsRanked);
  const setRankingRange = useWizardStore((s) => s.setRankingRange);
  const setEstimatedMaxParticipants = useWizardStore((s) => s.setEstimatedMaxParticipants);
  const setTennisPreset = useWizardStore((s) => s.setTennisPreset);
  const setTennisConfig = useWizardStore((s) => s.setTennisConfig);

  // State for Tennis Configuration Mode
  const [tennisMode, setTennisMode] = useState<'preset' | 'custom' | null>(
    tennisPresetId ? (tennisPresetId === 'custom' ? 'custom' : 'preset') : null
  );
  
  // Map wizard sport to SportType
  const sportTypeMap: Record<string, SportType> = {
    'tennis': 'tennis',
    'football': 'football',
    'basketball': 'basketball',
    'other': 'generic'
  };
  const sportType = sportTypeMap[sport] || 'generic';
  const implementationStatus = SPORT_IMPLEMENTATION_STATUS[sportType];
    // const { isSportImplemented } = useSportPlugin(sportType);
  // const isFullyImplemented = isSportImplemented(sportType);

  // Detect if tennis based on sport selection
  const isTennis = sport === 'tennis';

  // Safety sync: Ensure config exists if preset is selected
  useEffect(() => {
    if (isTennis && tennisPresetId && !tennisConfig && tennisPresetId !== 'custom') {
      const preset = TENNIS_TOURNAMENT_PRESETS.find(p => p.id === tennisPresetId);
      if (preset) {
        console.log('Restoring missing tennis config for preset:', preset.name);
        setTennisConfig(preset.config);
      }
    }
  }, [isTennis, tennisPresetId, tennisConfig, setTennisConfig]);

  // Handle tennis preset selection
  const handleSelectPreset = (presetId: string) => {
    setTennisPreset(presetId);
    setTennisMode('preset'); // Ensure mode is set
    const preset = TENNIS_TOURNAMENT_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setTennisConfig(preset.config);
    }
  };

  // Handle customization
  const handleCustomize = () => {
    setTennisMode('custom');
    setTennisPreset('custom');
    // Initialize with default config if none exists
    if (!tennisConfig) {
      setTennisConfig({
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
        betweenPointsSeconds: 25
      });
    }
  };

  // Handle tennis config changes
  const handleTennisConfigChange = (config: TennisMatchConfig) => {
    setTennisConfig(config);
  };

  const getFormatCompatibility = (formatOption: typeof FORMAT_OPTIONS[0]) => {
    const count = estimatedMaxParticipants;
    
    if (count < formatOption.minPlayers) {
      return { compatible: false, message: `Minimum ${formatOption.minPlayers} joueurs`, color: 'text-red-400' };
    }
    
    if (formatOption.maxPlayers && count > formatOption.maxPlayers) {
      return { compatible: false, message: `Maximum ${formatOption.maxPlayers} joueurs`, color: 'text-red-400' };
    }
    
    const isIdeal = formatOption.idealSizes?.includes(count);
    return {
      compatible: true,
      message: isIdeal ? 'Taille idéale ✨' : 'Compatible',
      color: isIdeal ? 'text-emerald-400' : 'text-blue-400'
    };
  };

  // Determine what content to show based on tennis mode
  let content;
  
  if (isTennis) {
    // Show preset selector
    if (tennisMode === null) {
      content = (
        <div className="space-y-6">
          <TennisPresetSelector
            selectedPresetId={tennisPresetId}
            onSelectPreset={(presetId) => {
              handleSelectPreset(presetId);
              setTennisMode('preset');
            }}
            onCustomize={handleCustomize}
          />
        </div>
      );
    }
    // Show customizer if in custom mode
    else if (tennisMode === 'custom' && tennisConfig) {
      content = (
        <div className="space-y-6">
          <TennisRulesCustomizer
            config={tennisConfig}
            onChange={handleTennisConfigChange}
          />
          
          {/* Back to preset selector */}
          <div className="flex justify-center">
            <button
              onClick={() => setTennisMode(null)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-800/50 border border-white/10 rounded-lg hover:bg-slate-700 transition-colors text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour aux presets
            </button>
          </div>
        </div>
      );
    }
    // Show summary if preset is selected
    else if (tennisMode === 'preset') {
      const selectedPreset = TENNIS_TOURNAMENT_PRESETS.find(p => p.id === tennisPresetId);
      
      content = (
        <div className="space-y-6">
          {/* Preset Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-blue-500/20 to-emerald-500/20 border border-blue-500/30 rounded-xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="text-5xl">{selectedPreset?.emoji}</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-1">{selectedPreset?.name}</h3>
                <p className="text-slate-300">{selectedPreset?.description}</p>
                {selectedPreset?.isOfficial && (
                  <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 font-medium">
                    Format Officiel
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Configuration Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900/50 border border-white/10 rounded-xl p-6"
          >
            <h4 className="text-lg font-bold text-white mb-4">Configuration Appliquée</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Match Format */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-slate-500 uppercase">Format de Match</div>
                <div className="text-white font-medium">
                  {tennisConfig?.format === 'best_of_5' ? '⭐ Meilleur des 5 sets' : '🎾 Meilleur des 3 sets'}
                </div>
                <div className="text-xs text-slate-400">
                  {tennisConfig?.format === 'best_of_5' ? 'Premier à 3 sets gagnés' : 'Premier à 2 sets gagnés'}
                </div>
              </div>

              {/* Surface */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-slate-500 uppercase">Surface</div>
                <div className="text-white font-medium capitalize">
                  {tennisConfig?.surface === 'clay' && '🟠 Terre battue'}
                  {tennisConfig?.surface === 'grass' && '🟢 Gazon'}
                  {tennisConfig?.surface === 'hard' && '🔵 Dur'}
                  {tennisConfig?.surface === 'indoor' && '🏟️ Indoor'}
                </div>
              </div>

              {/* Tie-break Rules */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-slate-500 uppercase">Tie-break</div>
                <div className="text-white text-sm">
                  À {tennisConfig?.tiebreakAt}-{tennisConfig?.tiebreakAt}
                  {tennisConfig?.finalSetTiebreak && (
                    <span className="block text-xs text-slate-400 mt-1">
                      Set décisif: {tennisConfig?.finalSetTiebreakPoints === 10 ? 'Super tie-break (10 pts)' : 'Standard (7 pts)'}
                    </span>
                  )}
                  {!tennisConfig?.finalSetTiebreak && (
                    <span className="block text-xs text-yellow-400 mt-1">
                      Pas de tie-break au dernier set
                    </span>
                  )}
                </div>
              </div>

              {/* Scoring Variations */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-slate-500 uppercase">Scoring</div>
                <div className="text-white text-sm">
                  {tennisConfig?.decidingPointAtDeuce ? (
                    <span className="text-yellow-400">⚡ No-Ad (Point décisif)</span>
                  ) : (
                    <span>Avantage classique</span>
                  )}
                  {!tennisConfig?.letRule && (
                    <span className="block text-xs text-yellow-400 mt-1">
                      No-Let au service
                    </span>
                  )}
                </div>
              </div>

              {/* Coaching */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-slate-500 uppercase">Coaching</div>
                <div className={cn(
                  "text-sm font-medium",
                  tennisConfig?.coachingAllowed ? "text-emerald-400" : "text-slate-400"
                )}>
                  {tennisConfig?.coachingAllowed ? '✅ Autorisé' : '🚫 Interdit'}
                </div>
              </div>

              {/* Challenges */}
              {tennisConfig?.challengesPerSet !== undefined && tennisConfig?.challengesPerSet > 0 && (
                <div className="space-y-1">
                  <div className="text-xs font-medium text-slate-500 uppercase">Hawk-Eye</div>
                  <div className="text-white text-sm">
                    {tennisConfig?.challengesPerSet} challenges par set
                  </div>
                </div>
              )}

              {/* Timing */}
              <div className="space-y-1 md:col-span-2">
                <div className="text-xs font-medium text-slate-500 uppercase">Temps Réglementaires</div>
                <div className="flex gap-4 text-xs text-slate-300">
                  <span>⏱️ Échauffement: {tennisConfig?.warmupMinutes}min</span>
                  <span>⏱️ Changement: {tennisConfig?.changeoverSeconds}s</span>
                  <span>⏱️ Entre points: {tennisConfig?.betweenPointsSeconds}s</span>
                </div>
              </div>
            </div>

            {/* Impact Info */}
            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="text-xs font-medium text-blue-400 mb-2">💡 Impact sur vos matchs</div>
              <div className="text-xs text-slate-300 space-y-1">
                <p>• <strong>Interface de score:</strong> Affichage adapté au format {tennisConfig?.format === 'best_of_5' ? '5 sets' : '3 sets'}</p>
                <p>• <strong>Timing:</strong> Chronomètres automatiques pour changements et entre-points</p>
                <p>• <strong>Validation:</strong> Règles appliquées automatiquement pendant le match</p>
              </div>
            </div>
          </motion.div>

          {/* Tournament Format Selection - Also needed for tennis! */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900/50 border border-white/10 rounded-xl p-6"
          >
            <h4 className="text-lg font-bold text-white mb-4">Format du Tournoi</h4>
            <p className="text-sm text-slate-400 mb-4">
              Sélectionnez le système de bracket pour organiser les matchs
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FORMAT_OPTIONS.map((option) => {
                const compatibility = getFormatCompatibility(option);
                const isSelected = format === option.id;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => compatibility.compatible && setFormat(option.id)}
                    disabled={!compatibility.compatible}
                    className={cn(
                      "relative p-4 rounded-xl border text-left transition-all",
                      isSelected 
                        ? `${option.bg} ${option.border} ring-2 ring-blue-500` 
                        : compatibility.compatible
                          ? `bg-slate-900/50 border-white/10 ${option.hover}`
                          : "bg-slate-900/30 border-white/5 opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn("p-2 rounded-lg", option.bg)}>
                        <option.icon className={cn("w-5 h-5", option.color)} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white mb-1">{option.name}</h3>
                        <p className="text-xs text-slate-400">{option.description}</p>
                        <p className={cn("text-xs mt-2 font-medium", compatibility.color)}>
                          {compatibility.message}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Change preset button */}
          <div className="flex justify-center">
            <button
              onClick={() => setTennisMode(null)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-800/50 border border-white/10 rounded-lg hover:bg-slate-700 transition-colors text-white"
            >
              <ArrowLeft className="w-4 h-4" />
              Changer de preset
            </button>
          </div>
        </div>
      );
    }
  } else {
    // Non-tennis sports content
    const sportInfo = SPORTS[sportType];

    content = (
      <>
        {/* Info banner for partially implemented sports */}
        {implementationStatus === 'partial' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Wrench className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-400 mb-1">
                  {sportInfo.emoji} {sportInfo.name} - Version Beta
                </h4>
                <p className="text-sm text-slate-300">
                  La personnalisation des règles pour {sportInfo.name.toLowerCase()} arrive bientot.
                  En attendant, vous pouvez créer un tournoi avec les formats standards.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tournament Format Selection */}
        <div className="space-y-4">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          Format du Tournoi
          <span className="text-red-400">*</span>
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FORMAT_OPTIONS.map((option) => {
            const compatibility = getFormatCompatibility(option);
            const isSelected = format === option.id;
            
            return (
              <motion.button
                key={option.id}
                whileHover={compatibility.compatible ? { scale: 1.02 } : {}}
                whileTap={compatibility.compatible ? { scale: 0.98 } : {}}
                onClick={() => compatibility.compatible && setFormat(option.id)}
                disabled={!compatibility.compatible}
                className={cn(
                  "relative p-5 rounded-xl border text-left transition-all",
                  isSelected 
                    ? `${option.bg} ${option.border} ring-2 ring-blue-500` 
                    : compatibility.compatible
                      ? `bg-slate-900/50 border-white/10 ${option.hover}`
                      : "bg-slate-900/30 border-white/5 opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-lg", option.bg)}>
                    <option.icon className={cn("w-5 h-5", option.color)} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white mb-1">{option.name}</h3>
                    <p className="text-xs text-slate-400">{option.description}</p>
                    <p className={cn("text-xs mt-2 font-medium", compatibility.color)}>
                      {compatibility.message}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Estimated Max Participants */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Nombre Maximum de Participants (estimation)
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="4"
            max="64"
            step="2"
            value={estimatedMaxParticipants}
            onChange={(e) => setEstimatedMaxParticipants(parseInt(e.target.value))}
            className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div className="bg-slate-800 border border-white/10 rounded-lg px-4 py-2 min-w-[60px] text-center">
            <span className="text-2xl font-bold text-white">{estimatedMaxParticipants}</span>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Ce nombre peut être ajusté ultérieurement après l'analyse des inscriptions
        </p>
      </div>

      {/* Age Category */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Catégorie d'Âge
          <span className="text-red-400">*</span>
        </label>
        <select
          value={ageCategory}
          onChange={(e) => setAgeCategory(e.target.value)}
          className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
        >
          {AGE_CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id} className="bg-slate-900">
              {cat.name} {cat.description ? `- ${cat.description}` : ''}
            </option>
          ))}
          <option value="custom" className="bg-slate-900">Personnalisé</option>
        </select>

        {ageCategory === 'custom' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-2 gap-4 mt-4"
          >
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">Âge minimum</label>
              <input
                type="number"
                min="1"
                max="99"
                placeholder="Min"
                value={customAgeRules.min || ''}
                onChange={(e) => setCustomAgeRules({ ...customAgeRules, min: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">Âge maximum</label>
              <input
                type="number"
                min="1"
                max="99"
                placeholder="Max"
                value={customAgeRules.max || ''}
                onChange={(e) => setCustomAgeRules({ ...customAgeRules, max: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Tournament Type: Ranked vs Friendly */}
      <div className="space-y-4">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Type de Tournoi
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setIsRanked(false)}
            className={cn(
              "p-4 rounded-xl border transition-all text-center",
              !isRanked 
                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                : "bg-slate-900/50 border-white/5 text-slate-400 hover:bg-slate-800"
            )}
          >
            <div className="font-bold mb-1">Amical</div>
            <div className="text-xs opacity-70">Ouvert à tous</div>
          </button>
          <button
            onClick={() => setIsRanked(true)}
            className={cn(
              "p-4 rounded-xl border transition-all text-center",
              isRanked 
                ? "bg-blue-500/10 border-blue-500/50 text-blue-400" 
                : "bg-slate-900/50 border-white/5 text-slate-400 hover:bg-slate-800"
            )}
          >
            <div className="font-bold mb-1">Classé FFT</div>
            <div className="text-xs opacity-70">Avec restrictions de classement</div>
          </button>
        </div>

        {isRanked && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-2 gap-4 mt-4 p-4 bg-slate-900/50 rounded-xl border border-white/5"
          >
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">Classement minimum</label>
              <select
                value={rankingRange.min || ''}
                onChange={(e) => setRankingRange({ ...rankingRange, min: e.target.value || undefined })}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="">Aucun</option>
                {RANKINGS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">Classement maximum</label>
              <select
                value={rankingRange.max || ''}
                onChange={(e) => setRankingRange({ ...rankingRange, max: e.target.value || undefined })}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value="">Aucun</option>
                {RANKINGS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </div>

      {/* Summary Card */}
      {format && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6"
        >
          <h3 className="text-sm font-medium text-blue-400 mb-3">Récapitulatif</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Format:</span>
              <span className="text-white font-medium">
                {FORMAT_OPTIONS.find(f => f.id === format)?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Participants (max):</span>
              <span className="text-white font-medium">{estimatedMaxParticipants}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Catégorie:</span>
              <span className="text-white font-medium">
                {ageCategory === 'custom' 
                  ? `${customAgeRules.min || '?'} - ${customAgeRules.max || '?'} ans`
                  : AGE_CATEGORIES.find(c => c.id === ageCategory)?.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Type:</span>
              <span className="text-white font-medium">
                {isRanked ? 'Classé FFT' : 'Amical'}
              </span>
            </div>
          </div>
        </motion.div>
      )}
      </>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-4xl mx-auto"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Format & Règles du Tournoi</h2>
        <p className="text-slate-400">Définissez le format et les critères de participation</p>
      </div>

      {content}
    </motion.div>
  );
}

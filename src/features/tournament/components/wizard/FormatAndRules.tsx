import { useWizardStore } from '../../store/wizardStore';
import { Trophy, Users, GitMerge, Repeat, Calendar, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AGE_CATEGORIES } from '@/config/categories';
import { RANKINGS } from '@/config/rankings';
import type { TournamentFormat } from '@/types/tournament';

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
  const { 
    format, setFormat,
    ageCategory, setAgeCategory,
    customAgeRules, setCustomAgeRules,
    isRanked, setIsRanked,
    rankingRange, setRankingRange,
    estimatedMaxParticipants, setEstimatedMaxParticipants
  } = useWizardStore();

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
    </motion.div>
  );
}

import { useShallow } from 'zustand/react/shallow';
import { useWizardStore } from '../../store/wizardStore';
import { Trophy, Users, GitMerge, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { AGE_CATEGORIES } from '@/config/categories';
import { RANKINGS } from '@/config/rankings';

const formats = [
  {
    id: 'single_elimination',
    name: 'Single Elimination',
    description: 'Lose once and you are out. The classic bracket format.',
    icon: GitMerge,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    hover: 'group-hover:border-blue-500/50'
  },
  {
    id: 'double_elimination',
    name: 'Double Elimination',
    description: 'Lose twice to be eliminated. Includes a losers bracket.',
    icon: Repeat,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    hover: 'group-hover:border-purple-500/50'
  },
  {
    id: 'round_robin',
    name: 'Round Robin',
    description: 'Everyone plays everyone. Best record wins.',
    icon: Users,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    hover: 'group-hover:border-emerald-500/50'
  },
  {
    id: 'swiss',
    name: 'Swiss System',
    description: 'Play opponents with similar scores. No elimination.',
    icon: Trophy,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    hover: 'group-hover:border-amber-500/50'
  }
] as const;

export function FormatSelection() {
  // State values - use useShallow to prevent unnecessary re-renders
  const {
    format, tournamentName, ageCategory, customAgeRules, isRanked, rankingRange
  } = useWizardStore(useShallow((s) => ({
    format: s.format,
    tournamentName: s.tournamentName,
    ageCategory: s.ageCategory,
    customAgeRules: s.customAgeRules,
    isRanked: s.isRanked,
    rankingRange: s.rankingRange
  })));

  // Actions - stable references, no useShallow needed
  const setFormat = useWizardStore((s) => s.setFormat);
  const setTournamentName = useWizardStore((s) => s.setTournamentName);
  const setAgeCategory = useWizardStore((s) => s.setAgeCategory);
  const setCustomAgeRules = useWizardStore((s) => s.setCustomAgeRules);
  const setIsRanked = useWizardStore((s) => s.setIsRanked);
  const setRankingRange = useWizardStore((s) => s.setRankingRange);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <label className="text-sm font-medium text-slate-300">Tournament Name</label>
        <input
          type="text"
          value={tournamentName}
          onChange={(e) => setTournamentName(e.target.value)}
          placeholder="e.g. Summer Championship 2024"
          className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          autoFocus
        />
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium text-slate-300">Age Category</label>
        <select
          value={ageCategory}
          onChange={(e) => setAgeCategory(e.target.value)}
          className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
        >
          {AGE_CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id} className="bg-slate-900 text-white">
              {cat.name} {cat.description ? `- ${cat.description}` : ''}
            </option>
          ))}
          <option value="custom" className="bg-slate-900 text-white">Custom Age Rules</option>
        </select>

        {ageCategory === 'custom' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-2 gap-4 mt-4"
          >
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Min Age</label>
              <input
                type="number"
                min="1"
                max="99"
                placeholder="Min"
                value={customAgeRules.min || ''}
                onChange={(e) => setCustomAgeRules({ ...customAgeRules, min: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Max Age</label>
              <input
                type="number"
                min="1"
                max="99"
                placeholder="Max"
                value={customAgeRules.max || ''}
                onChange={(e) => setCustomAgeRules({ ...customAgeRules, max: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </motion.div>
        )}
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium text-slate-300">Tournament Type</label>
        <div className="flex gap-4">
          <button
            onClick={() => setIsRanked(false)}
            className={cn(
              "flex-1 p-4 rounded-xl border text-center transition-all",
              !isRanked 
                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                : "bg-slate-900/50 border-white/5 text-slate-400 hover:bg-slate-800"
            )}
          >
            <div className="font-bold mb-1">Friendly</div>
            <div className="text-xs opacity-70">No ranking restrictions</div>
          </button>
          <button
            onClick={() => setIsRanked(true)}
            className={cn(
              "flex-1 p-4 rounded-xl border text-center transition-all",
              isRanked 
                ? "bg-blue-500/10 border-blue-500/50 text-blue-400" 
                : "bg-slate-900/50 border-white/5 text-slate-400 hover:bg-slate-800"
            )}
          >
            <div className="font-bold mb-1">Ranked (Official)</div>
            <div className="text-xs opacity-70">FFT Ranking System</div>
          </button>
        </div>

        {isRanked && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-2 gap-4 mt-4 p-4 bg-slate-900/50 rounded-xl border border-white/5"
          >
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Min Ranking</label>
              <select
                value={rankingRange.min || ''}
                onChange={(e) => setRankingRange({ ...rankingRange, min: e.target.value || undefined })}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">Any</option>
                {RANKINGS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 mb-1 block">Max Ranking</label>
              <select
                value={rankingRange.max || ''}
                onChange={(e) => setRankingRange({ ...rankingRange, max: e.target.value || undefined })}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">Any</option>
                {RANKINGS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium text-slate-300">Select Format</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formats.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setFormat(item.id)}
              className={cn(
                "relative p-6 rounded-xl border text-left transition-all duration-200 group",
                format === item.id 
                  ? `bg-slate-800 ${item.border} ring-2 ring-offset-2 ring-offset-slate-950 ring-blue-500` 
                  : `bg-slate-900/50 border-white/5 hover:bg-slate-800 ${item.hover}`
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn("p-3 rounded-lg", item.bg)}>
                  <item.icon className={cn("w-6 h-6", item.color)} />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-white text-lg">{item.name}</h3>
                  <p className="text-sm text-slate-400 mt-1">{item.description}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

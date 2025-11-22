import { useWizardStore } from '../../store/wizardStore';
import { Trophy, Users, GitMerge, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
  const { format, setFormat, tournamentName, setTournamentName } = useWizardStore();

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

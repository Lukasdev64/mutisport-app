import { Trophy, Clock, Flag, AlertCircle } from 'lucide-react';
import type { TennisMatchConfig } from '@/types/tennis';
import { cn } from '@/lib/utils';

interface TennisRulesModuleProps {
  config: TennisMatchConfig;
  compact?: boolean;
}

/**
 * Tennis Rules Display Module
 *
 * Displays tennis tournament rules in either compact (badges) or full format.
 * Used in the tournament arena sidebar and settings modal.
 */
export function TennisRulesModule({ config, compact = false }: TennisRulesModuleProps) {
  if (compact) {
    // Ultra compact version - inline badges
    const badges = [
      { label: config.format === 'best_of_5' ? '5 Sets' : '3 Sets', color: 'bg-blue-500/20 text-blue-400' },
      { label: config.surface, color: 'bg-emerald-500/20 text-emerald-400' },
      { label: config.decidingPointAtDeuce ? 'No-Ad' : 'Avantage', color: 'bg-purple-500/20 text-purple-400' },
      { label: `TB ${config.tiebreakAt}-${config.tiebreakAt}`, color: 'bg-amber-500/20 text-amber-400' },
    ];

    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {badges.map((badge, i) => (
            <span
              key={i}
              className={cn(
                "px-2 py-0.5 rounded text-[10px] font-medium capitalize",
                badge.color
              )}
            >
              {badge.label}
            </span>
          ))}
        </div>
        <div className="flex gap-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {config.warmupMinutes}m warmup
          </span>
          <span className="flex items-center gap-1">
            <Flag className="w-3 h-3" /> {config.changeoverSeconds}s change
          </span>
        </div>
        {config.coachingAllowed && (
          <span className="text-[10px] text-emerald-400">Coaching autorise</span>
        )}
      </div>
    );
  }

  // Full version
  return (
    <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-white/5">
        <Trophy className="w-4 h-4 text-emerald-400" />
        <h3 className="font-bold text-white">Regles du Tournoi</h3>
      </div>

      <div className="space-y-3 text-sm">
        {/* Match Format */}
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Format</span>
          <span className="text-white font-medium">
            {config.format === 'best_of_5' ? '5 Sets' : '3 Sets'}
          </span>
        </div>

        {/* Surface */}
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Surface</span>
          <span className="text-white font-medium capitalize">
            {config.surface}
          </span>
        </div>

        {/* Tie-break */}
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Tie-break</span>
          <span className="text-white font-medium">
            {config.tiebreakAt}-{config.tiebreakAt}
            {config.finalSetTiebreak && <span className="text-xs text-slate-500 ml-1">(Final)</span>}
          </span>
        </div>

        {/* Scoring */}
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Scoring</span>
          <span className="text-white font-medium">
            {config.decidingPointAtDeuce ? 'No-Ad' : 'Advantage'}
          </span>
        </div>

        {/* Coaching */}
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Coaching</span>
          <span className={config.coachingAllowed ? "text-emerald-400" : "text-red-400"}>
            {config.coachingAllowed ? 'Autorise' : 'Interdit'}
          </span>
        </div>
      </div>

      {/* Time Rules */}
      <div className="pt-3 border-t border-white/5 grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-900/50 p-2 rounded">
          <Clock className="w-3 h-3 text-slate-500 mx-auto mb-1" />
          <div className="text-xs text-white">{config.warmupMinutes}m</div>
          <div className="text-[10px] text-slate-500">Warmup</div>
        </div>
        <div className="bg-slate-900/50 p-2 rounded">
          <Flag className="w-3 h-3 text-slate-500 mx-auto mb-1" />
          <div className="text-xs text-white">{config.changeoverSeconds}s</div>
          <div className="text-[10px] text-slate-500">Change</div>
        </div>
        <div className="bg-slate-900/50 p-2 rounded">
          <AlertCircle className="w-3 h-3 text-slate-500 mx-auto mb-1" />
          <div className="text-xs text-white">{config.betweenPointsSeconds}s</div>
          <div className="text-[10px] text-slate-500">Point</div>
        </div>
      </div>
    </div>
  );
}

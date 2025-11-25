import { Trophy, Clock, Flag, AlertCircle } from 'lucide-react';
import type { TennisMatchConfig } from '@/types/tennis';

interface TennisRulesModuleProps {
  config: TennisMatchConfig;
}

export function TennisRulesModule({ config }: TennisRulesModuleProps) {
  return (
    <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-white/5">
        <Trophy className="w-4 h-4 text-emerald-400" />
        <h3 className="font-bold text-white">Règles du Tournoi</h3>
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
            {config.coachingAllowed ? 'Autorisé' : 'Interdit'}
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

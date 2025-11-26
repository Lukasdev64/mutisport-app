/**
 * Sport Selection Hub
 *
 * Landing page for tournament creation - allows user to select which sport
 * before entering the sport-specific wizard.
 *
 * Routes to:
 * - /tournaments/new/tennis → Tennis Wizard
 * - /tournaments/new/basketball → Basketball Wizard (WIP)
 * - etc.
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SPORT_IMPLEMENTATION_STATUS,
  getImplementationStatusLabel,
  isSportUsable,
  SPORTS
} from '@/types/sport';
import type { SportType } from '@/types/sport';

interface SportOption {
  id: SportType;
  wizardPath: string;
}

const SPORT_OPTIONS: SportOption[] = [
  { id: 'tennis', wizardPath: '/tournaments/new/tennis' },
  { id: 'basketball', wizardPath: '/tournaments/new/basketball' },
  { id: 'football', wizardPath: '/tournaments/new/football' },
];

export function SportSelectionHub() {
  const navigate = useNavigate();

  const handleSelectSport = (option: SportOption) => {
    if (isSportUsable(option.id)) {
      navigate(option.wizardPath);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Nouveau Tournoi
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Quel sport ?
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Chaque sport dispose de son propre assistant de création
            avec des règles et options personnalisées.
          </p>
        </motion.div>

        {/* Sport Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {SPORT_OPTIONS.map((option, index) => {
            const sport = SPORTS[option.id];
            const status = SPORT_IMPLEMENTATION_STATUS[option.id];
            const statusLabel = getImplementationStatusLabel(status);
            const isUsable = isSportUsable(option.id);
            const isImplemented = status === 'implemented';

            return (
              <motion.button
                key={option.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSelectSport(option)}
                disabled={!isUsable}
                className={cn(
                  "relative group p-8 rounded-2xl border-2 text-left transition-all duration-300",
                  isUsable
                    ? "bg-slate-900/50 border-white/10 hover:border-blue-500/50 hover:bg-slate-800/50 cursor-pointer"
                    : "bg-slate-900/30 border-white/5 opacity-50 cursor-not-allowed"
                )}
              >
                {/* Status Badge */}
                {statusLabel && (
                  <div className={cn(
                    "absolute -top-3 -right-3 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1",
                    status === 'partial'
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-slate-700/80 text-slate-400 border border-slate-600"
                  )}>
                    <Clock className="w-3 h-3" />
                    {statusLabel}
                  </div>
                )}

                {/* Sport Emoji */}
                <div className="text-6xl mb-4">{sport.emoji}</div>

                {/* Sport Name */}
                <h2 className={cn(
                  "text-2xl font-bold mb-2",
                  isUsable ? "text-white" : "text-slate-500"
                )}>
                  {sport.name}
                </h2>

                {/* Description */}
                <p className={cn(
                  "text-sm mb-4",
                  isUsable ? "text-slate-400" : "text-slate-600"
                )}>
                  {isImplemented && "Assistant complet avec presets et personnalisation des règles"}
                  {status === 'partial' && "Assistant simplifié - personnalisation des règles bientôt disponible"}
                  {status === 'wip' && "En cours de développement"}
                </p>

                {/* Features */}
                {isImplemented && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full">
                      Presets
                    </span>
                    <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full">
                      Règles personnalisées
                    </span>
                    <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full">
                      Quick Start
                    </span>
                  </div>
                )}

                {/* Arrow */}
                {isUsable && (
                  <div className="flex items-center gap-2 text-blue-400 group-hover:translate-x-2 transition-transform">
                    <span className="text-sm font-medium">Commencer</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <button
            onClick={() => navigate('/tournaments')}
            className="text-slate-500 hover:text-white transition-colors"
          >
            Retour aux tournois
          </button>
        </motion.div>
      </div>
    </div>
  );
}

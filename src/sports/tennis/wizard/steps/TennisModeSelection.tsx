/**
 * Tennis Mode Selection Step
 *
 * First step of the Tennis wizard - choose between:
 * - Quick Start: One-page tournament creation
 * - Instant: Fast multi-step wizard
 * - Planned: Full wizard with campaign management
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Clock, Calendar, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTennisWizardStore } from '../store';

const MODES = [
  {
    id: 'quickstart' as const,
    name: 'Quick Start',
    description: 'Tout sur un seul écran - jouez en moins d\'une minute',
    icon: Zap,
    color: 'yellow',
    features: ['Presets rapides', '4 joueurs minimum', 'Lancement immédiat'],
  },
  {
    id: 'instant' as const,
    name: 'Tournoi Instantané',
    description: 'Configuration guidée en quelques étapes',
    icon: Clock,
    color: 'blue',
    features: ['Personnalisation des règles', 'Import de joueurs', 'Formats variés'],
  },
  {
    id: 'planned' as const,
    name: 'Tournoi Planifié',
    description: 'Organisation complète avec inscriptions',
    icon: Calendar,
    color: 'purple',
    features: ['Formulaire d\'inscription', 'Gestion des candidatures', 'Planning automatique'],
  },
];

export function TennisModeSelection() {
  const navigate = useNavigate();
  const setMode = useTennisWizardStore((s) => s.setMode);
  const nextStep = useTennisWizardStore((s) => s.nextStep);

  const handleSelectMode = (modeId: typeof MODES[number]['id']) => {
    if (modeId === 'quickstart') {
      setMode('quickstart');
      navigate('/tournaments/new/tennis?mode=quickstart');
    } else {
      setMode(modeId);
      nextStep();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Comment voulez-vous créer votre tournoi ?</h2>
        <p className="text-slate-400">Choisissez le mode qui correspond le mieux à vos besoins</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MODES.map((mode, index) => {
          const Icon = mode.icon;
          const colorClasses = {
            yellow: {
              bg: 'bg-yellow-500/10',
              border: 'border-yellow-500/30',
              hover: 'hover:border-yellow-500/50',
              icon: 'text-yellow-400',
              badge: 'bg-yellow-500/20 text-yellow-400',
            },
            blue: {
              bg: 'bg-blue-500/10',
              border: 'border-blue-500/30',
              hover: 'hover:border-blue-500/50',
              icon: 'text-blue-400',
              badge: 'bg-blue-500/20 text-blue-400',
            },
            purple: {
              bg: 'bg-purple-500/10',
              border: 'border-purple-500/30',
              hover: 'hover:border-purple-500/50',
              icon: 'text-purple-400',
              badge: 'bg-purple-500/20 text-purple-400',
            },
          }[mode.color];

          return (
            <motion.button
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleSelectMode(mode.id)}
              className={cn(
                "group relative p-6 rounded-2xl border-2 text-left transition-all",
                "bg-slate-900/50",
                colorClasses?.border,
                colorClasses?.hover
              )}
            >
              {/* Icon */}
              <div className={cn("inline-flex p-3 rounded-xl mb-4", colorClasses?.bg)}>
                <Icon className={cn("w-6 h-6", colorClasses?.icon)} />
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-2">{mode.name}</h3>

              {/* Description */}
              <p className="text-sm text-slate-400 mb-4">{mode.description}</p>

              {/* Features */}
              <ul className="space-y-2 mb-4">
                {mode.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-xs text-slate-500">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Arrow */}
              <div className={cn(
                "flex items-center gap-2 text-sm font-medium transition-transform group-hover:translate-x-2",
                colorClasses?.icon
              )}>
                Choisir
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

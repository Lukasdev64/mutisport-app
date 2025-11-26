/**
 * Tennis Summary Step
 *
 * Final review before launching the tournament:
 * - Tournament info
 * - Tennis rules summary
 * - Player list
 * - Format
 */

import { useShallow } from 'zustand/react/shallow';
import { motion } from 'framer-motion';
import { Trophy, Users, Settings, Calendar } from 'lucide-react';
import { useTennisWizardStore } from '../store';
import { TENNIS_TOURNAMENT_PRESETS } from '../../tournamentPresets';

export function TennisSummary() {
  const {
    tournamentName, startDate, venue, presetId, config, format, players
  } = useTennisWizardStore(useShallow((s) => ({
    tournamentName: s.tournamentName,
    startDate: s.startDate,
    venue: s.venue,
    presetId: s.presetId,
    config: s.config,
    format: s.format,
    players: s.players,
  })));

  const selectedPreset = TENNIS_TOURNAMENT_PRESETS.find(p => p.id === presetId);

  const formatNames: Record<string, string> = {
    single_elimination: 'Simple Élimination',
    double_elimination: 'Double Élimination',
    round_robin: 'Round Robin',
    swiss: 'Swiss System',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Récapitulatif</h2>
        <p className="text-slate-400">Vérifiez les détails avant de lancer</p>
      </div>

      {/* Tournament Info Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="text-4xl">🎾</div>
          <div>
            <h3 className="text-xl font-bold text-white">
              {tournamentName || 'Tournoi Tennis'}
            </h3>
            <p className="text-sm text-slate-300">Tournoi de Tennis</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Date */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <div>
              <div className="text-xs text-slate-500">Date</div>
              <div className="text-sm text-white">
                {startDate.toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </div>
            </div>
          </div>

          {/* Venue */}
          {venue && (
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-slate-400" />
              <div>
                <div className="text-xs text-slate-500">Lieu</div>
                <div className="text-sm text-white">{venue}</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Rules Card */}
      {selectedPreset && config && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/50 border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-white">Règles du Match</h4>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{selectedPreset.emoji}</span>
            <div>
              <div className="font-medium text-white">{selectedPreset.name}</div>
              <div className="text-xs text-slate-400">{selectedPreset.description}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-xs text-slate-500 mb-1">Format</div>
              <div className="text-white font-medium">
                {config.format === 'best_of_5' ? '5 sets' : '3 sets'}
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-xs text-slate-500 mb-1">Surface</div>
              <div className="text-white font-medium capitalize">{config.surface}</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-xs text-slate-500 mb-1">Tie-break</div>
              <div className="text-white font-medium">À {config.tiebreakAt}-{config.tiebreakAt}</div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-3">
              <div className="text-xs text-slate-500 mb-1">Scoring</div>
              <div className="text-white font-medium">
                {config.decidingPointAtDeuce ? 'No-Ad' : 'Avantage'}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Format & Players Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/50 border border-white/10 rounded-xl p-6"
      >
        <div className="grid grid-cols-2 gap-6">
          {/* Format */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h4 className="font-bold text-white">Format</h4>
            </div>
            <div className="text-lg text-white font-medium">
              {format ? formatNames[format] : 'Non défini'}
            </div>
          </div>

          {/* Players */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-blue-400" />
              <h4 className="font-bold text-white">Joueurs</h4>
            </div>
            <div className="text-lg text-white font-medium">
              {players.length} participant{players.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Player Names Preview */}
        {players.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex flex-wrap gap-2">
              {players.slice(0, 8).map((player) => (
                <span
                  key={player.id}
                  className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300"
                >
                  {player.name}
                </span>
              ))}
              {players.length > 8 && (
                <span className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-500">
                  +{players.length - 8} autres
                </span>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Ready Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center py-4"
      >
        <p className="text-emerald-400 font-medium">
          Tout est prêt ! Cliquez sur "Lancer le Tournoi" pour commencer.
        </p>
      </motion.div>
    </motion.div>
  );
}

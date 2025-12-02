/**
 * Tennis Tournament Setup Step
 *
 * Basic tournament information for planned mode:
 * - Tournament name
 * - Start date
 * - Venue
 * - Description
 */

import { useShallow } from 'zustand/react/shallow';
import { Calendar, MapPin, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTennisWizardStore } from '../store';

export function TennisTournamentSetup() {
  const {
    tournamentName, startDate, venue, description
  } = useTennisWizardStore(useShallow((s) => ({
    tournamentName: s.tournamentName,
    startDate: s.startDate,
    venue: s.venue,
    description: s.description,
  })));

  const setTournamentName = useTennisWizardStore((s) => s.setTournamentName);
  const setStartDate = useTennisWizardStore((s) => s.setStartDate);
  const setVenue = useTennisWizardStore((s) => s.setVenue);
  const setDescription = useTennisWizardStore((s) => s.setDescription);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-2xl mx-auto"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Configuration du Tournoi</h2>
        <p className="text-slate-400">Définissez les informations de base</p>
      </div>

      {/* Tournament Name */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Nom du Tournoi
          <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={tournamentName}
          onChange={(e) => setTournamentName(e.target.value)}
          placeholder="Ex: Tournoi d'Été 2024"
          className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
          autoFocus
        />
      </div>

      {/* Start Date */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Date de Début
          <span className="text-red-400">*</span>
        </label>
        <input
          type="date"
          value={startDate.toISOString().split('T')[0]}
          onChange={(e) => setStartDate(new Date(e.target.value))}
          min={new Date().toISOString().split('T')[0]}
          className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
        />
      </div>

      {/* Venue */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Lieu
          <span className="text-slate-500 text-xs ml-1">(optionnel)</span>
        </label>
        <input
          type="text"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          placeholder="Ex: Tennis Club de Paris"
          className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
        />
      </div>

      {/* Description */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Description
          <span className="text-slate-500 text-xs ml-1">(optionnel)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Informations supplémentaires sur le tournoi..."
          rows={4}
          className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none"
        />
      </div>

      {/* Preview */}
      {tournamentName && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6"
        >
          <h3 className="text-sm font-medium text-emerald-400 mb-3">Aperçu</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Tournoi:</span>
              <span className="text-white font-medium">{tournamentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Date:</span>
              <span className="text-white font-medium">
                {startDate.toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            {venue && (
              <div className="flex justify-between">
                <span className="text-slate-400">Lieu:</span>
                <span className="text-white font-medium">{venue}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

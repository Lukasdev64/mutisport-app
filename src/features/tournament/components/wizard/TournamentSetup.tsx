import { useShallow } from 'zustand/react/shallow';
import { useWizardStore } from '../../store/wizardStore';
import { Calendar, MapPin, FileText, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function TournamentSetup() {
  // State values - use useShallow to prevent unnecessary re-renders
  const {
    tournamentName, sport, startDate, venue, description
  } = useWizardStore(useShallow((s) => ({
    tournamentName: s.tournamentName,
    sport: s.sport,
    startDate: s.startDate,
    venue: s.venue,
    description: s.description
  })));

  // Actions - stable references, no useShallow needed
  const setTournamentName = useWizardStore((s) => s.setTournamentName);
  const setSport = useWizardStore((s) => s.setSport);
  const setStartDate = useWizardStore((s) => s.setStartDate);
  const setVenue = useWizardStore((s) => s.setVenue);
  const setDescription = useWizardStore((s) => s.setDescription);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-2xl mx-auto"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Configuration du Tournoi</h2>
        <p className="text-slate-400">Définissez les informations de base de votre tournoi</p>
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
          className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
          autoFocus
        />
        <p className="text-xs text-slate-500">
          Ce nom sera visible par tous les participants
        </p>
      </div>

      {/* Sport Selection */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          Sport
          <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { id: 'tennis' as const, name: 'Tennis', emoji: '🎾' },
            { id: 'football' as const, name: 'Football', emoji: '⚽' },
            { id: 'basketball' as const, name: 'Basketball', emoji: '🏀' },
            { id: 'other' as const, name: 'Autre', emoji: '🏆' }
          ].map((sportOption) => (
            <button
              key={sportOption.id}
              onClick={() => setSport(sportOption.id)}
              className={cn(
                "p-4 rounded-xl border-2 transition-all text-center",
                sport === sportOption.id
                  ? "bg-blue-500/20 border-blue-500 shadow-lg"
                  : "bg-slate-900/50 border-white/10 hover:border-white/20 hover:bg-slate-800"
              )}
            >
              <div className="text-3xl mb-2">{sportOption.emoji}</div>
              <div className={cn(
                "font-medium text-sm",
                sport === sportOption.id ? "text-blue-400" : "text-slate-300"
              )}>
                {sportOption.name}
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          Le sport sélectionné déterminera les options de règles disponibles
        </p>
      </div>

      {/* Start Date */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Date de Début Prévue
          <span className="text-red-400">*</span>
        </label>
        <input
          type="date"
          value={startDate.toISOString().split('T')[0]}
          onChange={(e) => setStartDate(new Date(e.target.value))}
          min={new Date().toISOString().split('T')[0]}
          className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
        />
        <p className="text-xs text-slate-500">
          Cette date sera utilisée pour générer le calendrier des matchs
        </p>
      </div>

      {/* Venue (Optional) */}
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
          className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
        />
      </div>

      {/* Description (Optional) */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Description
          <span className="text-slate-500 text-xs ml-1">(optionnel)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ajoutez des détails sur le tournoi, les règles spécifiques, etc."
          rows={4}
          className="w-full bg-slate-900/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
        />
        <p className="text-xs text-slate-500">
          Ces informations seront visibles dans le formulaire d'inscription
        </p>
      </div>

      {/* Summary Card */}
      {tournamentName && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6"
        >
          <h3 className="text-sm font-medium text-blue-400 mb-3">Aperçu</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Tournoi:</span>
              <span className="text-white font-medium">{tournamentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sport:</span>
              <span className="text-white font-medium capitalize">{sport}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Début:</span>
              <span className="text-white font-medium">
                {startDate.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
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

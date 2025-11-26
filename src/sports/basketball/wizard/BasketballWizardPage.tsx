/**
 * Basketball Wizard Page (WIP)
 *
 * Placeholder for the Basketball tournament creation wizard.
 * Currently shows a "coming soon" message.
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Wrench, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BasketballWizardPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-2xl mx-auto py-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-orange-500/10 border border-orange-500/30 mb-8">
            <span className="text-5xl">🏀</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-4">
            Basketball
          </h1>
          <p className="text-xl text-slate-400 mb-8">
            Assistant de création en cours de développement
          </p>

          {/* Status Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-8 mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Wrench className="w-6 h-6 text-orange-400" />
              <span className="text-lg font-bold text-orange-400">En Construction</span>
            </div>

            <p className="text-slate-300 mb-6">
              L'assistant de création de tournois Basketball est en cours de développement.
              Il proposera des fonctionnalités sur-mesure pour ce sport :
            </p>

            <ul className="text-left space-y-3 text-sm text-slate-400 max-w-md mx-auto">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500/50" />
                Configuration des quarts-temps et prolongations
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500/50" />
                Presets NBA, FIBA, Universitaire
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500/50" />
                Gestion des équipes et effectifs
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500/50" />
                Scoring en temps réel
              </li>
            </ul>
          </motion.div>

          {/* Notification CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Button
              variant="outline"
              className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
              disabled
            >
              <Bell className="w-4 h-4 mr-2" />
              Me notifier quand disponible
            </Button>
            <p className="text-xs text-slate-600 mt-2">Bientôt disponible</p>
          </motion.div>

          {/* Back Button */}
          <Button
            onClick={() => navigate('/tournaments/new')}
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à la sélection
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { Zap, Calendar, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useFootballWizardStore } from '../store';

export function FootballModeSelection() {
  const { mode, setMode, nextStep } = useFootballWizardStore();

  const handleSelect = (selectedMode: 'instant' | 'planned') => {
    setMode(selectedMode);
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Choisir le Type de Tournoi</h2>
        <p className="text-white/60">Comment souhaitez-vous organiser ce tournoi de football ?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className={`p-6 cursor-pointer transition-all hover:border-emerald-500/50 ${
            mode === 'instant' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-white/5'
          }`}
          onClick={() => handleSelect('instant')}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-400">
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Tournoi Instantané</h3>
              <p className="text-sm text-white/60 mt-1">
                Commencez à jouer immédiatement. Configuration rapide, pas de planification avancée.
              </p>
            </div>
          </div>
        </Card>

        <Card
          className={`p-6 cursor-pointer transition-all hover:border-blue-500/50 ${
            mode === 'planned' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5'
          }`}
          onClick={() => handleSelect('planned')}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-full bg-blue-500/20 text-blue-400">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Tournoi Planifié</h3>
              <p className="text-sm text-white/60 mt-1">
                Planifiez pour plus tard. Gérez les invitations, le lieu et les règles détaillées.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

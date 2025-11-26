/**
 * Tennis Wizard Page
 *
 * Dedicated tournament creation wizard for Tennis.
 * Completely isolated from other sports.
 *
 * Routes:
 * - /tournaments/new/tennis
 * - /tournaments/new/tennis/quickstart
 */

import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { useShallow } from 'zustand/react/shallow';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { useTournamentStore } from '@/features/tournament/store/tournamentStore';
import { useCreateTournament } from '@/hooks/useTournaments';
import { TournamentEngine } from '@/features/tournament/logic/engine';
import type { Tournament } from '@/types/tournament';

import { useTennisWizardStore } from './store';
import { TennisModeSelection } from './steps/TennisModeSelection';
import { TennisQuickStart } from './steps/TennisQuickStart';
import { TennisTournamentSetup } from './steps/TennisTournamentSetup';
import { TennisFormatAndRules } from './steps/TennisFormatAndRules';
import { TennisPlayerSelection } from './steps/TennisPlayerSelection';
import { TennisSummary } from './steps/TennisSummary';

export function TennisWizardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isQuickStart = searchParams.get('mode') === 'quickstart';

  // Store state
  const {
    step, totalSteps, mode, tournamentName, config, format, players, selectedPlayers
  } = useTennisWizardStore(useShallow((s) => ({
    step: s.step,
    totalSteps: s.totalSteps,
    mode: s.mode,
    tournamentName: s.tournamentName,
    config: s.config,
    format: s.format,
    players: s.players,
    selectedPlayers: s.selectedPlayers,
  })));

  // Actions
  const nextStep = useTennisWizardStore((s) => s.nextStep);
  const prevStep = useTennisWizardStore((s) => s.prevStep);
  const setMode = useTennisWizardStore((s) => s.setMode);
  const reset = useTennisWizardStore((s) => s.reset);

  // Tournament creation
  const createLocalTournament = useTournamentStore((s) => s.createTournament);
  const createTournamentMutation = useCreateTournament();

  // Handle quickstart mode from URL
  useEffect(() => {
    if (isQuickStart && mode !== 'quickstart') {
      setMode('quickstart');
    }
  }, [isQuickStart, mode, setMode]);

  // Reset wizard on unmount
  useEffect(() => {
    return () => {
      // Don't reset if navigating to tournament
      const path = window.location.pathname;
      if (!path.startsWith('/tournaments/') || path.includes('/new')) {
        reset();
      }
    };
  }, [reset]);

  const canProceed = (): boolean => {
    if (mode === 'quickstart') return false; // QuickStart handles its own flow

    if (mode === 'instant') {
      if (step === 1) return true; // Mode selection
      if (step === 2) return !!config && !!format; // Format & Rules
      if (step === 3) return players.length >= 2; // Players
      if (step === 4) return true; // Summary
    }

    if (mode === 'planned') {
      if (step === 1) return true; // Mode selection
      if (step === 2) return !!tournamentName; // Tournament setup
      if (step === 3) return !!config && !!format; // Format & Rules
      if (step === 4) return true; // Campaign setup
      if (step === 5) return selectedPlayers.length >= 2 || players.length >= 2; // Player selection
      if (step === 6) return true; // Summary
    }

    return true;
  };

  const handleCreateTournament = () => {
    if (!format || !config) return;

    const finalPlayers = selectedPlayers.length > 0 ? selectedPlayers : players;
    const finalName = tournamentName || `Tournoi Tennis ${new Date().toLocaleDateString()}`;
    const rounds = TournamentEngine.generateBracket(finalPlayers, format);

    const newTournament: Tournament = {
      id: uuidv4(),
      name: finalName,
      format,
      sport: 'tennis',
      tennisConfig: config,
      status: 'active',
      players: finalPlayers,
      rounds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        pointsForWin: 3,
        pointsForDraw: 1,
        pointsForLoss: 0,
      },
    };

    createLocalTournament(newTournament);
    createTournamentMutation.mutate(newTournament);
    reset();
    navigate(`/tournaments/${newTournament.id}`);
  };

  // Swipe handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (step < totalSteps && canProceed()) nextStep();
    },
    onSwipedRight: () => {
      if (step > 1) prevStep();
    },
    trackMouse: false,
    trackTouch: true,
    delta: 50,
    swipeDuration: 500,
    preventScrollOnSwipe: false,
  });

  // Render QuickStart mode
  if (mode === 'quickstart') {
    return <TennisQuickStart />;
  }

  // Render step content
  const renderStep = () => {
    if (mode === 'instant') {
      switch (step) {
        case 1: return <TennisModeSelection />;
        case 2: return <TennisFormatAndRules />;
        case 3: return <TennisPlayerSelection />;
        case 4: return <TennisSummary />;
        default: return null;
      }
    }

    if (mode === 'planned') {
      switch (step) {
        case 1: return <TennisModeSelection />;
        case 2: return <TennisTournamentSetup />;
        case 3: return <TennisFormatAndRules />;
        case 4: return <TennisPlayerSelection />; // Simplified - could add CampaignSetup
        case 5: return <TennisPlayerSelection />;
        case 6: return <TennisSummary />;
        default: return null;
      }
    }

    return <TennisModeSelection />;
  };

  const getTitle = () => {
    if (mode === 'instant') {
      return ['Choisir le Mode', 'Format & Règles', 'Joueurs', 'Récapitulatif'][step - 1];
    }
    if (mode === 'planned') {
      return ['Choisir le Mode', 'Configuration', 'Format & Règles', 'Recrutement', 'Joueurs', 'Récapitulatif'][step - 1];
    }
    return 'Nouveau Tournoi Tennis';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-4xl mx-auto py-6 md:py-12 px-4" {...swipeHandlers}>
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm font-medium mb-4">
            <span className="text-lg">🎾</span>
            Tennis
          </div>
          <motion.h1
            key={step}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-heading font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent"
          >
            {getTitle()}
          </motion.h1>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 relative h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                idx + 1 === step
                  ? 'w-6 bg-emerald-500'
                  : idx + 1 < step
                    ? 'bg-emerald-500'
                    : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Mobile Swipe Hint */}
        <div className="md:hidden text-center text-xs text-slate-600 mb-4">
          Swipez pour naviguer
        </div>

        {/* Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-[400px]"
        >
          {renderStep()}
        </motion.div>

        {/* Navigation */}
        <div className="flex justify-between mt-12 pt-8 border-t border-white/10">
          <Button
            variant="ghost"
            onClick={step === 1 ? () => navigate('/tournaments/new') : prevStep}
            className="text-slate-400 hover:text-white"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            {step === 1 ? 'Retour' : 'Précédent'}
          </Button>

          {step < totalSteps ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              Suivant
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleCreateTournament}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              Lancer le Tournoi
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

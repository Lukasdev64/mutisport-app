import { motion } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import { useShallow } from 'zustand/react/shallow';
import { useWizardStore } from '../../store/wizardStore';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTournamentStore } from '../../store/tournamentStore';
import { useCreateTournament } from '@/hooks/useTournaments';
// Sport store available if needed
// import { useSportStore } from '@/store/sportStore';
import { TournamentEngine } from '../../logic/engine';
import { v4 as uuidv4 } from 'uuid';
import type { Tournament } from '@/types/tournament';
import type { SportType } from '@/types/sport';

/** Maps wizard sport selection to valid SportType */
const mapWizardSportToSportType = (wizardSport: string): SportType => {
  if (wizardSport === 'other') return 'generic';
  return wizardSport as SportType;
};

// Force reload fix

interface WizardLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export function WizardLayout({ children, title, description }: WizardLayoutProps) {
  // State values - use useShallow to prevent unnecessary re-renders
  const {
    step, totalSteps, players, selectedPlayers, format,
    tournamentName, sport, tennisConfig, mode
  } = useWizardStore(useShallow((s) => ({
    step: s.step,
    totalSteps: s.totalSteps,
    players: s.players,
    selectedPlayers: s.selectedPlayers,
    format: s.format,
    tournamentName: s.tournamentName,
    sport: s.sport,
    tennisConfig: s.tennisConfig,
    mode: s.mode
  })));

  // Actions - stable references, no useShallow needed
  const prevStep = useWizardStore((s) => s.prevStep);
  const nextStep = useWizardStore((s) => s.nextStep);

  const createLocalTournament = useTournamentStore((s) => s.createTournament);
  const createTournamentMutation = useCreateTournament();
  const navigate = useNavigate();

  const canProceed = () => {
    if (step === 1) return true; // Mode selection
    
    if (mode === 'planned') {
      // PLANNED MODE
      // Step 2: Tournament Setup - requires name
      if (step === 2) return !!tournamentName;
      
      // Step 3: Format & Rules
      if (step === 3) {
        if (sport === 'tennis') {
          return !!tennisConfig && !!format;
        }
        return !!format;
      }
    } else {
      // INSTANT MODE
      // Step 2: Format & Rules (Skipped Setup)
      if (step === 2) {
        if (sport === 'tennis') {
          return !!tennisConfig && !!format;
        }
        return !!format;
      }
      
      // Step 3: Player Selection
      if (step === 3) return true; // Allow proceeding to summary
    }
    
    // Other steps
    return true;
  };

  const handleCreateTournament = async () => {
    // Allow empty name in instant mode
    if (!format || (mode === 'planned' && !tournamentName)) return;

    const finalName = tournamentName || `Tournoi ${new Date().toLocaleDateString()}`;

    // CRITICAL: Use selectedPlayers (those validated in CampaignSetup), not all registered players
    const finalPlayers = selectedPlayers.length > 0 ? selectedPlayers : players;
    const rounds = TournamentEngine.generateBracket(finalPlayers, format);

    const newTournament: Tournament = {
      id: uuidv4(),
      name: finalName,
      format: format,
      sport: mapWizardSportToSportType(sport),
      tennisConfig: sport === 'tennis' ? tennisConfig : undefined, // Save tennis config
      status: 'active',
      players: finalPlayers, // Only selected players!
      rounds: rounds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        pointsForWin: 3,
        pointsForDraw: 1,
        pointsForLoss: 0
      }
    };

    // Save to local store for immediate access
    createLocalTournament(newTournament);

    // Save to Supabase (async, don't block navigation)
    createTournamentMutation.mutate(newTournament);

    navigate(`/tournaments/${newTournament.id}`);
  };

  // Swipe handlers for mobile navigation
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      // Swipe left = go to next step (if allowed)
      if (step < totalSteps && canProceed()) {
        nextStep();
      }
    },
    onSwipedRight: () => {
      // Swipe right = go back
      if (step > 1) {
        prevStep();
      }
    },
    trackMouse: false, // Only track touch, not mouse
    trackTouch: true,
    delta: 50, // Minimum swipe distance
    swipeDuration: 500,
    preventScrollOnSwipe: false // Don't prevent vertical scrolling
  });

  return (
    <div className="max-w-4xl mx-auto py-6 md:py-12 px-4" {...swipeHandlers}>
      {/* Header */}
      <div className="mb-8 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-heading font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent"
        >
          {title}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-slate-400 mt-2"
        >
          {description}
        </motion.p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8 relative h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${(step / totalSteps) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-center gap-2 mb-8">
        {Array.from({ length: totalSteps }).map((_, idx) => (
          <div
            key={idx}
            className={`w-2 h-2 rounded-full transition-all ${
              idx + 1 === step
                ? 'w-6 bg-blue-500'
                : idx + 1 < step
                ? 'bg-emerald-500'
                : 'bg-slate-700'
            }`}
          />
        ))}
      </div>

      {/* Swipe Hint (shown on mobile only) */}
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
        {children}
      </motion.div>

      {/* Navigation */}
      <div className="flex justify-between mt-12 pt-8 border-t border-white/10">
        <Button 
          variant="ghost" 
          onClick={step === 1 ? () => navigate('/') : prevStep}
          className="text-slate-400 hover:text-white"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {step === 1 ? 'Cancel' : 'Back'}
        </Button>

        {step < totalSteps ? (
          <Button 
            onClick={nextStep}
            disabled={!canProceed()}
            className="bg-blue-600 hover:bg-blue-500"
          >
            Next Step
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={handleCreateTournament}
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            Launch Tournament
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { useWizardStore } from '../../store/wizardStore';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTournamentStore } from '../../store/tournamentStore';
import { useSportStore } from '@/store/sportStore';
import { TournamentEngine } from '../../logic/engine';
import { v4 as uuidv4 } from 'uuid';
import type { Tournament } from '@/types/tournament';

interface WizardLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export function WizardLayout({ children, title, description }: WizardLayoutProps) {
  const { step, totalSteps, prevStep, nextStep, players, selectedPlayers, format, tournamentName } = useWizardStore();
  const { createTournament } = useTournamentStore();
  const activeSport = useSportStore((state) => state.activeSport);
  const navigate = useNavigate();

  const canProceed = () => {
    if (step === 1) return true; // Mode selection
    
    // Step 2: Tournament Setup - requires name and date
    if (step === 2) return !!tournamentName;
    
    // Step 3: Format & Rules - requires format
    if (step === 3) return !!format;
    
    // Step 4: Campaign Setup (planned) or Player Selection (instant)
    if (step === 4) return true; // Campaign setup doesn't block
    
    // Step 5: Schedule Preview or Player Selection (instant) - no validation needed
    // Player selection is done in step 4 for planned mode
    
    // Other steps
    return true;
  };

  const handleCreateTournament = () => {
    if (!format || !tournamentName) return;

    // CRITICAL: Use selectedPlayers (those validated in CampaignSetup), not all registered players
    const finalPlayers = selectedPlayers.length > 0 ? selectedPlayers : players;
    const rounds = TournamentEngine.generateBracket(finalPlayers, format);

    const newTournament: Tournament = {
      id: uuidv4(),
      name: tournamentName,
      format: format,
      sport: activeSport, // CRITICAL: Add sport so tournament appears in filtered list
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

    createTournament(newTournament);
    navigate(`/tournaments/${newTournament.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 md:py-12 px-4">
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
      <div className="mb-12 relative h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${(step / totalSteps) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
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

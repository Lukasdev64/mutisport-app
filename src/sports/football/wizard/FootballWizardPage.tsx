import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import { useCreateTournament } from '@/hooks/useTournaments';
import { useToast } from '@/components/ui/toast';
import type { Tournament } from '@/types/tournament';
import { generateTournamentStructure } from '../logic/structure-generation';
import type { FootballTournamentConfig } from '../models/tournament-formats';

import { useFootballWizardStore } from './store';
import { FootballModeSelection } from './steps/FootballModeSelection';
import { FootballTournamentSetup } from './steps/FootballTournamentSetup';
import { FootballFormatAndRules } from './steps/FootballFormatAndRules';
import { FootballPlayerSelection } from './steps/FootballPlayerSelection';
import { FootballSummary } from './steps/FootballSummary';

export function FootballWizardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const isQuickStart = searchParams.get('mode') === 'quickstart';

  // Store state
  const {
    step, mode, tournamentName, venue, startDate, config, format, teams, footballFormatConfig
  } = useFootballWizardStore(useShallow((s) => ({
    step: s.step,
    mode: s.mode,
    tournamentName: s.tournamentName,
    venue: s.venue,
    startDate: s.startDate,
    config: s.config,
    format: s.format,
    teams: s.teams,
    footballFormatConfig: s.footballFormatConfig
  })));

  // Actions
  const nextStep = useFootballWizardStore((s) => s.nextStep);
  const prevStep = useFootballWizardStore((s) => s.prevStep);
  const setMode = useFootballWizardStore((s) => s.setMode);
  const reset = useFootballWizardStore((s) => s.reset);

  // Tournament creation
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
    // Dynamic minimum players based on format
    // For Futsal/5-a-side, we might allow smaller tournaments in the future
    // For now, we require at least 2 participants (Teams) for any tournament
    const minParticipants = (config.format === 'futsal' || config.format === 'five_a_side') ? 2 : 2;

    if (mode === 'instant') {
      if (step === 1) return true; // Mode selection
      if (step === 2) return !!config && !!format; // Format & Rules
      if (step === 3) return teams.length >= minParticipants; // Teams
      if (step === 4) return true; // Summary
    }

    if (mode === 'planned') {
      if (step === 1) return true; // Mode selection
      if (step === 2) return !!tournamentName; // Tournament setup
      if (step === 3) return !!config && !!format; // Format & Rules
      if (step === 4) return teams.length >= minParticipants; // Team selection
      if (step === 5) return true; // Summary
    }

    return true;
  };

  const handleCreate = async () => {
    try {
      const finalName = tournamentName || 'Tournoi de Football';
      const finalFormat = format || 'single_elimination';
      
      // Use the advanced football config if available, otherwise fallback to default
      const finalFootballConfig: FootballTournamentConfig = footballFormatConfig || {
        type: 'ELIMINATION_DIRECTE',
        matchDuration: config.halfDurationMinutes * config.halvesCount,
        extraTime: config.extraTimeEnabled,
        penaltyShootout: config.penaltiesEnabled,
        points: { win: 3, draw: 1, loss: 0 },
        tieBreakers: ['points', 'difference_buts'],
        hasReturnLeg: false,
        awayGoalsRule: false,
        hasThirdPlaceMatch: false
      };

      // Map teams to participants (Player type)
      // In a team-based tournament, the "players" array in the Tournament object represents the Teams.
      const participants = teams.map(team => ({
        id: team.id,
        name: team.name,
        metadata: {
          players: team.players,
          formation: team.formation
        }
      }));

      // Generate bracket using the new engine
      const rounds = generateTournamentStructure(participants, finalFootballConfig);

      const tournamentData: Tournament = {
        id: uuidv4(),
        name: finalName,
        location: venue,
        tournamentDate: new Date(startDate).toISOString(),
        sport: 'football',
        format: finalFormat,
        status: 'active',
        sportConfig: {
          ...config,
          footballFormat: finalFootballConfig // Store the advanced config
        } as any,
        players: participants,
        rounds: rounds,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: {
          pointsForWin: finalFootballConfig.points.win,
          pointsForDraw: finalFootballConfig.points.draw,
          pointsForLoss: finalFootballConfig.points.loss,
        },
      };

      // Create locally first for immediate feedback
      // Note: In a real app, we might want to wait for server response
      // but for now we follow the pattern used in other parts
      
      // Use the mutation to create on server
      const result = await createTournamentMutation.mutateAsync(tournamentData);
      
      toast("Tournament Created: Your football tournament is ready to kick off!", "success");

      navigate(`/tournaments/${result.id}`);
    } catch (error) {
      console.error('Failed to create tournament:', error);
      toast("Failed to create tournament. Please try again.", "error");
    }
  };

  const renderStep = () => {
    if (mode === 'instant') {
      switch (step) {
        case 1: return <FootballModeSelection />;
        case 2: return <FootballFormatAndRules />;
        case 3: return <FootballPlayerSelection />;
        case 4: return <FootballSummary />;
        default: return <FootballModeSelection />;
      }
    }

    // Planned mode
    switch (step) {
      case 1: return <FootballModeSelection />;
      case 2: return <FootballTournamentSetup />;
      case 3: return <FootballFormatAndRules />;
      case 4: return <FootballPlayerSelection />;
      case 5: return <FootballSummary />;
      default: return <FootballModeSelection />;
    }
  };

  const isLastStep = mode === 'instant' ? step === 4 : step === 5;

  return (
    <div className="min-h-screen bg-background text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => step === 1 ? navigate('/tournaments/new') : prevStep()}
            className="text-white/60 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            {step === 1 ? 'Back to Sports' : 'Back'}
          </Button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: mode === 'instant' ? 4 : 5 }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i + 1 === step ? 'w-8 bg-emerald-500' : 
                  i + 1 < step ? 'w-4 bg-emerald-500/40' : 'w-2 bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="min-h-[400px]"
        >
          {renderStep()}
        </motion.div>

        {/* Footer Actions */}
        <div className="flex justify-end mt-8 pt-8 border-t border-white/10">
          {step > 1 && (
            <Button
              variant="ghost"
              onClick={prevStep}
              className="mr-auto text-white/60 hover:text-white"
            >
              Back
            </Button>
          )}
          
          {isLastStep ? (
            <Button
              onClick={handleCreate}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-8"
            >
              Create Tournament
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="bg-white text-black hover:bg-white/90"
            >
              Next Step
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

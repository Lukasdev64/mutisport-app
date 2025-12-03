import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { X, Trophy, Timer, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Match } from '@/types/tournament';
import type { FootballMatchScore } from '@/types/football';
import { FootballScoringEngine } from '../scoring';
import { useUpdateMatch } from '@/hooks/useTournaments';
import { useToast } from '@/components/ui/toast';

interface FootballMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  tournamentId: string;
  onUpdateResult?: (matchId: string, result: any) => void;
}

export function FootballMatchModal({
  isOpen,
  onClose,
  match,
  tournamentId,
  onUpdateResult
}: FootballMatchModalProps) {
  const updateMatchMutation = useUpdateMatch();
  const { toast } = useToast();
  
  // Initialize score state
  const [score, setScore] = useState<FootballMatchScore>(() => {
    if (match.result && (match.result as any).footballScore) {
      return (match.result as any).footballScore;
    }
    return FootballScoringEngine.getInitialScore();
  });

  // Sync with match prop if it changes
  useEffect(() => {
    if (match.result && (match.result as any).footballScore) {
      setScore((match.result as any).footballScore);
    }
  }, [match]);

  const handleAddGoal = (team: 'home' | 'away') => {
    const newScore = FootballScoringEngine.addGoal(score, team, score.timeElapsed);
    setScore(newScore);
  };

  const handleRemoveGoal = (team: 'home' | 'away') => {
    // Find last goal for this team
    const lastGoal = [...score.events]
      .reverse()
      .find(e => e.type === 'goal' && e.team === team);
      
    if (lastGoal) {
      const newScore = FootballScoringEngine.removeGoal(score, lastGoal.id);
      setScore(newScore);
    }
  };

  const handleNextPeriod = () => {
    const newScore = FootballScoringEngine.nextPeriod(score);
    setScore(newScore);
  };

  const handleSave = async () => {
    try {
      const result = {
        player1Score: score.homeScore,
        player2Score: score.awayScore,
        winnerId: score.homeScore > score.awayScore 
          ? match.player1Id 
          : score.awayScore > score.homeScore 
            ? match.player2Id 
            : undefined,
        footballScore: score
      };

      if (onUpdateResult) {
        onUpdateResult(match.id, result);
      } else {
        await updateMatchMutation.mutateAsync({
          tournamentId,
          matchId: match.id,
          data: { result, status: 'completed' }
        });
      }
      
      toast("Score enregistré: Le résultat du match a été mis à jour.", "success");
      onClose();
    } catch (error) {
      toast("Erreur: Impossible d'enregistrer le score.", "error");
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-white/10 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/50">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-emerald-400" />
              Résultat du Match
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Score Display */}
            <div className="flex items-center justify-between gap-4">
              {/* Home Team */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="text-4xl font-bold text-white">{score.homeScore}</div>
                <div className="text-sm text-slate-400 font-medium">Domicile</div>
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-full border-slate-700 hover:bg-slate-800"
                    onClick={() => handleRemoveGoal('home')}
                    disabled={score.homeScore === 0}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    className="h-8 w-8 rounded-full bg-emerald-600 hover:bg-emerald-500"
                    onClick={() => handleAddGoal('home')}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* VS / Timer */}
              <div className="flex flex-col items-center justify-center">
                <div className="text-slate-600 font-bold text-xl mb-2">VS</div>
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-800 text-xs font-medium text-slate-300">
                  <Timer className="w-3 h-3" />
                  {score.period.replace('_', ' ').toUpperCase()}
                </div>
              </div>

              {/* Away Team */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="text-4xl font-bold text-white">{score.awayScore}</div>
                <div className="text-sm text-slate-400 font-medium">Extérieur</div>
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 rounded-full border-slate-700 hover:bg-slate-800"
                    onClick={() => handleRemoveGoal('away')}
                    disabled={score.awayScore === 0}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    className="h-8 w-8 rounded-full bg-emerald-600 hover:bg-emerald-500"
                    onClick={() => handleAddGoal('away')}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Period Control */}
            <div className="flex justify-center">
              {score.period !== 'finished' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleNextPeriod}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Période suivante
                </Button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-slate-900/50 flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">
              Annuler
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
              disabled={updateMatchMutation.isPending}
            >
              {updateMatchMutation.isPending ? 'Enregistrement...' : 'Terminer le match'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}

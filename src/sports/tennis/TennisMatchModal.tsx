import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import type { Tournament } from '@/types/tournament';
import type { TennisMatchScore } from '@/types/tennis';
import { DEFAULT_TENNIS_CONFIG } from '@/sports/tennis/config';
import { useTournamentStore } from '@/features/tournament/store/tournamentStore';
import { useToast } from '@/components/ui/toast';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { TennisLiveScoring } from './components/TennisLiveScoring';

interface TennisMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchId: string;
  player1Id: string;
  player2Id: string;
  tournament: Tournament;
}

export function TennisMatchModal({
  isOpen,
  onClose,
  matchId,
  player1Id,
  player2Id,
  tournament
}: TennisMatchModalProps) {
  const { updateMatch } = useTournamentStore();
  const { toast } = useToast();
  
  const player1 = tournament.players.find(p => p.id === player1Id);
  const player2 = tournament.players.find(p => p.id === player2Id);

  /** Récupère le format du tournoi depuis tennisConfig, avec fallback sur DEFAULT_TENNIS_CONFIG */
  const tennisFormat = tournament.tennisConfig?.format ?? DEFAULT_TENNIS_CONFIG.format;
  const bestOf = tennisFormat === 'best_of_5' ? 5 : 3;

  const [mode, setMode] = useState<'quick' | 'live'>('quick');

  // Quick result state
  const [winner, setWinner] = useState<'' | '1' | '2'>('');
  const [setScores, setSetScores] = useState<Array<{p1: string, p2: string}>>([
    {p1: '', p2: ''},
    {p1: '', p2: ''},
    {p1: '', p2: ''},
    {p1: '', p2: ''},
    {p1: '', p2: ''},
  ]);

  /**
   * Valide un score de set selon les règles du tennis
   * @param p1 - Score du joueur 1
   * @param p2 - Score du joueur 2
   * @returns true si le score est valide, false sinon
   *
   * Règles de validation :
   * - 6-x avec x <= 4 (victoire nette)
   * - 7-5 (victoire avec un break d'avance)
   * - 7-6 (tie-break)
   * - Scores symétriques (x-6, 5-7, 6-7) également valides
   */
  const isValidSetScore = (p1: number, p2: number): boolean => {
    // Victoire à 6-x (x <= 4) ou x-6
    if ((p1 === 6 && p2 <= 4) || (p2 === 6 && p1 <= 4)) {
      return true;
    }
    // Victoire à 7-5 ou 5-7
    if ((p1 === 7 && p2 === 5) || (p2 === 7 && p1 === 5)) {
      return true;
    }
    // Tie-break : 7-6 ou 6-7
    if ((p1 === 7 && p2 === 6) || (p2 === 7 && p1 === 6)) {
      return true;
    }
    return false;
  };

  /**
   * Valide tous les scores de sets entrés
   * @returns Un objet avec isValid et un message d'erreur optionnel
   */
  const validateSetScores = (): { isValid: boolean; errorMessage?: string } => {
    for (let i = 0; i < bestOf; i++) {
      const p1 = parseInt(setScores[i].p1);
      const p2 = parseInt(setScores[i].p2);

      // Ignorer les sets vides (non renseignés)
      if (isNaN(p1) && isNaN(p2)) continue;
      if (setScores[i].p1 === '' && setScores[i].p2 === '') continue;

      // Si un seul score est renseigné
      if ((isNaN(p1) && !isNaN(p2)) || (!isNaN(p1) && isNaN(p2))) {
        return {
          isValid: false,
          errorMessage: `Set ${i + 1}: Les deux scores doivent être renseignés`
        };
      }

      // Valider le score du set
      if (!isValidSetScore(p1, p2)) {
        return {
          isValid: false,
          errorMessage: `Set ${i + 1}: Score invalide (${p1}-${p2}). Un set se gagne 6-x (x≤4), 7-5 ou 7-6 (tie-break)`
        };
      }
    }
    return { isValid: true };
  };

  const handleQuickSave = () => {
    if (!winner) {
      toast('Please select a winner', 'error');
      return;
    }

    // Valider les scores de sets si renseignés
    const validation = validateSetScores();
    if (!validation.isValid) {
      toast(validation.errorMessage!, 'error');
      return;
    }

    let p1SetsWon = 0;
    let p2SetsWon = 0;

    // Calculate sets won if scores are provided
    for (let i = 0; i < bestOf; i++) {
      const p1 = parseInt(setScores[i].p1) || 0;
      const p2 = parseInt(setScores[i].p2) || 0;

      if (p1 > 0 || p2 > 0) {
        if (p1 > p2) p1SetsWon++;
        else if (p2 > p1) p2SetsWon++;
      }
    }

    // If no sets entered, default to minimal victory (2-0 for best of 3, 3-0 for best of 5)
    if (p1SetsWon === 0 && p2SetsWon === 0) {
      const minSetsToWin = Math.ceil(bestOf / 2);
      if (winner === '1') {
        p1SetsWon = minSetsToWin;
      } else {
        p2SetsWon = minSetsToWin;
      }
    }

    updateMatch(tournament.id, matchId, {
      status: 'completed',
      result: {
        player1Score: p1SetsWon,
        player2Score: p2SetsWon,
        winnerId: winner === '1' ? player1Id : player2Id
      }
    });

    toast('Match result saved!', 'success');
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎾</span>
              <div>
                <h2 className="text-lg font-bold text-white">Tennis Match</h2>
                <p className="text-xs text-slate-400">
                  {player1?.name} vs {player2?.name}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-slate-700 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setMode('quick')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                mode === 'quick'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              📝 Quick Result
            </button>
            <button
              onClick={() => setMode('live')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all ${
                mode === 'live'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚡ Live Scoring
            </button>
          </div>
        </div>

        {mode === 'quick' ? (
          // QUICK RESULT MODE
          <div className="p-6 space-y-5">
            <div className="text-center text-sm text-slate-400">
              Select the winner (set scores are optional)
            </div>

            {/* Winner Selection */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3">Winner</div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setWinner('1')}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    winner === '1'
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {player1?.name || 'Player 1'}
                </button>
                <button
                  onClick={() => setWinner('2')}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    winner === '2'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {player2?.name || 'Player 2'}
                </button>
              </div>
            </div>

            {/* Set Scores */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 space-y-3">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-3">
                Set Scores (Optional - Best of {bestOf})
              </div>
              {setScores.slice(0, bestOf).map((set, idx) => (
                <div key={idx} className="grid grid-cols-[70px_1fr_30px_1fr] items-center gap-3">
                  <div className="text-sm text-slate-400">Set {idx + 1}</div>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-7]*"
                    min="0"
                    max="7"
                    placeholder="0"
                    value={set.p1}
                    onChange={(e) => {
                      const newScores = [...setScores];
                      newScores[idx].p1 = e.target.value;
                      setSetScores(newScores);
                    }}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-center text-white focus:border-emerald-500 focus:outline-none touch-target no-zoom"
                  />
                  <div className="text-slate-500 text-center">-</div>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-7]*"
                    min="0"
                    max="7"
                    placeholder="0"
                    value={set.p2}
                    onChange={(e) => {
                      const newScores = [...setScores];
                      newScores[idx].p2 = e.target.value;
                      setSetScores(newScores);
                    }}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-center text-white focus:border-blue-500 focus:outline-none touch-target no-zoom"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="ghost" onClick={onClose} className="flex-1 hover:bg-slate-700">
                Cancel
              </Button>
              <Button onClick={handleQuickSave} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white">
                ✓ Save Result
              </Button>
            </div>
          </div>
        ) : (
          // LIVE SCORING MODE
          <div className="relative" style={{ minHeight: '500px' }}>
            <TennisLiveScoring
              config={tournament.tennisConfig ?? DEFAULT_TENNIS_CONFIG}
              player1Id={player1Id}
              player2Id={player2Id}
              player1Name={player1?.name || 'Player 1'}
              player2Name={player2?.name || 'Player 2'}
              onMatchComplete={(finalScore: TennisMatchScore) => {
                // Convert score to match result
                updateMatch(tournament.id, matchId, {
                  status: 'completed',
                  result: {
                    player1Score: finalScore.player1Sets,
                    player2Score: finalScore.player2Sets,
                    winnerId: finalScore.winnerId
                  }
                });
                toast('Match terminé!', 'success');
                onClose();
              }}
              onCancel={onClose}
            />
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
}

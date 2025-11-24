import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import type { Tournament } from '@/types/tournament';
import { DEFAULT_TENNIS_CONFIG } from '@/sports/tennis/config';
import { useTournamentStore } from '@/features/tournament/store/tournamentStore';
import { useToast } from '@/components/ui/toast';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

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
  const bestOf = DEFAULT_TENNIS_CONFIG.format === 'best_of_5' ? 5 : 3;

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

  const handleQuickSave = () => {
    if (!winner) {
      toast('Please select a winner', 'error');
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
                    min="0"
                    max="7"
                    placeholder="0"
                    value={set.p1}
                    onChange={(e) => {
                      const newScores = [...setScores];
                      newScores[idx].p1 = e.target.value;
                      setSetScores(newScores);
                    }}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-center text-white focus:border-emerald-500 focus:outline-none"
                  />
                  <div className="text-slate-500 text-center">-</div>
                  <input
                    type="number"
                    min="0"
                    max="7"
                    placeholder="0"
                    value={set.p2}
                    onChange={(e) => {
                      const newScores = [...setScores];
                      newScores[idx].p2 = e.target.value;
                      setSetScores(newScores);
                    }}
                    className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-center text-white focus:border-blue-500 focus:outline-none"
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
          <div className="p-6 flex items-center justify-center" style={{ minHeight: '400px' }}>
            <div className="text-center text-slate-400">
              <div className="text-4xl mb-4">⚡</div>
              <div className="text-lg font-semibold mb-2">Live Scoring</div>
              <div className="text-sm">Coming soon...</div>
              <div className="text-xs mt-2">Point-by-point tracking will be available here</div>
            </div>
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
}

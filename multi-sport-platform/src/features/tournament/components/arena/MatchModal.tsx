import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Match, Tournament } from '@/types/tournament';
import { useTournamentStore } from '../../store/tournamentStore';
import { Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/toast';
import { TennisMatchModal } from '@/sports/tennis/TennisMatchModal';
import { BasketballMatchModal } from '@/sports/basketball/BasketballMatchModal';

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  tournament: Tournament;
}

export function MatchModal({ isOpen, onClose, match, tournament }: MatchModalProps) {
  // Delegate to sport-specific modals
  if (tournament.sport === 'tennis') {
    return (
      <TennisMatchModal
        isOpen={isOpen}
        onClose={onClose}
        matchId={match.id}
        player1Id={match.player1Id!}
        player2Id={match.player2Id!}
        tournament={tournament}
      />
    );
  }

  if (tournament.sport === 'basketball') {
    const { updateMatch } = useTournamentStore();
    return (
      <BasketballMatchModal
        isOpen={isOpen}
        onClose={onClose}
        match={match}
        onUpdateResult={(matchId, result) => {
          updateMatch(tournament.id, matchId, {
            status: 'completed',
            result
          });
        }}
      />
    );
  }

  // Generic modal for other sports
  const { updateMatch } = useTournamentStore();
  const { toast } = useToast();
  const [score1, setScore1] = useState(match.result?.player1Score ?? 0);
  const [score2, setScore2] = useState(match.result?.player2Score ?? 0);

  const player1 = tournament.players.find(p => p.id === match.player1Id);
  const player2 = tournament.players.find(p => p.id === match.player2Id);

  const handleSave = () => {
    const winnerId = score1 > score2 ? player1?.id : score2 > score1 ? player2?.id : undefined;
    
    updateMatch(tournament.id, match.id, {
      status: 'completed',
      result: {
        player1Score: score1,
        player2Score: score2,
        winnerId
      }
    });
    
    const winnerName = winnerId === player1?.id ? player1?.name : winnerId === player2?.id ? player2?.name : 'Draw';
    toast(`Match saved! Winner: ${winnerName}`, 'success');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-white/10 rounded-xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-xl font-heading font-bold text-white">Match Result</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="p-8 space-y-8">
          <div className="flex items-center justify-between gap-4">
            {/* Player 1 */}
            <div className="flex-1 flex flex-col items-center gap-3">
              <div className={`relative w-20 h-20 rounded-full p-1 ${score1 > score2 ? 'bg-gradient-to-br from-blue-500 to-emerald-500' : 'bg-slate-800'}`}>
                <img src={player1?.avatar} className="w-full h-full rounded-full bg-slate-900" />
                {score1 > score2 && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-black p-1.5 rounded-full shadow-lg">
                    <Trophy size={14} fill="currentColor" />
                  </div>
                )}
              </div>
              <span className="font-bold text-lg text-center text-white">{player1?.name || 'TBD'}</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setScore1(Math.max(0, score1 - 1))}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400"
                >
                  -
                </button>
                <span className="text-2xl font-bold font-mono w-8 text-center">{score1}</span>
                <button 
                  onClick={() => setScore1(score1 + 1)}
                  className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-slate-500 font-bold text-xl">VS</div>

            {/* Player 2 */}
            <div className="flex-1 flex flex-col items-center gap-3">
              <div className={`relative w-20 h-20 rounded-full p-1 ${score2 > score1 ? 'bg-gradient-to-br from-blue-500 to-emerald-500' : 'bg-slate-800'}`}>
                <img src={player2?.avatar} className="w-full h-full rounded-full bg-slate-900" />
                {score2 > score1 && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-black p-1.5 rounded-full shadow-lg">
                    <Trophy size={14} fill="currentColor" />
                  </div>
                )}
              </div>
              <span className="font-bold text-lg text-center text-white">{player2?.name || 'TBD'}</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setScore2(Math.max(0, score2 - 1))}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400"
                >
                  -
                </button>
                <span className="text-2xl font-bold font-mono w-8 text-center">{score2}</span>
                <button 
                  onClick={() => setScore2(score2 + 1)}
                  className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-950/50 border-t border-white/10 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-500">
            Save Result
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { Trophy, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Tournament } from '@/types/tournament';
import { useWindowSize } from 'react-use';

interface TournamentWinnerModalProps {
  tournament: Tournament;
  onClose: () => void;
}

export function TournamentWinnerModal({ tournament, onClose }: TournamentWinnerModalProps) {
  const { width, height } = useWindowSize();
  const [isOpen, setIsOpen] = useState(false);

  // Check if tournament is completed and find the winner
  const isCompleted = tournament.status === 'completed';
  
  // Find the final match winner
  // In single elimination, it's the winner of the last match in the last round
  const lastRound = tournament.rounds[tournament.rounds.length - 1];
  const finalMatch = lastRound?.matches[0]; // Assuming single final match
  const winnerId = finalMatch?.result?.winnerId;
  const winner = tournament.players.find(p => p.id === winnerId);

  useEffect(() => {
    if (isCompleted && winner) {
      setIsOpen(true);
    }
  }, [isCompleted, winner]);

  if (!isOpen || !winner) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 100 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="relative bg-gradient-to-b from-slate-800 to-slate-900 border border-yellow-500/30 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center overflow-hidden"
        >
          {/* Glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-yellow-500/20 blur-3xl rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 rounded-full bg-yellow-500/20 flex items-center justify-center border-4 border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.5)]"
            >
              <Trophy className="w-12 h-12 text-yellow-400" />
            </motion.div>

            <div className="space-y-2">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold text-white"
              >
                Félicitations !
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-slate-400"
              >
                Le vainqueur du tournoi est
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 w-full"
            >
              <img 
                src={winner.avatar} 
                alt={winner.name} 
                className="w-20 h-20 rounded-full border-4 border-slate-800 shadow-lg"
              />
              <span className="text-2xl font-bold text-white">{winner.name}</span>
            </motion.div>

            <div className="flex gap-3 w-full pt-4">
              <Button 
                variant="outline" 
                className="flex-1 border-slate-700 hover:bg-slate-800"
                onClick={onClose}
              >
                Fermer
              </Button>
              <Button 
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                onClick={() => {
                  // Share logic could go here
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Partager
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

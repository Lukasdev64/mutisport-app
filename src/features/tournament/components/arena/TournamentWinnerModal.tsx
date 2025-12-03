import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { Trophy, Share2, X, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Tournament } from '@/types/tournament';
import { useWindowSize } from 'react-use';
import { toBlob } from 'html-to-image';

interface TournamentWinnerModalProps {
  tournament: Tournament;
  onClose: () => void;
}

export function TournamentWinnerModal({ tournament, onClose }: TournamentWinnerModalProps) {
  const { width, height } = useWindowSize();
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

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

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  const handleShare = async () => {
    if (!modalRef.current) return;

    try {
      const blob = await toBlob(modalRef.current, {
        cacheBust: true,
        skipOnError: true, // Skip images that fail to load (avoids crash on CORS issues)
        backgroundColor: '#1e293b', // Set a background color to avoid transparency issues
        filter: (node) => {
          // Ignore the close button and buttons at the bottom for the screenshot
          if (node.tagName === 'BUTTON') return false;
          return true;
        }
      });

      if (!blob) return;

      const file = new File([blob], `winner-${tournament.name}.png`, { type: 'image/png' });
      const shareData = {
        title: 'Vainqueur du tournoi !',
        text: `Félicitations à ${winner.name} pour sa victoire au tournoi ${tournament.name} ! 🏆`,
        files: [file]
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
        } catch (err) {
            // User cancelled or share failed
            console.log('Share cancelled or failed', err);
        }
      } else {
        // Fallback to download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `winner-${tournament.name}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  if (!isOpen || !winner) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <Confetti 
          width={width} 
          height={height} 
          recycle={false} 
          numberOfPieces={500} 
          style={{ pointerEvents: 'none' }}
        />
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Modal */}
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.5, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 100 }}
          transition={{ type: "spring", duration: 0.8 }}
          className="relative rounded-2xl p-8 max-w-md w-full text-center overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom, #1e293b, #0f172a)',
            borderColor: 'rgba(234,179,8,0.3)',
            borderWidth: '1px',
            borderStyle: 'solid',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          {/* Close Button (Top Right) */}
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 transition-colors z-20"
            style={{ color: '#94a3b8' }}
          >
            <X className="w-6 h-6" />
          </button>

          {/* Glow effect */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 blur-3xl rounded-full pointer-events-none" 
            style={{ backgroundColor: 'rgba(234,179,8,0.2)' }}
          />

          <div className="relative z-10 flex flex-col items-center gap-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-[0_0_30px_rgba(234,179,8,0.5)]"
              style={{
                backgroundColor: 'rgba(234,179,8,0.2)',
                borderColor: '#eab308'
              }}
            >
              <Trophy className="w-12 h-12" style={{ color: '#facc15' }} />
            </motion.div>

            <div className="space-y-2">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold"
                style={{ color: '#ffffff' }}
              >
                Félicitations !
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className=""
                style={{ color: '#94a3b8' }}
              >
                Le vainqueur du tournoi est
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col items-center gap-3 p-4 rounded-xl w-full"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
            >
              <img 
                src={winner.avatar} 
                alt={winner.name} 
                className="w-20 h-20 rounded-full border-4 object-cover"
                style={{ 
                  borderColor: '#1e293b',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                }}
                crossOrigin="anonymous"
              />
              <span className="text-2xl font-bold" style={{ color: '#ffffff' }}>{winner.name}</span>
            </motion.div>

            <div className="flex gap-3 w-full pt-4">
              <Button 
                variant="outline" 
                className="flex-1 border-slate-700 hover:bg-slate-800 text-slate-200"
                onClick={handleClose}
              >
                Fermer
              </Button>
              <Button 
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                onClick={handleShare}
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

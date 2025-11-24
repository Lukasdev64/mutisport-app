import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Match } from '@/types/tournament';
import { useState } from 'react';
import { calculateBasketballScore } from './scoring';

interface BasketballMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: Match;
  onUpdateResult: (matchId: string, result: any) => void;
}

export function BasketballMatchModal({
  isOpen,
  onClose,
  match,
  onUpdateResult
}: BasketballMatchModalProps) {
  const [scoreA, setScoreA] = useState(match.result?.player1Score?.toString() || '0');
  const [scoreB, setScoreB] = useState(match.result?.player2Score?.toString() || '0');

  const handleSave = () => {
    const p1Score = parseInt(scoreA);
    const p2Score = parseInt(scoreB);
    
    const tempMatch = {
      ...match,
      result: {
        player1Score: p1Score,
        player2Score: p2Score
      }
    };

    const { winnerId } = calculateBasketballScore(tempMatch);

    onUpdateResult(match.id, {
      player1Score: p1Score,
      player2Score: p2Score,
      winnerId
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Basketball Match Result</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 items-center py-4">
          <div className="text-center">
            <div className="font-bold mb-2 truncate">{match.player1Id}</div> {/* Should be name, but ID for now */}
            <Input 
              type="number" 
              value={scoreA} 
              onChange={(e) => setScoreA(e.target.value)}
              className="text-center text-2xl font-mono bg-slate-800 border-slate-700"
            />
          </div>
          
          <div className="text-center text-slate-500 font-bold">VS</div>
          
          <div className="text-center">
            <div className="font-bold mb-2 truncate">{match.player2Id}</div>
            <Input 
              type="number" 
              value={scoreB} 
              onChange={(e) => setScoreB(e.target.value)}
              className="text-center text-2xl font-mono bg-slate-800 border-slate-700"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-slate-700 text-slate-300 hover:bg-slate-800">
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700 text-white">
            Save Result
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

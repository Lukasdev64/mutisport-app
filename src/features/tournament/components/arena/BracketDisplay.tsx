import type { Tournament, Match } from '@/types/tournament';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { MatchModal } from './MatchModal';
import { SchedulePopover, ScheduleInfo } from './SchedulePopover';
import { Clock } from 'lucide-react';

interface BracketDisplayProps {
  tournament: Tournament;
}

export function BracketDisplay({ tournament }: BracketDisplayProps) {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // Round Robin Layout (Grid)
  if (tournament.format === 'round_robin') {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournament.rounds.map((round, roundIndex) => (
            <div key={round.id} className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider text-center border-b border-white/10 pb-2">
                {round.name}
              </h3>
              <div className="space-y-3">
                {round.matches.map((match) => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    tournament={tournament}
                    roundIndex={roundIndex}
                    onClick={() => setSelectedMatch(match)}
                    compact
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <MatchModalWrapper 
          selectedMatch={selectedMatch} 
          onClose={() => setSelectedMatch(null)} 
          tournament={tournament} 
        />
      </>
    );
  }

  // Single Elimination Layout (Tree)
  // We use a more compact layout to fit 8 players on screen
  return (
    <>
      <div className="flex items-center justify-center w-full h-full p-4">
        <div className="flex gap-8">
          {tournament.rounds.map((round, roundIndex) => (
            <div key={round.id} className="flex flex-col justify-around gap-4 relative">
              <div className="absolute -top-8 left-0 w-full text-center">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {round.name}
                </h3>
              </div>
              
              {round.matches.map((match) => (
                <MatchCard 
                  key={match.id} 
                  match={match} 
                  tournament={tournament}
                  roundIndex={roundIndex}
                  onClick={() => setSelectedMatch(match)}
                  compact={true} // Force compact mode for better fit
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <MatchModalWrapper 
        selectedMatch={selectedMatch} 
        onClose={() => setSelectedMatch(null)} 
        tournament={tournament} 
      />
    </>
  );
}

function MatchModalWrapper({ selectedMatch, onClose, tournament }: { selectedMatch: Match | null, onClose: () => void, tournament: Tournament }) {
  return (
    <AnimatePresence>
      {selectedMatch && (
        <MatchModal 
          isOpen={!!selectedMatch} 
          onClose={onClose} 
          match={selectedMatch} 
          tournament={tournament} 
        />
      )}
    </AnimatePresence>
  );
}

function MatchCard({ match, tournament, onClick, compact }: { match: Match; tournament: Tournament; roundIndex: number; onClick: () => void; compact?: boolean }) {
  const player1 = tournament.players.find(p => p.id === match.player1Id);
  const player2 = tournament.players.find(p => p.id === match.player2Id);
  const isFinal = !match.nextMatchId && !compact;
  const hasWinner = !!match.result?.winnerId;

  // Schedule popover state
  const [showSchedulePopover, setShowSchedulePopover] = useState(false);

  const handleScheduleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowSchedulePopover(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={onClick}
        className={cn(
          "bg-slate-900/80 border rounded-lg overflow-hidden transition-all cursor-pointer group relative z-10",
          compact ? "w-full" : "w-64",
          isFinal && hasWinner ? "border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]" : "border-white/10 hover:border-blue-500/50"
        )}
      >
        {isFinal && hasWinner && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-ping" />
        )}
        {/* Player 1 */}
        <div className={cn(
          "flex items-center justify-between border-b border-white/5 transition-colors",
          compact ? "p-2" : "p-3",
          match.result?.winnerId === player1?.id ? "bg-blue-500/10" : "hover:bg-white/5"
        )}>
          <div className="flex items-center gap-3">
            {player1 ? (
              <>
                <img src={player1.avatar} className={cn("rounded-full bg-slate-800", compact ? "w-5 h-5" : "w-6 h-6")} />
                <span className={cn("font-medium", compact ? "text-xs" : "text-sm", match.result?.winnerId === player1.id ? "text-blue-400" : "text-slate-300")}>
                  {player1.name}
                </span>
              </>
            ) : (
              <span className="text-slate-600 text-sm italic">TBD</span>
            )}
          </div>
          {match.result && (
            <span className={cn("font-bold", match.result.winnerId === player1?.id ? "text-blue-400" : "text-slate-500")}>
              {match.result.player1Score}
            </span>
          )}
        </div>

        {/* Player 2 */}
        <div className={cn(
          "flex items-center justify-between transition-colors",
          compact ? "p-2" : "p-3",
          match.result?.winnerId === player2?.id ? "bg-blue-500/10" : "hover:bg-white/5"
        )}>
          <div className="flex items-center gap-3">
            {player2 ? (
              <>
                <img src={player2.avatar} className={cn("rounded-full bg-slate-800", compact ? "w-5 h-5" : "w-6 h-6")} />
                <span className={cn("font-medium", compact ? "text-xs" : "text-sm", match.result?.winnerId === player2.id ? "text-blue-400" : "text-slate-300")}>
                  {player2.name}
                </span>
              </>
            ) : (
              <span className="text-slate-600 text-sm italic">TBD</span>
            )}
          </div>
          {match.result && (
            <span className={cn("font-bold", match.result.winnerId === player2?.id ? "text-blue-400" : "text-slate-500")}>
              {match.result.player2Score}
            </span>
          )}
        </div>

        {/* Schedule Info Line - Always visible */}
        {match.scheduledAt ? (
          <ScheduleInfo
            match={match}
            onClick={handleScheduleClick}
            compact={compact}
          />
        ) : (
          <button
            onClick={handleScheduleClick}
            className={cn(
              'flex items-center gap-2 w-full transition-colors group/schedule',
              compact ? 'px-2 py-1.5' : 'px-3 py-2',
              'border-t border-white/5 bg-slate-800/20 hover:bg-slate-800/50'
            )}
          >
            <Clock className="w-3 h-3 text-slate-500 group-hover/schedule:text-blue-400 transition-colors" />
            <span className="text-xs text-slate-500 group-hover/schedule:text-slate-300 transition-colors">
              Ajouter horaire
            </span>
          </button>
        )}
      </motion.div>

      {/* Schedule Popover */}
      <SchedulePopover
        match={match}
        tournament={tournament}
        isOpen={showSchedulePopover}
        onClose={() => setShowSchedulePopover(false)}
      />
    </>
  );
}

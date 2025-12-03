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

  // Check for Group Stage (Football specific for now, but could be generic)
  // Also check if matches have "Groupe" location as a fallback
  const hasGroupMatches = tournament.rounds.some(r => r.matches.some(m => m.location?.startsWith('Groupe')));
  const isGroupStage = (tournament.sportConfig as any)?.footballFormat?.type === 'PHASE_POULES' || hasGroupMatches;

  if (isGroupStage) {
    // Extract groups from matches
    const groups = new Set<string>();
    tournament.rounds.forEach(round => {
      round.matches.forEach(match => {
        if (match.location && match.location.startsWith('Groupe')) {
          groups.add(match.location);
        }
      });
    });
    
    if (groups.size > 0) {
      const sortedGroups = Array.from(groups).sort();

      return (
        <>
          <div className="space-y-12 pb-12">
            {sortedGroups.map(groupName => (
              <div key={groupName} className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-blue-500 rounded-full" />
                  <h3 className="text-xl font-bold text-white">
                    {groupName}
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-x-auto pb-4">
                  {tournament.rounds.map((round, roundIndex) => {
                    // Filter matches for this group and round
                    const groupMatches = round.matches.filter(m => m.location === groupName);
                    if (groupMatches.length === 0) return null;

                    return (
                      <div key={round.id} className="space-y-4 min-w-[250px]">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider text-center border-b border-white/10 pb-2">
                          {round.name}
                        </h4>
                        <div className="space-y-3">
                          {groupMatches.map((match) => (
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
                    );
                  })}
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
  }

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
  return (
    <>
      <div className="flex items-center justify-start overflow-x-auto w-full h-full px-8 pb-8 pt-20 custom-scrollbar">
        <div className="flex flex-row h-full min-h-[500px]">
          {tournament.rounds.map((round, roundIndex) => {
            const isLastRound = roundIndex === tournament.rounds.length - 1;
            const nextRound = tournament.rounds[roundIndex + 1];
            
            return (
              <div key={round.id} className="flex flex-row">
                {/* Matches Column */}
                <div className="flex flex-col justify-around gap-4 w-64 relative z-10">
                  <div className="absolute -top-10 left-0 w-full text-center">
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
                      compact={false}
                    />
                  ))}
                </div>

                {/* Connectors Column (if not last round) */}
                {!isLastRound && (
                  <div className="flex flex-col justify-around w-16">
                    {Array.from({ length: Math.floor(round.matches.length / 2) }).map((_, i) => (
                      <div 
                        key={i}
                        className="relative border-r border-t border-b border-white/20"
                        style={{ height: `${100 / round.matches.length}%`, width: '50%' }}
                      >
                        {/* Line to next match */}
                        <div className="absolute top-1/2 -right-8 w-8 border-b border-white/20" />
                      </div>
                    ))}
                    {/* Handle odd match if any (straight line) */}
                    {round.matches.length % 2 !== 0 && (
                      <div className="relative h-px border-b border-white/20 w-full" />
                    )}
                  </div>
                )}
              </div>
            );
          })}
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

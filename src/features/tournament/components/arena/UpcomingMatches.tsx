import { Clock, MapPin, Calendar } from 'lucide-react';
import type { Tournament, Match } from '@/types/tournament';
import { TournamentEngine } from '../../logic/engine';
import { cn } from '@/lib/utils';

interface UpcomingMatchesProps {
  tournament: Tournament;
  limit?: number;
  onMatchClick?: (match: Match) => void;
}

export function UpcomingMatches({ tournament, limit = 5, onMatchClick }: UpcomingMatchesProps) {
  const upcomingMatches = TournamentEngine.getUpcomingMatches(tournament, limit);

  if (upcomingMatches.length === 0) {
    return null;
  }

  // Group matches by date
  const groupedByDate = upcomingMatches.reduce((acc, match) => {
    if (!match.scheduledAt) return acc;
    const dateKey = new Date(match.scheduledAt).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  return (
    <div className="glass-panel rounded-xl border border-white/10 overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 bg-slate-900/50">
        <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          Prochains matchs
        </h3>
      </div>

      <div className="divide-y divide-white/5">
        {Object.entries(groupedByDate).map(([dateKey, matches]) => (
          <div key={dateKey}>
            {/* Date header */}
            <div className="px-4 py-2 bg-slate-800/30">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {formatDateHeader(dateKey)}
              </span>
            </div>

            {/* Matches for this date */}
            <div className="divide-y divide-white/5">
              {matches.map((match) => (
                <UpcomingMatchItem
                  key={match.id}
                  match={match}
                  tournament={tournament}
                  onClick={() => onMatchClick?.(match)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface UpcomingMatchItemProps {
  match: Match;
  tournament: Tournament;
  onClick?: () => void;
}

function UpcomingMatchItem({ match, tournament, onClick }: UpcomingMatchItemProps) {
  const player1 = tournament.players.find(p => p.id === match.player1Id);
  const player2 = tournament.players.find(p => p.id === match.player2Id);

  const isNow = match.scheduledAt && isMatchNow(match.scheduledAt);
  const isSoon = match.scheduledAt && isMatchSoon(match.scheduledAt);

  return (
    <div
      onClick={onClick}
      className={cn(
        'px-4 py-3 transition-colors cursor-pointer',
        isNow
          ? 'bg-emerald-500/10 hover:bg-emerald-500/20'
          : isSoon
            ? 'bg-amber-500/5 hover:bg-amber-500/10'
            : 'hover:bg-white/5'
      )}
    >
      {/* Time & Location */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-sm font-bold',
            isNow ? 'text-emerald-400' : isSoon ? 'text-amber-400' : 'text-blue-400'
          )}>
            {match.scheduledAt ? formatTime(match.scheduledAt) : '--:--'}
          </span>
          {isNow && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-emerald-500 text-black rounded">
              En cours
            </span>
          )}
          {isSoon && !isNow && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium uppercase bg-amber-500/20 text-amber-400 rounded">
              Bientôt
            </span>
          )}
        </div>
        {match.location && (
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {match.location}
          </span>
        )}
      </div>

      {/* Players */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          {player1 && (
            <>
              <img src={player1.avatar} className="w-5 h-5 rounded-full bg-slate-800 shrink-0" />
              <span className="text-xs font-medium text-slate-300 truncate">{player1.name}</span>
            </>
          )}
          {!player1 && <span className="text-xs text-slate-500 italic">TBD</span>}
        </div>

        <span className="text-xs text-slate-500 font-medium px-1">vs</span>

        <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
          {player2 && (
            <>
              <span className="text-xs font-medium text-slate-300 truncate">{player2.name}</span>
              <img src={player2.avatar} className="w-5 h-5 rounded-full bg-slate-800 shrink-0" />
            </>
          )}
          {!player2 && <span className="text-xs text-slate-500 italic">TBD</span>}
        </div>
      </div>
    </div>
  );
}

function formatDateHeader(dateKey: string): string {
  const date = new Date(dateKey);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return "Aujourd'hui";
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'Demain';
  }

  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isMatchNow(scheduledAt: string): boolean {
  const now = new Date();
  const matchTime = new Date(scheduledAt);
  const diffMinutes = (now.getTime() - matchTime.getTime()) / (1000 * 60);
  // Match is "now" if it started within the last 2 hours
  return diffMinutes >= 0 && diffMinutes <= 120;
}

function isMatchSoon(scheduledAt: string): boolean {
  const now = new Date();
  const matchTime = new Date(scheduledAt);
  const diffMinutes = (matchTime.getTime() - now.getTime()) / (1000 * 60);
  // Match is "soon" if it starts within the next 30 minutes
  return diffMinutes > 0 && diffMinutes <= 30;
}

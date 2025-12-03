import { useState } from 'react';
import { Clock, Trophy, BookOpen, Users } from 'lucide-react';
import type { Tournament } from '@/types/tournament';
import { StandingsTable } from './StandingsTable';
import { TeamList } from './TeamList';
import { cn } from '@/lib/utils';
import { useSportPlugin, useSportConfig } from '@/sports/core/hooks';

interface ArenaSidebarProps {
  tournament: Tournament;
}

type TabId = 'matches' | 'standings' | 'rules' | 'teams';

export function ArenaSidebar({ tournament }: ArenaSidebarProps) {
  // Default to matches if there are upcoming, otherwise standings
  const hasUpcomingMatches = tournament.rounds.some(r =>
    r.matches.some(m => m.scheduledAt && !m.result)
  );

  // Get sport plugin and config for rules display
  const plugin = useSportPlugin(tournament.sport);
  const sportConfig = useSportConfig(tournament);
  // Check if the sport plugin has a rules module
  const hasRulesModule = !!plugin?.components.RulesModule;

  // const now = new Date();

  const [activeTab, setActiveTab] = useState<TabId>(hasUpcomingMatches ? 'matches' : 'standings');

  const tabs: { id: TabId; label: string; icon: React.ReactNode; show: boolean }[] = [
    { id: 'matches', label: 'Matchs', icon: <Clock size={12} />, show: true },
    { id: 'standings', label: 'Classement', icon: <Trophy size={12} />, show: true },
    { id: 'teams', label: 'Équipes', icon: <Users size={12} />, show: true },
    { id: 'rules', label: 'Règles', icon: <BookOpen size={12} />, show: !!hasRulesModule },
  ];

  const visibleTabs = tabs.filter(t => t.show);

  return (
    <div className="space-y-3">
      {/* Compact Tab Buttons */}
      <div className="flex gap-1 p-1 bg-slate-800/50 rounded-lg border border-white/5">
        {visibleTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-medium transition-all",
              activeTab === tab.id
                ? "bg-blue-500/20 text-blue-400 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Card - Compact, max height limited */}
      <div className="bg-slate-900/60 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden max-h-[400px]">
        <div className="overflow-y-auto custom-scrollbar max-h-[400px]">
          {activeTab === 'matches' && (
            <UpcomingMatchesContent tournament={tournament} />
          )}

          {activeTab === 'standings' && (
            <div className="p-2">
              <StandingsTable tournament={tournament} compact />
            </div>
          )}

          {activeTab === 'teams' && (
            <TeamList tournament={tournament} />
          )}

          {activeTab === 'rules' && hasRulesModule && (
            <div className="p-2">
              {(() => {
                const RulesModule = plugin?.components.RulesModule;
                return RulesModule ? (
                  <RulesModule config={sportConfig} compact />
                ) : null;
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Simplified upcoming matches content (without the outer panel styling)
function UpcomingMatchesContent({ tournament }: { tournament: Tournament }) {
  const upcomingMatches = getUpcomingMatches(tournament, 10);

  if (upcomingMatches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Clock className="w-8 h-8 text-slate-600 mb-2" />
        <p className="text-sm text-slate-400">Aucun match planifié</p>
        <p className="text-xs text-slate-500 mt-1">
          Utilisez le planning pour ajouter des horaires
        </p>
      </div>
    );
  }

  // Group matches by date
  const groupedByDate = upcomingMatches.reduce((acc, match) => {
    if (!match.scheduledAt) return acc;
    const dateKey = new Date(match.scheduledAt).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(match);
    return acc;
  }, {} as Record<string, typeof upcomingMatches>);

  return (
    <div className="divide-y divide-white/5">
      {Object.entries(groupedByDate).map(([dateKey, matches]) => (
        <div key={dateKey}>
          {/* Date header */}
          <div className="px-3 py-1.5 bg-slate-800/50 sticky top-0">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              {formatDateHeader(dateKey)}
            </span>
          </div>

          {/* Matches for this date */}
          <div className="divide-y divide-white/5">
            {matches.map((match) => {
              const player1 = tournament.players.find(p => p.id === match.player1Id);
              const player2 = tournament.players.find(p => p.id === match.player2Id);
              const isNow = match.scheduledAt && isMatchNow(match.scheduledAt);
              const isSoon = match.scheduledAt && isMatchSoon(match.scheduledAt);

              return (
                <div
                  key={match.id}
                  className={cn(
                    "px-3 py-2 transition-colors",
                    isNow
                      ? "bg-emerald-500/10"
                      : isSoon
                        ? "bg-amber-500/5"
                        : "hover:bg-white/5"
                  )}
                >
                  {/* Time row */}
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        "text-xs font-bold",
                        isNow ? "text-emerald-400" : isSoon ? "text-amber-400" : "text-blue-400"
                      )}>
                        {match.scheduledAt ? formatTime(match.scheduledAt) : '--:--'}
                      </span>
                      {isNow && (
                        <span className="px-1 py-0.5 text-[8px] font-bold uppercase bg-emerald-500 text-black rounded">
                          Live
                        </span>
                      )}
                    </div>
                    {match.location && (
                      <span className="text-[10px] text-slate-500 truncate max-w-[80px]">
                        {match.location}
                      </span>
                    )}
                  </div>

                  {/* Players row - compact */}
                  <div className="flex items-center text-xs">
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      {player1?.avatar && (
                        <img src={player1.avatar} className="w-4 h-4 rounded-full bg-slate-800 shrink-0" />
                      )}
                      <span className="text-slate-300 truncate text-[11px]">
                        {player1?.name || 'TBD'}
                      </span>
                    </div>
                    <span className="text-slate-600 px-1 text-[10px]">v</span>
                    <div className="flex items-center gap-1 flex-1 min-w-0 justify-end">
                      <span className="text-slate-300 truncate text-[11px]">
                        {player2?.name || 'TBD'}
                      </span>
                      {player2?.avatar && (
                        <img src={player2.avatar} className="w-4 h-4 rounded-full bg-slate-800 shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// Helper functions
function getUpcomingMatches(tournament: Tournament, limit: number) {
  // const now = new Date();
  const allMatches = tournament.rounds.flatMap(r => r.matches);

  return allMatches
    .filter(m => m.scheduledAt && !m.result?.winnerId)
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
    .slice(0, limit);
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
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function isMatchNow(scheduledAt: string): boolean {
  const now = new Date();
  const matchTime = new Date(scheduledAt);
  const diffMinutes = (now.getTime() - matchTime.getTime()) / (1000 * 60);
  return diffMinutes >= 0 && diffMinutes <= 120;
}

function isMatchSoon(scheduledAt: string): boolean {
  const now = new Date();
  const matchTime = new Date(scheduledAt);
  const diffMinutes = (matchTime.getTime() - now.getTime()) / (1000 * 60);
  return diffMinutes > 0 && diffMinutes <= 30;
}

import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTournamentStore } from './store/tournamentStore';
import { BracketDisplay } from './components/arena/BracketDisplay';
import { StandingsTable } from './components/arena/StandingsTable';
import { Trophy, Users, Calendar, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { TennisRulesModule } from './components/arena/TennisRulesModule';
import { TournamentSettingsModal } from './components/arena/TournamentSettingsModal';

export function TournamentArenaPage() {
  const { id } = useParams<{ id: string }>();
  const tournament = useTournamentStore((state) =>
    state.tournaments.find((t) => t.id === id)
  );
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);

  if (!tournament) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
        <Trophy className="w-16 h-16 mb-4 opacity-20" />
        <h2 className="text-xl font-semibold">Tournament Not Found</h2>
        <p>The tournament you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col gap-4">
      {/* Header & Stats */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                {tournament.status}
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(tournament.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-white">{tournament.name}</h1>
          </div>

          {/* Stats - Inline */}
          <div className="h-10 w-px bg-white/10 mx-2" />
          
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Players</p>
              <p className="text-sm font-bold text-white leading-none">{tournament.players.length}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="border-white/10 hover:bg-white/5 h-9" onClick={() => toast('Share feature coming soon!', 'info')}>
            <Share2 className="w-3 h-3 mr-2" />
            Share
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 h-9" onClick={() => setShowSettings(true)}>
            Settings
          </Button>
        </div>
      </div>

      {/* Main Content Area - Fixed Height Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Bracket (Takes up 3/4 space) */}
        <div className="lg:col-span-3 glass-panel rounded-xl border-white/10 overflow-hidden relative flex flex-col">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="absolute inset-0 overflow-auto custom-scrollbar p-4">
            <BracketDisplay tournament={tournament} />
          </div>
        </div>

        {/* Right Column (Scrollable if needed) */}
        <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1">
          {/* Tennis Rules Module */}
          {tournament.sport === 'tennis' && tournament.tennisConfig && (
            <TennisRulesModule config={tournament.tennisConfig} />
          )}

          <div className="flex flex-col gap-2">
            <h3 className="font-heading font-bold text-sm text-white px-1 uppercase tracking-wider opacity-80">Standings</h3>
            <StandingsTable tournament={tournament} />
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <TournamentSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        tournament={tournament}
      />
    </div>
  );
}

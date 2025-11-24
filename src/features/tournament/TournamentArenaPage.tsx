import { useParams } from 'react-router-dom';
import { useTournamentStore } from './store/tournamentStore';
import { BracketDisplay } from './components/arena/BracketDisplay';
import { StandingsTable } from './components/arena/StandingsTable';
import { Trophy, Users, Calendar, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export function TournamentArenaPage() {
  const { id } = useParams<{ id: string }>();
  const tournament = useTournamentStore((state) => 
    state.tournaments.find((t) => t.id === id)
  );
  const { toast } = useToast();

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
    <div className="space-y-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
              {tournament.status}
            </span>
            <span className="text-slate-400 text-sm flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(tournament.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-4xl font-heading font-bold text-white">{tournament.name}</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => toast('Share feature coming soon!', 'info')}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-500" onClick={() => toast('Tournament settings coming soon!', 'info')}>
            Tournament Settings
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-lg flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Players</p>
            <p className="text-lg font-bold text-white">{tournament.players.length}</p>
          </div>
        </div>
        {/* Add more stats here */}
      </div>


      {/* Main Content Area - The Bracket & Standings */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[500px]">
        {/* Bracket (Takes up 3/4 space) */}
        <div className="lg:col-span-3 glass-panel rounded-xl border-white/10 overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
          <div className="absolute inset-0 overflow-auto custom-scrollbar p-8">
            <BracketDisplay tournament={tournament} />
          </div>
        </div>

        {/* Standings (Takes up 1/4 space) */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <h3 className="font-heading font-bold text-xl text-white px-2">Standings</h3>
          <StandingsTable tournament={tournament} />
        </div>
      </div>
    </div>
  );
}

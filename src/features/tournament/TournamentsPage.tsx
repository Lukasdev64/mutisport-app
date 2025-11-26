import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournamentStore } from './store/tournamentStore';
import { useTournaments, useArchiveTournament } from '@/hooks/useTournaments';
import { ALL_MOCK_TOURNAMENTS } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Plus, Search, Filter, Trophy, Calendar, Users, Archive, ArchiveRestore, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSportStore } from '@/store/sportStore';
import { SPORTS } from '@/types/sport';

export function TournamentsPage() {
  const navigate = useNavigate();
  const activeSport = useSportStore((state) => state.activeSport);
  const activeSportInfo = SPORTS[activeSport];
  const { tournaments: localTournaments } = useTournamentStore();
  const archiveMutation = useArchiveTournament();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Use React Query hook for data fetching (Supabase)
  const { data: remoteTournaments = [] } = useTournaments();

  // Combine local Zustand store + remote Supabase tournaments (deduplicate by ID)
  const localForSport = localTournaments.filter(t => t.sport === activeSport);
  const remoteForSport = remoteTournaments.filter(t => t.sport === activeSport);
  const mockTournamentsForSport = ALL_MOCK_TOURNAMENTS.filter(mt => mt.sport === activeSport);

  // Merge all sources, keeping first occurrence (local > remote > mock)
  const allTournaments = [...localForSport, ...remoteForSport, ...mockTournamentsForSport]
    .filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i);
  
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'draft' | 'archived'>('all');
  const [search, setSearch] = useState('');

  const filteredTournaments = allTournaments.filter(t => {
    // Exclude archived unless explicitly viewing archived
    if (filter !== 'archived' && t.archived) return false;
    if (filter === 'archived' && !t.archived) return false;
    
    const matchesFilter = filter === 'all' || filter === 'archived' || t.status === filter;
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">{activeSportInfo.emoji}</span>
            <h1 className="text-3xl font-heading font-bold text-white">{activeSportInfo.name} Tournaments</h1>
          </div>
          <p className="text-slate-400">Manage and track your {activeSportInfo.name.toLowerCase()} competitions</p>
        </div>
        <Button onClick={() => navigate('/tournaments/new')} className="bg-blue-600 hover:bg-blue-500">
          <Plus className="w-4 h-4 mr-2" />
          Create Tournament
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search tournaments..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {(['all', 'active', 'completed', 'draft', 'archived'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize whitespace-nowrap",
                filter === f 
                  ? "bg-white/10 text-white border border-white/10" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              {f === 'archived' ? 'Archived' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTournaments.map((tournament, index) => (
          <motion.div
            key={tournament.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-slate-900/50 border border-white/10 rounded-xl p-6 hover:border-blue-500/50 transition-all overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Trophy className="w-24 h-24 text-blue-500 rotate-12" />
            </div>

            {/* Actions Menu */}
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(activeMenu === tournament.id ? null : tournament.id);
                }}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-slate-400" />
              </button>
              
              <AnimatePresence>
                {activeMenu === tournament.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-10 bg-slate-800 border border-white/10 rounded-lg shadow-xl overflow-hidden min-w-[160px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {tournament.archived ? (
                      <button
                        onClick={() => {
                          archiveMutation.mutate({ id: tournament.id, archived: false });
                          setActiveMenu(null);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2"
                      >
                        <ArchiveRestore className="w-4 h-4" />
                        Unarchive
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          archiveMutation.mutate({ id: tournament.id, archived: true });
                          setActiveMenu(null);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-white/10 transition-colors flex items-center gap-2"
                      >
                        <Archive className="w-4 h-4" />
                        Archive
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div 
              onClick={() => navigate(`/tournaments/${tournament.id}`)}
              className="relative z-10 space-y-4 cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <span className={cn(
                  "px-2 py-1 rounded text-xs font-medium uppercase tracking-wider border",
                  tournament.status === 'active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  tournament.status === 'completed' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                  "bg-slate-500/10 text-slate-400 border-slate-500/20"
                )}>
                  {tournament.status}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">{tournament.name}</h3>
                <p className="text-slate-500 text-sm capitalize">{tournament.format.replace('_', ' ')}</p>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {tournament.players.length} Players
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(tournament.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </motion.div>
        ))}

        {filteredTournaments.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-500">
            <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No tournaments found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

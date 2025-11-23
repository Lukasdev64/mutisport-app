import { motion } from 'framer-motion';
import { Trophy, Users, Calendar, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
// import { useToast } from '@/components/ui/toast';
import { useSportStats, useSportFilteredTournaments } from '@/hooks/useSportFilter';
import { useSportStore } from '@/store/sportStore';
import { SPORTS } from '@/types/sport';

export function Dashboard() {
  // const { toast } = useToast();
  const navigate = useNavigate();
  const activeSport = useSportStore((state) => state.activeSport);
  const activeSportInfo = SPORTS[activeSport];
  
  // Get sport-filtered data
  const stats = useSportStats();
  const tournaments = useSportFilteredTournaments();
  const recentTournaments = tournaments.slice(0, 3);

  const statsCards = [
    { label: 'Active Tournaments', value: stats.activeTournaments.toString(), icon: Trophy, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Total Players', value: stats.totalPlayers.toString(), icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Completed', value: stats.completedTournaments.toString(), icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl">{activeSportInfo.emoji}</span>
            <h1 className="text-3xl font-heading font-bold text-white">{activeSportInfo.name} Dashboard</h1>
          </div>
          <p className="text-slate-400 mt-1">Welcome back to your {activeSportInfo.name.toLowerCase()} tournaments</p>
        </div>
        <Link to="/tournaments/new">
          <Button className="bg-blue-600 hover:bg-blue-500">
            Create Tournament
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-panel p-6 rounded-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                <h3 className="text-3xl font-bold text-white mt-2">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-heading font-semibold text-white">Recent Tournaments</h2>
            <Button variant="ghost" size="sm" className="text-slate-400" onClick={() => navigate('/tournaments')}>View All</Button>
          </div>
          <div className="space-y-4">
            {recentTournaments.length > 0 ? (
              recentTournaments.map((tournament) => (
                <div 
                  key={tournament.id} 
                  onClick={() => navigate(`/tournaments/${tournament.id}`)}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-400 font-bold">
                      {activeSportInfo.emoji}
                    </div>
                    <div>
                      <h4 className="text-white font-medium group-hover:text-blue-400 transition-colors">{tournament.name}</h4>
                      <p className="text-xs text-slate-500 capitalize">{tournament.format.replace('_', ' ')} • {tournament.players.length} Players</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Trophy className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No {activeSportInfo.name.toLowerCase()} tournaments yet</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-heading font-semibold text-white">Live Matches</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-500 font-medium">LIVE</span>
            </div>
          </div>
          {/* Placeholder for Live Matches */}
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 border border-dashed border-slate-700 rounded-lg">
            <Trophy className="w-8 h-8 mb-2 opacity-50" />
            <p>No live matches currently</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

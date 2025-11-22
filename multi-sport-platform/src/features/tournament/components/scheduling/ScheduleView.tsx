import { useState } from 'react';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { ScheduledMatch, Resource } from '../../logic/schedulingEngine';
import { cn } from '@/lib/utils';

interface ScheduleViewProps {
  matches: ScheduledMatch[];
  resources: Resource[];
  startDate: Date;
}

export function ScheduleView({ matches, resources, startDate }: ScheduleViewProps) {
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');

  // Group matches by resource
  const matchesByResource = resources.reduce((acc, resource) => {
    acc[resource.id] = matches.filter(m => m.resourceId === resource.id);
    return acc;
  }, {} as Record<string, ScheduledMatch[]>);

  const formatTime = (isoString?: string) => {
    if (!isoString) return 'TBD';
    return new Date(isoString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          Planning des Matchs
        </h3>
        <div className="flex bg-slate-900 rounded-lg p-1 border border-white/10">
          <button
            onClick={() => setViewMode('timeline')}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              viewMode === 'timeline' ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
            )}
          >
            Timeline
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              viewMode === 'list' ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
            )}
          >
            Liste
          </button>
        </div>
      </div>

      {viewMode === 'timeline' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map(resource => (
            <div key={resource.id} className="bg-slate-900/50 border border-white/5 rounded-xl overflow-hidden">
              <div className="bg-slate-800/50 p-4 border-b border-white/5 flex justify-between items-center">
                <div className="font-semibold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  {resource.name}
                </div>
                <div className="text-xs text-slate-400 uppercase tracking-wider">{resource.type}</div>
              </div>
              
              <div className="p-4 space-y-3 min-h-[200px]">
                {matchesByResource[resource.id]?.length > 0 ? (
                  matchesByResource[resource.id].map(match => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-slate-800 border border-white/10 rounded-lg p-3 hover:border-blue-500/50 transition-colors group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-1.5 text-blue-400 text-xs font-medium bg-blue-500/10 px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3" />
                          {formatTime(match.scheduledAt)}
                        </div>
                        <div className="text-xs text-slate-500">Match #{match.id.slice(0, 4)}</div>
                      </div>
                      
                      <div className="space-y-1">
                        {match.players.map(player => (
                          <div key={player.id} className="flex items-center gap-2 text-sm text-slate-300">
                            <User className="w-3 h-3 text-slate-500" />
                            {player.name}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500 text-sm italic">
                    Aucun match prévu
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/50 text-slate-400">
              <tr>
                <th className="p-4 font-medium">Heure</th>
                <th className="p-4 font-medium">Lieu</th>
                <th className="p-4 font-medium">Match</th>
                <th className="p-4 font-medium">Joueurs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {matches.sort((a, b) => (a.scheduledAt || '').localeCompare(b.scheduledAt || '')).map(match => (
                <tr key={match.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white font-medium">{formatTime(match.scheduledAt)}</td>
                  <td className="p-4 text-slate-300">{match.location || 'TBD'}</td>
                  <td className="p-4 text-slate-400">#{match.id.slice(0, 6)}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      {match.players.map(p => (
                        <span key={p.id} className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs border border-white/10">
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

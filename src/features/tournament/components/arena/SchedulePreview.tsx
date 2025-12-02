import { Calendar, Clock, MapPin, Check, AlertTriangle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ScheduledMatch } from '../../logic/schedulingEngine';
import { getScheduleStats } from '../../hooks/useScheduleGeneration';
import type { Tournament } from '@/types/tournament';

interface SchedulePreviewProps {
  schedule: ScheduledMatch[];
  tournament: Tournament;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SchedulePreview({
  schedule,
  tournament,
  onConfirm,
  onCancel
}: SchedulePreviewProps) {
  const stats = getScheduleStats(schedule);

  // Group matches by date
  const matchesByDate = schedule.reduce((acc, match) => {
    if (!match.scheduledAt) return acc;
    const date = match.scheduledAt.split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(match);
    return acc;
  }, {} as Record<string, ScheduledMatch[]>);

  // Get player name by ID
  const getPlayerName = (playerId?: string) => {
    if (!playerId) return 'TBD';
    const player = tournament.players.find(p => p.id === playerId);
    return player?.name || 'Unknown';
  };

  // Check for constraint violations
  const hasViolations = schedule.some(m => m.location?.includes('⚠️'));

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-800/50 rounded-lg text-center">
            <div className="text-2xl font-bold text-white">{stats.totalMatches}</div>
            <div className="text-xs text-slate-400">Matchs</div>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg text-center">
            <div className="text-2xl font-bold text-white">{stats.daysCount}</div>
            <div className="text-xs text-slate-400">Jour(s)</div>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg text-center">
            <div className="text-2xl font-bold text-white">{stats.resourcesUsed}</div>
            <div className="text-xs text-slate-400">Ressources</div>
          </div>
          <div className="p-3 bg-slate-800/50 rounded-lg text-center">
            <div className="text-lg font-medium text-white">
              {stats.startTime} - {stats.endTime}
            </div>
            <div className="text-xs text-slate-400">Plage horaire</div>
          </div>
        </div>
      )}

      {/* Warnings */}
      {hasViolations && (
        <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <AlertTriangle className="text-amber-400" size={16} />
          <span className="text-sm text-amber-400">
            Certains matchs ont des conflits de contraintes. Vérifiez les disponibilités des joueurs.
          </span>
        </div>
      )}

      {/* Schedule by Date */}
      <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2">
        {Object.entries(matchesByDate).map(([date, matches]) => (
          <div key={date}>
            <div className="sticky top-0 flex items-center gap-2 py-2 bg-slate-900/90 backdrop-blur-sm">
              <Calendar size={14} className="text-blue-400" />
              <span className="text-sm font-medium text-white">
                {new Date(date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </span>
              <span className="text-xs text-slate-500">
                ({matches.length} matchs)
              </span>
            </div>

            <div className="space-y-2">
              {matches
                .sort((a, b) => {
                  if (!a.scheduledAt || !b.scheduledAt) return 0;
                  return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
                })
                .map(match => (
                  <div
                    key={match.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      match.location?.includes('⚠️')
                        ? 'bg-amber-500/5 border-amber-500/20'
                        : 'bg-slate-800/30 border-white/5'
                    }`}
                  >
                    {/* Time */}
                    <div className="text-sm font-mono text-slate-300 w-14">
                      <Clock size={12} className="inline mr-1" />
                      {match.scheduledAt
                        ? new Date(match.scheduledAt).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : '--:--'}
                    </div>

                    {/* Location */}
                    <div className="text-xs text-slate-400 w-20 truncate" title={match.location}>
                      <MapPin size={12} className="inline mr-1" />
                      {match.location?.replace(' (⚠️ Constraint violation)', '') || 'N/A'}
                    </div>

                    {/* Players */}
                    <div className="flex-1 flex items-center gap-2 text-sm">
                      <Users size={12} className="text-slate-500" />
                      <span className="text-white">{getPlayerName(match.player1Id)}</span>
                      <span className="text-slate-500">vs</span>
                      <span className="text-white">{getPlayerName(match.player2Id)}</span>
                    </div>

                    {/* Status indicator */}
                    {match.status === 'completed' && (
                      <Check size={14} className="text-emerald-400" />
                    )}
                    {match.location?.includes('⚠️') && (
                      <AlertTriangle size={14} className="text-amber-400" />
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
        <Button variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={onConfirm} className="bg-emerald-600 hover:bg-emerald-500">
          <Check size={16} className="mr-2" />
          Valider le planning
        </Button>
      </div>
    </div>
  );
}

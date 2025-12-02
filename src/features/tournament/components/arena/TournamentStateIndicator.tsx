import { Calendar, CheckCircle2, AlertCircle, Play, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Tournament } from '@/types/tournament';
import { TournamentEngine } from '../../logic/engine';
import { cn } from '@/lib/utils';

interface TournamentStateIndicatorProps {
  tournament: Tournament;
  onOpenScheduling: () => void;
}

export function TournamentStateIndicator({ tournament, onOpenScheduling }: TournamentStateIndicatorProps) {
  const { state, stats } = TournamentEngine.getTournamentSchedulingState(tournament);

  // Find tournament winner (from final match or standings)
  const getWinnerName = (): string | undefined => {
    // For single elimination, find the final match (last round, first match)
    if (tournament.format === 'single_elimination' && tournament.rounds.length > 0) {
      const finalRound = tournament.rounds[tournament.rounds.length - 1];
      const finalMatch = finalRound.matches[0];
      if (finalMatch?.result?.winnerId) {
        const winner = tournament.players.find(p => p.id === finalMatch.result?.winnerId);
        return winner?.name;
      }
    }
    // For round robin/swiss, use standings
    const standings = TournamentEngine.getStandings(tournament);
    if (standings.length > 0 && standings[0].played > 0) {
      const topPlayer = tournament.players.find(p => p.id === standings[0].playerId);
      return topPlayer?.name;
    }
    return undefined;
  };

  const configs: Record<typeof state, {
    icon: React.ReactNode;
    bgColor: string;
    borderColor: string;
    textColor: string;
    message: string;
    action?: { label: string; onClick: () => void };
  }> = {
    no_bracket: {
      icon: <Calendar className="w-4 h-4" />,
      bgColor: 'bg-slate-800/50',
      borderColor: 'border-slate-700',
      textColor: 'text-slate-400',
      message: 'No bracket generated yet',
    },
    ready_to_schedule: {
      icon: <Calendar className="w-4 h-4" />,
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-400',
      message: `${stats.totalMatches} matchs à planifier`,
      action: { label: 'Générer le planning', onClick: onOpenScheduling },
    },
    partially_scheduled: {
      icon: <AlertCircle className="w-4 h-4" />,
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400',
      message: `${stats.scheduledMatches}/${stats.totalMatches} matchs planifiés`,
      action: { label: 'Compléter', onClick: onOpenScheduling },
    },
    fully_scheduled: {
      icon: <CheckCircle2 className="w-4 h-4" />,
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      message: stats.firstMatchDate
        ? `Tous les matchs planifiés • Début: ${formatDate(stats.firstMatchDate)}`
        : 'Tous les matchs planifiés',
    },
    in_progress: {
      icon: <Play className="w-4 h-4" />,
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-400',
      message: `En cours • ${stats.completedMatches}/${stats.totalMatches} matchs terminés`,
    },
    completed: {
      icon: <Trophy className="w-4 h-4" />,
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30',
      textColor: 'text-yellow-400',
      message: getWinnerName()
        ? `Tournoi terminé • Vainqueur: ${getWinnerName()}`
        : 'Tournoi terminé',
    },
  };

  // Don't show only if no bracket exists
  if (state === 'no_bracket') {
    return null;
  }

  const config = configs[state];

  // Show next match info for in_progress state
  const nextMatchInfo = state === 'in_progress' && stats.nextMatch?.scheduledAt
    ? ` • Prochain: ${formatTime(stats.nextMatch.scheduledAt)}`
    : '';

  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-2 rounded-lg border transition-all',
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="flex items-center gap-3">
        <div className={config.textColor}>
          {config.icon}
        </div>
        <span className={cn('text-sm font-medium', config.textColor)}>
          {config.message}{nextMatchInfo}
        </span>
      </div>

      {config.action && (
        <Button
          size="sm"
          variant="ghost"
          className={cn('h-7 text-xs', config.textColor, 'hover:bg-white/10')}
          onClick={config.action.onClick}
        >
          {config.action.label}
        </Button>
      )}
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

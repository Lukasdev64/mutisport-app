import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Match, Tournament } from '@/types/tournament';
import { useUpdateMatch } from '@/hooks/useTournaments';
import { cn } from '@/lib/utils';

interface SchedulePopoverProps {
  match: Match;
  tournament: Tournament;
  isOpen: boolean;
  onClose: () => void;
}

export function SchedulePopover({ match, tournament, isOpen, onClose }: SchedulePopoverProps) {
  const updateMatchMutation = useUpdateMatch();
  const popoverRef = useRef<HTMLDivElement>(null);

  // Local form state
  const [date, setDate] = useState(
    match.scheduledAt ? new Date(match.scheduledAt).toISOString().split('T')[0] : ''
  );
  const [time, setTime] = useState(
    match.scheduledAt
      ? new Date(match.scheduledAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      : ''
  );
  const [resourceId, setResourceId] = useState(match.resourceId || '');

  // Reset form when match changes
  useEffect(() => {
    if (match.scheduledAt) {
      const scheduledDate = new Date(match.scheduledAt);
      setDate(scheduledDate.toISOString().split('T')[0]);
      setTime(scheduledDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    } else {
      setDate('');
      setTime('');
    }
    setResourceId(match.resourceId || '');
  }, [match]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSave = () => {
    // Build scheduledAt from date and time
    let scheduledAt: string | undefined;
    if (date && time) {
      const [hours, minutes] = time.split(':');
      const dateObj = new Date(date);
      dateObj.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      scheduledAt = dateObj.toISOString();
    }

    // Find resource name for location
    const resource = tournament.schedulingConfig?.resources.find(r => r.id === resourceId);
    const location = resource?.name;

    updateMatchMutation.mutate({
      tournamentId: tournament.id,
      matchId: match.id,
      data: {
        scheduledAt,
        resourceId: resourceId || undefined,
        location,
        status: scheduledAt ? 'scheduled' : match.status,
      }
    });

    onClose();
  };

  const handleClear = () => {
    updateMatchMutation.mutate({
      tournamentId: tournament.id,
      matchId: match.id,
      data: {
        scheduledAt: undefined,
        resourceId: undefined,
        location: undefined,
        status: 'pending',
      }
    });
    onClose();
  };

  const resources = tournament.schedulingConfig?.resources || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="relative bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-72"
            onClick={(e) => e.stopPropagation()}
          >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/50 rounded-t-xl">
            <h4 className="text-sm font-semibold text-white">Planifier le match</h4>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <div className="p-4 space-y-4 relative z-50">
            {/* Date */}
            <div className="space-y-1.5 relative z-20">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={cn(
                  'w-full h-9 px-3 rounded-lg text-sm',
                  'bg-slate-800 border border-slate-700',
                  'text-white placeholder:text-slate-500',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500',
                  'transition-colors'
                )}
              />
            </div>

            {/* Time */}
            <div className="space-y-1.5 relative z-10">
              <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Heure
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={cn(
                  'w-full h-9 px-3 rounded-lg text-sm',
                  'bg-slate-800 border border-slate-700',
                  'text-white placeholder:text-slate-500',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500',
                  'transition-colors'
                )}
              />
            </div>

            {/* Resource/Court */}
            {resources.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" />
                  Court / Terrain
                </label>
                <select
                  value={resourceId}
                  onChange={(e) => setResourceId(e.target.value)}
                  className={cn(
                    'w-full h-9 px-3 rounded-lg text-sm',
                    'bg-slate-800 border border-slate-700',
                    'text-white',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500',
                    'transition-colors'
                  )}
                >
                  <option value="">Sélectionner...</option>
                  {resources.map((resource) => (
                    <option key={resource.id} value={resource.id}>
                      {resource.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700 bg-slate-800/30 rounded-b-xl relative z-0">
            {match.scheduledAt ? (
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8"
                onClick={handleClear}
              >
                Supprimer
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-xs h-8"
                onClick={onClose}
              >
                Annuler
              </Button>
              <Button
                size="sm"
                className="text-xs h-8 bg-blue-600 hover:bg-blue-500"
                onClick={handleSave}
                disabled={!date || !time}
              >
                <Check className="w-3 h-3 mr-1" />
                Enregistrer
              </Button>
            </div>
          </div>
        </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Lightweight inline schedule display for MatchCard
interface ScheduleInfoProps {
  match: Match;
  onClick?: (e: React.MouseEvent) => void;
  compact?: boolean;
}

export function ScheduleInfo({ match, onClick, compact }: ScheduleInfoProps) {
  if (!match.scheduledAt) return null;

  const date = new Date(match.scheduledAt);
  const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 w-full transition-colors group',
        compact ? 'px-2 py-1.5' : 'px-3 py-2',
        'border-t border-white/5 bg-slate-800/30 hover:bg-slate-800/60'
      )}
    >
      <Clock className="w-3 h-3 text-blue-400 shrink-0" />
      <span className="text-xs text-slate-300 group-hover:text-white transition-colors">
        {timeStr}
      </span>
      <span className="text-xs text-slate-500">•</span>
      <span className="text-xs text-slate-400">{dateStr}</span>
      {match.location && (
        <>
          <span className="text-xs text-slate-500">•</span>
          <span className="text-xs text-slate-400 flex items-center gap-1 truncate">
            <MapPin className="w-3 h-3 shrink-0" />
            {match.location}
          </span>
        </>
      )}
    </button>
  );
}

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Settings, Share2, Calendar, Zap, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MobileQuickActionsProps } from '@/types/arena';
import type { Match } from '@/types/tournament';

/**
 * Floating Action Button with contextual quick actions.
 * Actions vary based on user role:
 * - Organizer: Settings, Schedule, Share, Score
 * - Referee: Score (primary), Share
 * - Spectator: Share only
 */
export function MobileQuickActions({
  role,
  tournament,
  onSettings,
  onShare,
  onScoreMatch,
}: MobileQuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Find next unfinished match for quick scoring
  const nextMatch = useMemo((): Match | null => {
    for (const round of tournament.rounds) {
      for (const match of round.matches) {
        if (!match.result?.winnerId && match.player1Id && match.player2Id) {
          return match;
        }
      }
    }
    return null;
  }, [tournament.rounds]);

  // Build actions based on role
  const actions = useMemo(() => {
    const items: Array<{
      id: string;
      icon: typeof Settings;
      label: string;
      onClick: () => void;
      primary?: boolean;
      color?: string;
    }> = [];

    // Organizer-specific actions
    if (role === 'organizer') {
      items.push({
        id: 'settings',
        icon: Settings,
        label: 'Paramètres',
        onClick: () => {
          onSettings();
          setIsOpen(false);
        },
      });
      items.push({
        id: 'schedule',
        icon: Calendar,
        label: 'Planning',
        onClick: () => {
          // TODO: Open schedule modal
          setIsOpen(false);
        },
      });
    }

    // Score action for organizer/referee with a pending match
    if ((role === 'organizer' || role === 'referee') && nextMatch && onScoreMatch) {
      items.push({
        id: 'score',
        icon: Zap,
        label: 'Scorer prochain',
        onClick: () => {
          onScoreMatch(nextMatch.id);
          setIsOpen(false);
        },
        primary: true,
        color: 'emerald',
      });
    }

    // Share action for everyone
    items.push({
      id: 'share',
      icon: Share2,
      label: 'Partager',
      onClick: () => {
        onShare();
        setIsOpen(false);
      },
    });

    return items;
  }, [role, nextMatch, onSettings, onShare, onScoreMatch]);

  // Only show FAB if there are actions
  if (actions.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-30 md:hidden">
      {/* Action buttons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div className="absolute bottom-16 right-0 flex flex-col gap-3 items-end">
            {actions.map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  transition: { delay: index * 0.05 },
                }}
                exit={{
                  opacity: 0,
                  x: 20,
                  scale: 0.8,
                  transition: { delay: (actions.length - index - 1) * 0.03 },
                }}
                onClick={action.onClick}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 rounded-full shadow-lg touch-target transition-colors',
                  action.primary
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-white/10'
                )}
              >
                <action.icon className="w-5 h-5" />
                <span className="text-sm font-medium whitespace-nowrap">
                  {action.label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-14 h-14 rounded-full shadow-lg flex items-center justify-center touch-target transition-colors',
          isOpen
            ? 'bg-slate-700 text-white'
            : 'bg-blue-600 hover:bg-blue-500 text-white'
        )}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 300 }}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </motion.div>
      </motion.button>

      {/* Quick score badge when closed */}
      {!isOpen && nextMatch && (role === 'organizer' || role === 'referee') && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"
        >
          <Zap className="w-3 h-3 text-white" />
        </motion.div>
      )}
    </div>
  );
}

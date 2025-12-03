import { motion } from 'framer-motion';
import { GitBranch, Swords, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ArenaTab } from '@/types/arena';

interface ArenaBottomNavProps {
  activeTab: ArenaTab;
  onTabChange: (tab: ArenaTab) => void;
}

const tabs: { id: ArenaTab; label: string; icon: typeof GitBranch }[] = [
  { id: 'bracket', label: 'Bracket', icon: GitBranch },
  { id: 'matches', label: 'Matchs', icon: Swords },
  { id: 'standings', label: 'Classement', icon: Trophy },
];

/**
 * Mobile-specific bottom navigation for tournament arena.
 * Fixed at bottom, shows 3 main tabs with active indicator animation.
 */
export function ArenaBottomNav({ activeTab, onTabChange }: ArenaBottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-xl border-t border-white/10 safe-area-bottom md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'relative flex flex-col items-center justify-center flex-1 h-full gap-1 py-2 transition-colors touch-target no-zoom',
                isActive ? 'text-blue-400' : 'text-slate-400'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="arena-tab-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-blue-500 rounded-b-full"
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}

              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              >
                <Icon className={cn('h-5 w-5', isActive && 'fill-current/20')} />
              </motion.div>

              <span className="text-[10px] font-medium truncate max-w-[70px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

import { useState, useRef, useEffect } from 'react';
import { useSportStore } from '@/store/sportStore';
import { SPORTS, type SportType } from '@/types/sport';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Explicit color classes to avoid Tailwind purge issues
const sportColorClasses: Record<SportType, { bg: string; text: string; border: string }> = {
  tennis: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  football: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  basketball: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  ping_pong: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  chess: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
  generic: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
};

interface SportSwitcherProps {
  collapsed?: boolean;
}

export function SportSwitcher({ collapsed = false }: SportSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeSport = useSportStore((state) => state.activeSport);
  const setActiveSport = useSportStore((state) => state.setActiveSport);
  const currentSport = SPORTS[activeSport];
  const colors = sportColorClasses[activeSport];

  // Filter out 'generic' sport
  const availableSports = Object.values(SPORTS).filter((s) => s.id !== 'generic');

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleSportSelect = (sportId: SportType) => {
    setActiveSport(sportId);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative group">
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2.5 rounded-lg',
          'border transition-all duration-200',
          colors.bg,
          colors.border,
          'hover:bg-white/10',
          collapsed ? 'justify-center' : 'justify-between'
        )}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xl">{currentSport.emoji}</span>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className={cn('font-medium text-sm truncate', colors.text)}
              >
                {currentSport.name}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        {!collapsed && (
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
          </motion.div>
        )}
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute top-full mt-2 z-50',
              'bg-slate-900 border border-white/10 rounded-xl shadow-xl',
              'overflow-hidden min-w-[180px]',
              collapsed ? 'left-0' : 'left-0 right-0'
            )}
          >
            <div className="py-1">
              {availableSports.map((sport) => {
                const sportColors = sportColorClasses[sport.id];
                const isActive = activeSport === sport.id;

                return (
                  <button
                    key={sport.id}
                    onClick={() => handleSportSelect(sport.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5',
                      'text-left transition-all duration-150',
                      isActive
                        ? cn(sportColors.bg, sportColors.text)
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <span className="text-lg">{sport.emoji}</span>
                    <span className="font-medium text-sm flex-1">{sport.name}</span>
                    {isActive && <Check className={cn('w-4 h-4', sportColors.text)} />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip for collapsed state */}
      {collapsed && !isOpen && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-800 text-xs rounded-lg whitespace-nowrap z-50 border border-white/10 shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
          {currentSport.name}
        </div>
      )}
    </div>
  );
}

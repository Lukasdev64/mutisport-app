import { useSportStore } from '@/store/sportStore';
import { SPORTS, type SportType } from '@/types/sport';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SportSelector() {
  const { activeSport, setActiveSport } = useSportStore();
  
  const handleSportChange = (sportId: SportType) => {
    if (confirm(`Switch to ${SPORTS[sportId].name}? This will change the context to ${SPORTS[sportId].name}-specific tournaments and data.`)) {
      setActiveSport(sportId);
      // Reload to apply new context
      window.location.reload();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-heading font-bold text-white mb-1">Active Sport</h3>
        <p className="text-sm text-slate-400">Select your primary sport to customize the experience</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Object.values(SPORTS).filter(sport => sport.id !== 'generic').map((sport) => (
          <motion.button
            key={sport.id}
            onClick={() => handleSportChange(sport.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative p-4 rounded-lg border transition-all",
              activeSport === sport.id
                ? `border-${sport.color}-500 bg-${sport.color}-500/10`
                : "border-white/10 bg-slate-900/50 hover:border-white/20"
            )}
          >
            {activeSport === sport.id && (
              <div className="absolute top-2 right-2">
                <Check className={`w-4 h-4 text-${sport.color}-400`} />
              </div>
            )}
            
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl">{sport.emoji}</span>
              <span className={cn(
                "font-medium text-sm",
                activeSport === sport.id ? `text-${sport.color}-400` : "text-slate-300"
              )}>
                {sport.name}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
      
      <div className="glass-panel p-4 rounded-lg">
        <p className="text-xs text-slate-400">
          <strong className="text-slate-300">Current:</strong> {SPORTS[activeSport].emoji} {SPORTS[activeSport].name}
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Switching sports will reload the app with sport-specific configurations
        </p>
      </div>
    </div>
  );
}

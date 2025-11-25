import { useWizardStore } from '../../store/wizardStore';
import { Zap, Calendar, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function ModeSelection() {
  const { mode, setMode } = useWizardStore();

  const modes = [
    {
      id: 'instant',
      name: 'Jouer tout de suite',
      description: 'Créez un tournoi rapidement avec les joueurs présents.',
      icon: Zap,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
      hover: 'group-hover:border-yellow-500/50'
    },
    {
      id: 'planned',
      name: 'Planifier un tournoi',
      description: 'Envoyez des invitations, gérez les inscriptions et planifiez à l\'avance.',
      icon: Calendar,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      hover: 'group-hover:border-blue-500/50'
    }
  ] as const;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-white">Comment voulez-vous jouer ?</h2>
        <p className="text-slate-400">Choisissez le mode qui correspond à votre besoin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modes.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setMode(item.id);
              useWizardStore.getState().nextStep();
            }}
            className={cn(
              "relative p-8 rounded-2xl border text-left transition-all duration-200 group h-full flex flex-col",
              mode === item.id 
                ? `bg-slate-800 ${item.border} ring-2 ring-offset-2 ring-offset-slate-950 ring-blue-500` 
                : `bg-slate-900/50 border-white/5 hover:bg-slate-800 ${item.hover}`
            )}
          >
            <div className={cn("p-4 rounded-xl w-fit mb-6", item.bg)}>
              <item.icon className={cn("w-8 h-8", item.color)} />
            </div>
            
            <h3 className="font-heading font-semibold text-white text-xl mb-2">{item.name}</h3>
            <p className="text-slate-400 leading-relaxed mb-6 flex-grow">{item.description}</p>

            <div className={cn(
              "flex items-center text-sm font-medium transition-colors",
              mode === item.id ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
            )}>
              Sélectionner <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
